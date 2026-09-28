const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DB_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DB_DIR, 'pcb-profiles.sqlite');
const PORT = Number(process.env.PORT || 3000);

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS pcb_profiles (
        profile_id TEXT PRIMARY KEY,
        profile_type TEXT NOT NULL,
        name TEXT NOT NULL,
        sector TEXT NOT NULL,
        mission_class TEXT NOT NULL,
        altitude_band TEXT NOT NULL,
        max_altitude_km REAL NOT NULL,
        power_class TEXT NOT NULL,
        safe_power_w REAL NOT NULL,
        nominal_power_w REAL NOT NULL,
        high_power_w REAL NOT NULL,
        warning_temp_c REAL,
        critical_temp_c REAL,
        payload_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_pcb_name ON pcb_profiles(name);
    CREATE INDEX IF NOT EXISTS idx_pcb_sector ON pcb_profiles(sector);
    CREATE INDEX IF NOT EXISTS idx_pcb_mission ON pcb_profiles(mission_class);
    CREATE INDEX IF NOT EXISTS idx_pcb_altitude ON pcb_profiles(max_altitude_km);
    CREATE INDEX IF NOT EXISTS idx_pcb_power ON pcb_profiles(power_class);

    CREATE TABLE IF NOT EXISTS hosts (
        host_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        pcb_profile_id TEXT NOT NULL,
        FOREIGN KEY (pcb_profile_id) REFERENCES pcb_profiles(profile_id)
    );

    CREATE INDEX IF NOT EXISTS idx_hosts_pcb_profile ON hosts(pcb_profile_id);

    CREATE TABLE IF NOT EXISTS host_configs (
        host_id TEXT PRIMARY KEY,
        min_voltage_v REAL NOT NULL,
        max_voltage_v REAL NOT NULL,
        max_current_a REAL NOT NULL,
        max_power_w REAL NOT NULL,
        min_temperature_c REAL NOT NULL,
        warning_temperature_c REAL NOT NULL,
        critical_temperature_c REAL NOT NULL,
        config_status TEXT NOT NULL DEFAULT 'GUARDIAN_VALIDATED',
        guardian_validated_at TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (host_id) REFERENCES hosts(host_id)
    );

    CREATE TABLE IF NOT EXISTS host_config_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT NOT NULL,
        actor TEXT NOT NULL,
        status TEXT NOT NULL,
        reason TEXT NOT NULL,
        config_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (host_id) REFERENCES hosts(host_id)
    );

    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('OPERATOR','ADMINISTRATOR')),
        display_name TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor TEXT NOT NULL,
        role TEXT NOT NULL,
        host_id TEXT,
        event_type TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mode_commands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT NOT NULL,
        actor TEXT NOT NULL,
        requested_mode TEXT NOT NULL,
        decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

`);

function seedDatabase() {
    const count = db.prepare('SELECT COUNT(*) AS count FROM pcb_profiles').get().count;
    if (Number(count) > 0) return;

    const jsonPath = path.join(DB_DIR, 'pcb-profiles-source.json');
    if (!fs.existsSync(jsonPath)) {
        console.warn('PCB source dataset not found. Database will remain empty.');
        return;
    }

    console.log('Importing 10,000 PCB profiles into SQLite...');
    const dataset = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const insert = db.prepare(`
        INSERT INTO pcb_profiles (
            profile_id, profile_type, name, sector, mission_class,
            altitude_band, max_altitude_km, power_class,
            safe_power_w, nominal_power_w, high_power_w,
            warning_temp_c, critical_temp_c, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN');
    try {
        for (const p of dataset.profiles || []) {
            const env = p.environment || {};
            const temp = env.temperature_reference_c || {};
            const cfg = p.configuration || {};
            const modes = p.guardian_modes || {};
            const electrical = p.electrical || {};
            const altitude = Number(p.environment?.maximum_reference_altitude_km ?? 0);

            insert.run(
                p.profile_id,
                p.profile_type || 'HIGH_ALTITUDE_REFERENCE_CLASS',
                p.name,
                p.sector || 'Unclassified',
                p.mission_class || 'CUSTOM',
                env.altitude_band || 'Unknown',
                altitude,
                electrical.power_class || 'unknown',
                Number(modes.SAFE?.max_reference_power_w ?? cfg.safe_power_reference_w ?? 0),
                Number(modes.NOMINAL?.max_reference_power_w ?? cfg.nominal_max_power_reference_w ?? 0),
                Number(modes.HIGH?.max_reference_power_w ?? cfg.high_power_reference_w ?? 0),
                Number(temp.warning ?? 0),
                Number(temp.critical ?? 0),
                JSON.stringify(p)
            );
        }
        db.exec('COMMIT');
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }

    console.log(`Imported ${dataset.profiles?.length || 0} PCB profiles.`);
}

seedDatabase();

const sessions = new Map();
const SESSION_COOKIE = 'altisguardian_session';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, expected] = String(stored).split(':');
    if (!salt || !expected) return false;
    const actual = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

function seedUsers() {
    const count = Number(db.prepare('SELECT COUNT(*) AS count FROM users').get().count);
    if (count > 0) return;

    const now = nowIso();
    const insert = db.prepare(`
        INSERT INTO users (username, password_hash, role, display_name, active, created_at)
        VALUES (?, ?, ?, ?, 1, ?)
    `);

    insert.run('admin', hashPassword('admin123'), 'ADMINISTRATOR', 'Administrator', now);
    insert.run('operator', hashPassword('operator123'), 'OPERATOR', 'Operator', now);

    console.log('Seeded local test accounts: admin / admin123 and operator / operator123');
}

function parseCookies(req) {
    const raw = req.headers.cookie || '';
    const cookies = {};
    for (const part of raw.split(';')) {
        const [key, ...rest] = part.trim().split('=');
        if (key) cookies[key] = decodeURIComponent(rest.join('='));
    }
    return cookies;
}

function getSessionUser(req) {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (!token) return null;
    const session = sessions.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
        sessions.delete(token);
        return null;
    }
    return session.user;
}

function requireAuth(req, res, roles = null) {
    const user = getSessionUser(req);
    if (!user) {
        sendJson(res, 401, { error: 'Authentication required.' });
        return null;
    }
    if (roles && !roles.includes(user.role)) {
        sendJson(res, 403, { error: 'Insufficient permissions.' });
        return null;
    }
    return user;
}

function writeAudit(actor, role, hostId, eventType, status, description, metadata = {}) {
    db.prepare(`
        INSERT INTO audit_events
        (actor, role, host_id, event_type, status, description, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(actor, role, hostId || null, eventType, status, description, JSON.stringify(metadata), nowIso());
}

function validateModeForServer(hostId, requestedMode) {
    const host = getHostWithProfile(hostId);
    if (!host) return { accepted: false, reason: 'Host not found.' };

    const config = getHostConfig(hostId);
    if (!config) return { accepted: false, reason: 'Active Guardian configuration is unavailable.' };

    if (!['SAFE', 'NOMINAL', 'HIGH'].includes(requestedMode)) {
        return { accepted: false, reason: 'Unknown performance mode.' };
    }

    // SAFE is always allowed when the Guardian is available.
    if (requestedMode === 'SAFE') {
        return {
            accepted: true,
            reason: 'SAFE accepted by Guardian as a protective fallback.'
        };
    }

    const telemetry = getSimulatedTelemetryForHost(hostId);
    if (!Number.isFinite(telemetry.voltage) ||
        !Number.isFinite(telemetry.current) ||
        !Number.isFinite(telemetry.power) ||
        !Number.isFinite(telemetry.temperature)) {
        return { accepted: false, reason: 'Telemetry is incomplete; Guardian cannot safely approve this mode.' };
    }

    if (telemetry.voltage < config.min_voltage_v || telemetry.voltage > config.max_voltage_v) {
        return { accepted: false, reason: 'Voltage is outside the active protection envelope.' };
    }
    if (telemetry.current > config.max_current_a) {
        return { accepted: false, reason: 'Current exceeds the active protection limit.' };
    }
    if (telemetry.power > config.max_power_w) {
        return { accepted: false, reason: 'Power exceeds the active protection limit.' };
    }
    if (telemetry.temperature < config.min_temperature_c || telemetry.temperature >= config.critical_temperature_c) {
        return { accepted: false, reason: 'Temperature is outside the active operating envelope.' };
    }

    if (requestedMode === 'HIGH') {
        if (telemetry.temperature >= config.warning_temperature_c) {
            return { accepted: false, reason: 'HIGH is blocked at or above the warning temperature.' };
        }
        if (telemetry.power > config.max_power_w * 0.85) {
            return { accepted: false, reason: 'HIGH requires power below 85% of the active maximum.' };
        }
    }

    if (requestedMode === 'NOMINAL') {
        if (telemetry.temperature >= config.warning_temperature_c) {
            return { accepted: false, reason: 'NOMINAL is blocked at or above the warning temperature. Select SAFE.' };
        }
    }

    return { accepted: true, reason: `${requestedMode} accepted by Guardian.` };
}

function getSimulatedTelemetryForHost(hostId) {
    const host = getHostWithProfile(hostId);
    const config = getHostConfig(hostId);
    if (!host || !config) return {};

    const now = Date.now() / 1000;
    const seed = [...hostId].reduce((a, c) => a + c.charCodeAt(0), 0);
    const voltage = Math.max(
        Number(config.min_voltage_v) + 0.5,
        Math.min(
            Number(config.max_voltage_v) - 0.5,
            (Number(config.min_voltage_v) + Number(config.max_voltage_v)) / 2 +
            Math.sin(now / 25 + seed) * 0.08
        )
    );

    const maxPower = Number(config.max_power_w);
    const warning = Number(config.warning_temperature_c);
    const critical = Number(config.critical_temperature_c);

    // Deterministic test scenario:
    // HOST-001 = optimal/healthy
    // HOST-002 = warning
    // HOST-003 = critical
    let powerFraction = 0.55;
    let temperature = warning - 12;

    if (hostId === 'HOST-002') {
        powerFraction = 0.92;
        temperature = warning + 2;
    } else if (hostId === 'HOST-003') {
        powerFraction = 1.08;
        temperature = critical + 2;
    }

    const power = Math.max(0.01, maxPower * powerFraction);
    const current = power / Math.max(voltage, 0.1);

    return {
        voltage,
        current,
        power,
        temperature
    };
}

seedUsers();

function seedDemoCommandHistory() {
    const rejectedCount = Number(db.prepare(`
        SELECT COUNT(*) AS count FROM mode_commands WHERE decision = 'REJECTED'
    `).get().count);
    if (rejectedCount > 0) return;

    const now = new Date();
    const earlier = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    db.prepare(`
        INSERT INTO mode_commands
        (host_id, actor, requested_mode, decision, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        'HOST-002',
        'operator',
        'HIGH',
        'REJECTED',
        'Historical test event: HIGH was rejected by the Guardian while the host was in a warning condition. Select SAFE for protective fallback.',
        earlier
    );
}

seedDemoCommandHistory();


function seedHosts() {
    const count = Number(db.prepare('SELECT COUNT(*) AS count FROM hosts').get().count);
    if (count > 0) return;

    const hosts = [
        ['HOST-001', 'High Altitude Computer', 'Primary high-altitude computing host protected by an autonomous Guardian.', 'AG-HA-00001'],
        ['HOST-002', 'Telemetry Processing Host', 'Telemetry processing system with an active thermal warning.', 'AG-HA-00011'],
        ['HOST-003', 'Experimental Computing Host', 'Experimental host system operating under Guardian protection.', 'AG-HA-00021']
    ];

    const insert = db.prepare(`
        INSERT INTO hosts (host_id, name, description, pcb_profile_id)
        VALUES (?, ?, ?, ?)
    `);

    db.exec('BEGIN');
    try {
        for (const host of hosts) insert.run(...host);
        db.exec('COMMIT');
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
}

seedHosts();
ensureHostConfigs();

function handleHosts(res) {
    const rows = db.prepare(`
        SELECT h.host_id, h.name, h.description, h.pcb_profile_id,
               p.name AS pcb_profile_name, p.sector, p.mission_class,
               p.altitude_band, p.power_class, p.safe_power_w,
               p.nominal_power_w, p.high_power_w, p.warning_temp_c,
               p.critical_temp_c,
               c.min_voltage_v, c.max_voltage_v, c.max_current_a, c.max_power_w,
               c.min_temperature_c, c.warning_temperature_c, c.critical_temperature_c,
               c.config_status, c.guardian_validated_at, c.updated_at
        FROM hosts h
        LEFT JOIN pcb_profiles p ON p.profile_id = h.pcb_profile_id
        LEFT JOIN host_configs c ON c.host_id = h.host_id
        ORDER BY h.host_id
    `).all();

    sendJson(res, 200, { hosts: rows });
}

async function readJsonBody(req) {
    return await new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 100000) {
                reject(new Error('Request body too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

function buildPCBHostDescription(profile) {
    if (!profile) return 'Guardian-protected host configured from the selected PCB profile.';

    const targets = Array.isArray(profile.deployment_targets)
        ? profile.deployment_targets.slice(0, 3).join(', ')
        : '';

    const targetText = targets
        ? ` Intended for ${targets}.`
        : '';

    return `Guardian-protected ${profile.mission_class || 'high-altitude'} system — ${profile.altitude_band || 'high-altitude'} — ${profile.power_class || 'reference'} power profile.${targetText}`;
}

async function handleHostUpdate(req, res, hostId) {
    const existing = db.prepare('SELECT * FROM hosts WHERE host_id = ?').get(hostId);
    if (!existing) {
        sendJson(res, 404, { error: 'Host not found', host_id: hostId });
        return;
    }

    const body = await readJsonBody(req);
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : existing.name;
    const description = typeof body.description === 'string' ? body.description.trim() : existing.description;
    const pcbProfileId = typeof body.pcbProfileId === 'string' && body.pcbProfileId.trim()
        ? body.pcbProfileId.trim()
        : existing.pcb_profile_id;

    const profile = db.prepare('SELECT profile_id, name, high_power_w, warning_temp_c, critical_temp_c, payload_json FROM pcb_profiles WHERE profile_id = ?').get(pcbProfileId);
    if (!profile) {
        sendJson(res, 400, { error: 'PCB profile not found', profile_id: pcbProfileId });
        return;
    }

    const profileChanged = existing.pcb_profile_id !== pcbProfileId;
    const autoIdentity = body.autoIdentity === true;
    let finalName = name;
    let finalDescription = description;

    if (profileChanged && autoIdentity) {
        let profilePayload = {};
        try { profilePayload = JSON.parse(profile.payload_json || '{}'); } catch (_) {}
        finalName = profile.name;
        finalDescription = buildPCBHostDescription(profilePayload);
    }

    db.prepare(`
        UPDATE hosts
        SET name = ?, description = ?, pcb_profile_id = ?
        WHERE host_id = ?
    `).run(finalName, finalDescription, pcbProfileId, hostId);

    // A PCB change changes the Guardian reference envelope. Never leave the
    // previous PCB's electrical/thermal configuration active on the new PCB.
    if (profileChanged) {
        const maxPower = Math.max(0.01, Number(profile.high_power_w || 1));
        const minVoltage = 5;
        const maxVoltage = 28;
        // Current limit must permit the configured maximum power at the
        // lowest allowed voltage. Using Vmax here incorrectly makes normal
        // operation at 12–16 V look over-current.
        const maxCurrent = Number((maxPower / minVoltage).toFixed(3));
        const warning = Number(profile.warning_temp_c ?? 60);
        const critical = Number(profile.critical_temp_c ?? 70);
        const now = nowIso();

        db.prepare(`
            UPDATE host_configs
            SET min_voltage_v = ?, max_voltage_v = ?, max_current_a = ?, max_power_w = ?,
                min_temperature_c = ?, warning_temperature_c = ?, critical_temperature_c = ?,
                config_status = 'GUARDIAN_VALIDATED', guardian_validated_at = ?, updated_at = ?
            WHERE host_id = ?
        `).run(
            minVoltage, maxVoltage, maxCurrent, maxPower,
            -55, warning, critical,
            now, now, hostId
        );

        writeAudit(
            req.authActor || 'Administrator',
            'ADMINISTRATOR',
            hostId,
            'PCB_ASSIGNMENT',
            'ACCEPTED',
            `PCB profile changed to ${pcbProfileId}; host identity synchronized from the selected PCB profile and Guardian reference envelope reloaded.`,
            { pcbProfileId }
        );
    }

    if (!profileChanged && existing.name !== finalName) {
        writeAudit(
            req.authActor || 'Administrator',
            'ADMINISTRATOR',
            hostId,
            'HOST_RENAME',
            'ACCEPTED',
            `Host display name changed from "${existing.name}" to "${finalName}".`,
            { oldName: existing.name, newName: finalName }
        );
    }

    const updated = db.prepare(`
        SELECT h.host_id, h.name, h.description, h.pcb_profile_id,
               p.name AS pcb_profile_name, p.sector, p.mission_class,
               p.altitude_band, p.power_class, p.safe_power_w,
               p.nominal_power_w, p.high_power_w, p.warning_temp_c,
               p.critical_temp_c,
               c.min_voltage_v, c.max_voltage_v, c.max_current_a, c.max_power_w,
               c.min_temperature_c, c.warning_temperature_c, c.critical_temperature_c,
               c.config_status, c.guardian_validated_at, c.updated_at
        FROM hosts h
        JOIN pcb_profiles p ON p.profile_id = h.pcb_profile_id
        LEFT JOIN host_configs c ON c.host_id = h.host_id
        WHERE h.host_id = ?
    `).get(hostId);

    sendJson(res, 200, { host: updated });
}


function nowIso() {
    return new Date().toISOString();
}

function getHostWithProfile(hostId) {
    return db.prepare(`
        SELECT h.host_id, h.name, h.description, h.pcb_profile_id,
               p.name AS pcb_profile_name, p.safe_power_w,
               p.nominal_power_w, p.high_power_w,
               p.warning_temp_c, p.critical_temp_c,
               p.power_class, p.altitude_band
        FROM hosts h
        JOIN pcb_profiles p ON p.profile_id = h.pcb_profile_id
        WHERE h.host_id = ?
    `).get(hostId);
}

function defaultHostConfig(hostId) {
    const host = getHostWithProfile(hostId);
    if (!host) return null;

    const maxPower = Number(host.high_power_w || host.nominal_power_w || 0);
    const critical = Number(host.critical_temp_c || 70);
    const warning = Number(host.warning_temp_c || critical - 10);

    // The 10K reference dataset does not claim hardware-specific voltage/current limits.
    // These are conservative application defaults until actual PCB qualification data is supplied.
    const maxVoltage = 28;
    const minVoltage = 5;
    const maxCurrent = maxPower > 0 ? Number((maxPower / minVoltage).toFixed(3)) : 1;

    return {
        host_id: hostId,
        min_voltage_v: minVoltage,
        max_voltage_v: maxVoltage,
        max_current_a: maxCurrent,
        max_power_w: maxPower,
        min_temperature_c: -55,
        warning_temperature_c: warning,
        critical_temperature_c: critical,
        config_status: 'GUARDIAN_VALIDATED',
        guardian_validated_at: nowIso(),
        updated_at: nowIso()
    };
}

function ensureHostConfigs() {
    const hosts = db.prepare(`
        SELECT h.host_id, h.pcb_profile_id,
               p.high_power_w, p.warning_temp_c, p.critical_temp_c
        FROM hosts h
        LEFT JOIN pcb_profiles p ON p.profile_id = h.pcb_profile_id
    `).all();

    const insert = db.prepare(`
        INSERT OR IGNORE INTO host_configs
        (host_id, min_voltage_v, max_voltage_v, max_current_a, max_power_w,
         min_temperature_c, warning_temperature_c, critical_temperature_c,
         config_status, guardian_validated_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const host of hosts) {
        const existing = db.prepare(`
            SELECT *
            FROM host_configs
            WHERE host_id = ?
        `).get(host.host_id);

        const highPower = Math.max(0.01, Number(host.high_power_w || 1));
        const warning = Number(host.warning_temp_c ?? 60);
        const critical = Number(host.critical_temp_c ?? 70);
        const minVoltage = 5;
        const maxVoltage = 28;
        const maxCurrent = Number((highPower / minVoltage).toFixed(3));

        if (!existing) {
            const now = nowIso();
            insert.run(
                host.host_id,
                minVoltage,
                maxVoltage,
                maxCurrent,
                highPower,
                -55,
                warning,
                critical,
                'GUARDIAN_VALIDATED',
                now,
                now
            );
            continue;
        }

        /*
         * Migrate the old demo defaults that used a fixed 0.74 W / 75 °C
         * envelope for every host. Real host values must follow the active
         * PCB profile instead of a global demo constant.
         */
        const looksLikeOldDemoConfig =
            Number(existing.max_power_w) === 0.74 &&
            Number(existing.min_voltage_v) === 5 &&
            Number(existing.max_voltage_v) === 28;

        if (looksLikeOldDemoConfig) {
            const now = nowIso();
            db.prepare(`
                UPDATE host_configs
                SET max_current_a = ?,
                    max_power_w = ?,
                    warning_temperature_c = ?,
                    critical_temperature_c = ?,
                    config_status = 'GUARDIAN_VALIDATED',
                    guardian_validated_at = ?,
                    updated_at = ?
                WHERE host_id = ?
            `).run(
                maxCurrent,
                highPower,
                warning,
                critical,
                now,
                now,
                host.host_id
            );
        }
    }
}

function validateHostConfigAgainstGuardian(hostId, candidate) {
    const host = getHostWithProfile(hostId);
    if (!host) return { accepted: false, reason: 'Host not found.' };

    const n = (key) => Number(candidate[key]);
    const values = [
        'min_voltage_v', 'max_voltage_v', 'max_current_a', 'max_power_w',
        'min_temperature_c', 'warning_temperature_c', 'critical_temperature_c'
    ];

    for (const key of values) {
        if (!Number.isFinite(n(key))) return { accepted: false, reason: `${key} must be a valid number.` };
    }

    if (n('min_voltage_v') <= 0) return { accepted: false, reason: 'Minimum voltage must be greater than 0 V.' };
    if (n('max_voltage_v') <= n('min_voltage_v')) return { accepted: false, reason: 'Maximum voltage must be greater than minimum voltage.' };
    if (n('max_voltage_v') > 28) return { accepted: false, reason: 'Guardian rejected configuration: reference maximum voltage is 28 V until hardware-specific qualification data is supplied.' };
    if (n('max_current_a') <= 0) return { accepted: false, reason: 'Maximum current must be greater than 0 A.' };
    if (n('max_power_w') <= 0) return { accepted: false, reason: 'Maximum power must be greater than 0 W.' };

    const pcbMaxPower = Number(host.high_power_w || 0);
    if (pcbMaxPower > 0 && n('max_power_w') > pcbMaxPower) {
        return { accepted: false, reason: `Guardian rejected configuration: max power ${n('max_power_w')} W exceeds the PCB profile reference ceiling of ${pcbMaxPower} W.` };
    }

    if (n('min_temperature_c') >= n('warning_temperature_c')) return { accepted: false, reason: 'Minimum temperature must be below the warning temperature.' };
    if (n('warning_temperature_c') >= n('critical_temperature_c')) return { accepted: false, reason: 'Warning temperature must be below critical temperature.' };
    if (n('critical_temperature_c') > Number(host.critical_temp_c || 70)) {
        return { accepted: false, reason: `Guardian rejected configuration: critical temperature exceeds the PCB profile reference ceiling of ${host.critical_temp_c} °C.` };
    }

    // Power/current consistency: configured power cannot exceed Vmax * Imax.
    if (n('max_power_w') > n('max_voltage_v') * n('max_current_a')) {
        return { accepted: false, reason: 'Guardian rejected configuration: maximum power exceeds the configured voltage/current envelope.' };
    }

    return { accepted: true, reason: 'Guardian validation passed.' };
}

function getHostConfig(hostId) {
    ensureHostConfigs();
    const row = db.prepare(`
        SELECT c.*, h.name AS host_name, h.pcb_profile_id,
               p.name AS pcb_profile_name, p.high_power_w AS pcb_high_power_w,
               p.warning_temp_c AS pcb_warning_temp_c, p.critical_temp_c AS pcb_critical_temp_c
        FROM host_configs c
        JOIN hosts h ON h.host_id = c.host_id
        JOIN pcb_profiles p ON p.profile_id = h.pcb_profile_id
        WHERE c.host_id = ?
    `).get(hostId);
    return row || null;
}

function handleHostConfig(res, hostId) {
    const config = getHostConfig(hostId);
    if (!config) {
        sendJson(res, 404, { error: 'Host configuration not found', host_id: hostId });
        return;
    }
    sendJson(res, 200, { config });
}

async function handleHostConfigUpdate(req, res, hostId) {
    const existing = getHostConfig(hostId);
    if (!existing) {
        sendJson(res, 404, { error: 'Host configuration not found', host_id: hostId });
        return;
    }

    const body = await readJsonBody(req);
    const candidate = {
        min_voltage_v: body.minVoltageV,
        max_voltage_v: body.maxVoltageV,
        max_current_a: body.maxCurrentA,
        max_power_w: body.maxPowerW,
        min_temperature_c: body.minTemperatureC,
        warning_temperature_c: body.warningTemperatureC,
        critical_temperature_c: body.criticalTemperatureC
    };

    const validation = validateHostConfigAgainstGuardian(hostId, candidate);
    const actor = req.authActor || (typeof body.actor === 'string' && body.actor.trim() ? body.actor.trim() : 'Administrator');
    const timestamp = nowIso();

    db.prepare(`
        INSERT INTO host_config_history (host_id, actor, status, reason, config_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(hostId, actor, validation.accepted ? 'ACCEPTED' : 'REJECTED', validation.reason, JSON.stringify(candidate), timestamp);

    if (!validation.accepted) {
        sendJson(res, 422, {
            accepted: false,
            guardianValidated: false,
            reason: validation.reason,
            previousConfig: existing
        });
        return;
    }

    db.prepare(`
        UPDATE host_configs
        SET min_voltage_v = ?, max_voltage_v = ?, max_current_a = ?, max_power_w = ?,
            min_temperature_c = ?, warning_temperature_c = ?, critical_temperature_c = ?,
            config_status = 'GUARDIAN_VALIDATED', guardian_validated_at = ?, updated_at = ?
        WHERE host_id = ?
    `).run(
        Number(candidate.min_voltage_v), Number(candidate.max_voltage_v), Number(candidate.max_current_a), Number(candidate.max_power_w),
        Number(candidate.min_temperature_c), Number(candidate.warning_temperature_c), Number(candidate.critical_temperature_c),
        timestamp, timestamp, hostId
    );

    sendJson(res, 200, {
        accepted: true,
        guardianValidated: true,
        reason: validation.reason,
        config: getHostConfig(hostId)
    });
}

function sendJson(res, status, data) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
}

function sendFile(res, filePath) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        sendJson(res, 404, { error: 'Not found' });
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    res.writeHead(200, {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    fs.createReadStream(filePath).pipe(res);
}

function rowToProfile(row) {
    return JSON.parse(row.payload_json);
}

function handleProfileList(res, url) {
    const search = (url.searchParams.get('search') || '').trim();
    const sector = (url.searchParams.get('sector') || '').trim();
    const mission = (url.searchParams.get('mission') || '').trim();
    const altitude = (url.searchParams.get('altitude') || '').trim();
    const power = (url.searchParams.get('power') || '').trim();
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || 24)));

    const where = [];
    const params = [];

    if (search) {
        where.push('(profile_id LIKE ? OR name LIKE ? OR sector LIKE ? OR mission_class LIKE ? OR altitude_band LIKE ? OR power_class LIKE ?)');
        const q = `%${search}%`;
        params.push(q, q, q, q, q, q);
    }
    if (sector && sector !== 'ALL') {
        where.push('sector = ?');
        params.push(sector);
    }
    if (mission && mission !== 'ALL') {
        where.push('mission_class = ?');
        params.push(mission);
    }
    if (altitude && altitude !== 'ALL') {
        where.push('altitude_band = ?');
        params.push(altitude);
    }
    if (power && power !== 'ALL') {
        where.push('power_class = ?');
        params.push(power);
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = Number(db.prepare(`SELECT COUNT(*) AS count FROM pcb_profiles ${clause}`).get(...params).count);
    const offset = (page - 1) * pageSize;

    const rows = db.prepare(`
        SELECT profile_id, profile_type, name, sector, mission_class,
               altitude_band, max_altitude_km, power_class,
               safe_power_w, nominal_power_w, high_power_w,
               warning_temp_c, critical_temp_c
        FROM pcb_profiles
        ${clause}
        ORDER BY profile_id
        LIMIT ? OFFSET ?
    `).all(...params, pageSize, offset);

    sendJson(res, 200, {
        profiles: rows,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize))
        }
    });
}

function handleProfile(res, id) {
    const row = db.prepare('SELECT payload_json FROM pcb_profiles WHERE profile_id = ?').get(id);
    if (!row) {
        sendJson(res, 404, { error: 'PCB profile not found', profile_id: id });
        return;
    }
    const profile = rowToProfile(row);
    profile.description = buildPCBHostDescription(profile);
    sendJson(res, 200, profile);
}

function handleStats(res) {
    const total = Number(db.prepare('SELECT COUNT(*) AS count FROM pcb_profiles').get().count);
    const sectors = db.prepare('SELECT sector, COUNT(*) AS count FROM pcb_profiles GROUP BY sector ORDER BY sector').all();
    const missions = db.prepare('SELECT mission_class, COUNT(*) AS count FROM pcb_profiles GROUP BY mission_class ORDER BY mission_class').all();
    const altitudes = db.prepare('SELECT altitude_band, COUNT(*) AS count FROM pcb_profiles GROUP BY altitude_band ORDER BY max_altitude_km').all();
    const powerClasses = db.prepare('SELECT power_class, COUNT(*) AS count FROM pcb_profiles GROUP BY power_class ORDER BY power_class').all();

    sendJson(res, 200, { total, sectors, missions, altitudes, powerClasses });
}


async function handleLogin(req, res) {
    const body = await readJsonBody(req);
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');

    const user = db.prepare(`
        SELECT user_id, username, password_hash, role, display_name, active
        FROM users WHERE username = ?
    `).get(username);

    if (!user || !user.active || !verifyPassword(password, user.password_hash)) {
        sendJson(res, 401, { error: 'Invalid username or password.' });
        return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {
        user: {
            userId: user.user_id,
            username: user.username,
            role: user.role,
            displayName: user.display_name
        },
        expiresAt: Date.now() + 8 * 60 * 60 * 1000
    });

    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);
    writeAudit(user.username, user.role, null, 'LOGIN', 'SUCCESS', 'User logged in.');
    sendJson(res, 200, {
        authenticated: true,
        user: {
            userId: user.user_id,
            username: user.username,
            role: user.role,
            displayName: user.display_name
        }
    });
}

function handleLogout(req, res) {
    const user = getSessionUser(req);
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) sessions.delete(token);
    if (user) writeAudit(user.username, user.role, null, 'LOGOUT', 'SUCCESS', 'User logged out.');
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    sendJson(res, 200, { authenticated: false });
}

function handleMe(req, res) {
    const user = getSessionUser(req);
    if (!user) {
        sendJson(res, 200, { authenticated: false });
        return;
    }
    sendJson(res, 200, { authenticated: true, user });
}

function handleCommand(req, res, user, hostId, requestedMode) {
    const decision = validateModeForServer(hostId, requestedMode);
    db.prepare(`
        INSERT INTO mode_commands
        (host_id, actor, requested_mode, decision, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        hostId,
        user.username,
        requestedMode,
        decision.accepted ? 'ACCEPTED' : 'REJECTED',
        decision.reason,
        nowIso()
    );

    writeAudit(
        user.username,
        user.role,
        hostId,
        'MODE_COMMAND',
        decision.accepted ? 'ACCEPTED' : 'REJECTED',
        `${requestedMode}: ${decision.reason}`,
        { requestedMode }
    );

    sendJson(res, decision.accepted ? 200 : 422, {
        accepted: decision.accepted,
        guardianValidated: true,
        mode: requestedMode,
        reason: decision.reason
    });
}

function handleHostCommands(res, hostId) {
    const host = db.prepare('SELECT host_id FROM hosts WHERE host_id = ?').get(hostId);
    if (!host) {
        sendJson(res, 404, { error: 'Host not found', host_id: hostId });
        return;
    }

    const rows = db.prepare(`
        SELECT id, host_id, actor, requested_mode, decision, reason, created_at
        FROM mode_commands
        WHERE host_id = ?
        ORDER BY id DESC
        LIMIT 100
    `).all(hostId);

    sendJson(res, 200, { commands: rows });
}

function handleAudit(res, url) {
    const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') || 100)));
    const rows = db.prepare(`
        SELECT id, actor, role, host_id, event_type, status, description, created_at
        FROM audit_events
        ORDER BY id DESC LIMIT ?
    `).all(limit);
    sendJson(res, 200, { events: rows });
}

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        if (req.method === 'GET' && url.pathname === '/api/health') {
            sendJson(res, 200, {
                status: 'ok',
                service: 'AltisGuardian API',
                pcbProfiles: Number(db.prepare('SELECT COUNT(*) AS count FROM pcb_profiles').get().count)
            });
            return;
        }

        if (req.method === 'POST' && url.pathname === '/api/auth/login') {
            await handleLogin(req, res);
            return;
        }

        if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
            handleLogout(req, res);
            return;
        }

        if (req.method === 'GET' && url.pathname === '/api/auth/me') {
            handleMe(req, res);
            return;
        }

        const publicStatic = req.method === 'GET' && !url.pathname.startsWith('/api/');
        if (publicStatic) {
            let pathname = decodeURIComponent(url.pathname);
            if (pathname === '/') pathname = '/index.html';
            const safePath = path.normalize(path.join(ROOT, pathname));
            if (!safePath.startsWith(ROOT)) {
                sendJson(res, 403, { error: 'Forbidden' });
                return;
            }
            sendFile(res, safePath);
            return;
        }

        const user = requireAuth(req, res);
        if (!user) return;

        if (req.method === 'POST' && url.pathname.startsWith('/api/hosts/') && url.pathname.endsWith('/commands/mode')) {
            const hostId = decodeURIComponent(url.pathname.split('/')[3]);
            const body = await readJsonBody(req);
            handleCommand(req, res, user, hostId, String(body.mode || ''));
            return;
        }

        if (req.method === 'GET' && url.pathname.startsWith('/api/hosts/') && url.pathname.endsWith('/commands')) {
            const hostId = decodeURIComponent(url.pathname.split('/')[3]);
            handleHostCommands(res, hostId);
            return;
        }

        if (req.method === 'GET' && url.pathname === '/api/audit') {
            handleAudit(res, url);
            return;
        }

        if (req.method === 'GET' && url.pathname === '/api/hosts') {
            handleHosts(res);
            return;
        }

        if (req.method === 'GET' && url.pathname === '/api/test/stress') {
            const hostRows = db.prepare(`
                SELECT h.host_id, h.name, c.max_power_w, c.max_current_a,
                       c.warning_temperature_c, c.critical_temperature_c,
                       c.min_voltage_v, c.max_voltage_v
                FROM hosts h
                JOIN host_configs c ON c.host_id = h.host_id
                ORDER BY h.host_id
            `).all();

            sendJson(res, 200, {
                mode: 'DETERMINISTIC_TEST',
                states: hostRows.map((h, index) => ({
                    host_id: h.host_id,
                    target: index === 0 ? 'HEALTHY' : index === 1 ? 'WARNING' : 'CRITICAL',
                    max_power_w: h.max_power_w,
                    max_current_a: h.max_current_a
                }))
            });
            return;
        }

        if (req.method === 'GET' && url.pathname.startsWith('/api/hosts/') && url.pathname.endsWith('/config')) {
            const id = decodeURIComponent(url.pathname.split('/')[3]);
            handleHostConfig(res, id);
            return;
        }

        if (req.method === 'PATCH' && url.pathname.startsWith('/api/hosts/') && url.pathname.endsWith('/config')) {
            if (user.role !== 'ADMINISTRATOR') {
                sendJson(res, 403, { error: 'Administrator role required for host configuration.' });
                return;
            }
            const id = decodeURIComponent(url.pathname.split('/')[3]);
            req.authActor = user.username;
            await handleHostConfigUpdate(req, res, id);
            return;
        }

        if (req.method === 'PATCH' && url.pathname.startsWith('/api/hosts/')) {
            if (user.role !== 'ADMINISTRATOR') {
                sendJson(res, 403, { error: 'Administrator role required for host changes.' });
                return;
            }
            const id = decodeURIComponent(url.pathname.split('/').pop());
            await handleHostUpdate(req, res, id);
            return;
        }

        if (req.method === 'GET' && url.pathname === '/api/pcb-profiles') {
            handleProfileList(res, url);
            return;
        }

        if (req.method === 'GET' && url.pathname === '/api/pcb-profiles/stats') {
            handleStats(res);
            return;
        }

        if (req.method === 'GET' && url.pathname.startsWith('/api/pcb-profiles/')) {
            const id = decodeURIComponent(url.pathname.split('/').pop());
            handleProfile(res, id);
            return;
        }

        sendJson(res, 404, { error: 'API route not found' });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) sendJson(res, 500, { error: error.message || 'Internal server error' });
    }
});

server.listen(PORT, () => {
    console.log(`AltisGuardian running at http://localhost:${PORT}`);
    console.log(`PCB database: ${DB_PATH}`);
});
