/* =========================================================
   ALTISGUARDIAN
   COMPLETE FRONTEND APPLICATION

   IMPORTANT:
   This file currently contains a simulated data/service layer.
   Later, this layer will be replaced by the real backend API
   and Guardian communication system.

   The UI architecture is intentionally kept independent from
   the hardware/backend implementation.
========================================================= */


/* =========================================================
   APPLICATION STATE
========================================================= */

const app = {
    currentUser: null,
    telemetryTimer: null,
    telemetryRefreshSeconds: Number(localStorage.getItem("altisguardian-telemetryRefreshSeconds") || 30),

    currentView: "dashboard",

    selectedHostId: null,

    charts: {
        voltage: null,
        power: null,
        temperature: null
    },

    modalAction: null,

    hosts: [

        {
            id: "HOST-001",
            name: "High Altitude Computer",
            pcbId: "PCB-HA-001",
            pcbName: "High Altitude Computing PCB",

            description:
                "Primary high-altitude computing host protected by an autonomous Guardian.",

            status: "HEALTHY",
            mode: "NOMINAL",

            guardian: {
                online: true,
                cycle: 30,
                lastCycle: "18:14:30",
                protection: "ACTIVE"
            },

            telemetry: {
                voltage: 12.08,
                current: 4.62,
                power: 55.81,
                temperature: 43.7
            },

            limits: {
                voltageWarning: 12.6,
                voltageCritical: 13.0,

                currentWarning: 6.0,
                currentCritical: 7.0,

                temperatureWarning: 55,
                temperatureCritical: 65
            },

            signal: "Excellent",

            alerts: [],

            commandHistory: [
                {
                    time: "18:11:20",
                    type: "ACCEPTED",
                    command: "NOMINAL",
                    description: "Performance mode confirmed by Guardian.",
                    actor: "Operator"
                }
            ],

            events: [
                {
                    time: "18:14:30",
                    text: "Guardian control cycle completed.",
                    type: "Guardian"
                },
                {
                    time: "18:14:20",
                    text: "Telemetry packet received.",
                    type: "Telemetry"
                },
                {
                    time: "18:14:10",
                    text: "Host operating normally.",
                    type: "System"
                }
            ],

            history: {
                labels: [
                    "18:09",
                    "18:10",
                    "18:11",
                    "18:12",
                    "18:13",
                    "18:14"
                ],

                voltage: [
                    12.04,
                    12.06,
                    12.09,
                    12.07,
                    12.08,
                    12.08
                ],

                power: [
                    53.2,
                    54.6,
                    55.4,
                    56.1,
                    55.8,
                    55.81
                ],

                temperature: [
                    41.2,
                    41.9,
                    42.5,
                    42.9,
                    43.3,
                    43.7
                ]
            }
        },


        {
            id: "HOST-002",
            name: "Telemetry Processing Host",
            pcbId: "PCB-TP-002",
            pcbName: "Telemetry Processing PCB",

            description:
                "Telemetry processing system with an active thermal warning.",

            status: "WARNING",
            mode: "NOMINAL",

            guardian: {
                online: true,
                cycle: 30,
                lastCycle: "18:14:20",
                protection: "ACTIVE"
            },

            telemetry: {
                voltage: 11.94,
                current: 5.21,
                power: 62.21,
                temperature: 57.8
            },

            limits: {
                voltageWarning: 12.6,
                voltageCritical: 13.0,

                currentWarning: 6.0,
                currentCritical: 7.0,

                temperatureWarning: 55,
                temperatureCritical: 65
            },

            signal: "Good",

            alerts: [
                {
                    id: "ALT-002-TEMP",
                    severity: "WARNING",
                    message: "Temperature above warning threshold",
                    parameter: "Temperature",
                    value: 57.8,
                    threshold: 55,
                    unit: "°C",
                    time: "18:14:10",
                    acknowledged: false
                }
            ],

            commandHistory: [
                {
                    time: "18:10:05",
                    type: "ACCEPTED",
                    command: "NOMINAL",
                    description: "Performance mode confirmed by Guardian.",
                    actor: "Operator"
                }
            ],

            events: [
                {
                    time: "18:14:20",
                    text: "Guardian control cycle completed.",
                    type: "Guardian"
                },
                {
                    time: "18:14:10",
                    text: "Temperature warning generated: 57.8 °C.",
                    type: "Alert"
                },
                {
                    time: "18:14:00",
                    text: "Telemetry packet received.",
                    type: "Telemetry"
                }
            ],

            history: {
                labels: [
                    "18:09",
                    "18:10",
                    "18:11",
                    "18:12",
                    "18:13",
                    "18:14"
                ],

                voltage: [
                    11.97,
                    11.95,
                    11.96,
                    11.94,
                    11.95,
                    11.94
                ],

                power: [
                    59.1,
                    60.4,
                    61.7,
                    61.2,
                    62.0,
                    62.21
                ],

                temperature: [
                    52.1,
                    53.0,
                    54.4,
                    55.2,
                    56.7,
                    57.8
                ]
            }
        },


        {
            id: "HOST-003",
            name: "Experimental Computing Host",
            pcbId: "PCB-EX-003",
            pcbName: "Experimental Computing PCB",

            description:
                "Experimental host system operating under Guardian protection.",

            status: "HEALTHY",
            mode: "HIGH",

            guardian: {
                online: true,
                cycle: 30,
                lastCycle: "18:14:10",
                protection: "ACTIVE"
            },

            telemetry: {
                voltage: 12.17,
                current: 6.31,
                power: 76.79,
                temperature: 49.3
            },

            limits: {
                voltageWarning: 12.6,
                voltageCritical: 13.0,

                currentWarning: 7.0,
                currentCritical: 8.0,

                temperatureWarning: 55,
                temperatureCritical: 65
            },

            signal: "Excellent",

            alerts: [],

            commandHistory: [
                {
                    time: "18:05:40",
                    type: "ACCEPTED",
                    command: "HIGH",
                    description: "Performance mode confirmed by Guardian.",
                    actor: "Operator"
                }
            ],

            events: [
                {
                    time: "18:14:10",
                    text: "Guardian control cycle completed.",
                    type: "Guardian"
                },
                {
                    time: "18:14:00",
                    text: "Telemetry packet received.",
                    type: "Telemetry"
                },
                {
                    time: "18:13:50",
                    text: "Host operating normally.",
                    type: "System"
                }
            ],

            history: {
                labels: [
                    "18:09",
                    "18:10",
                    "18:11",
                    "18:12",
                    "18:13",
                    "18:14"
                ],

                voltage: [
                    12.12,
                    12.15,
                    12.13,
                    12.16,
                    12.18,
                    12.17
                ],

                power: [
                    72.1,
                    73.5,
                    75.2,
                    74.8,
                    76.2,
                    76.79
                ],

                temperature: [
                    45.1,
                    45.9,
                    46.8,
                    47.5,
                    48.4,
                    49.3
                ]
            }
        }
    ],


    /* =====================================================
       PCB PROFILE DATASET
       Loaded from data/pcb-profiles.json.
       The backend will own this data in the production phase.
    ====================================================== */

    pcbProfiles: [],
    pcbProfilesLoaded: false,
    pcbProfileLoadError: false,
    pcbProfilePagination: null,
    pcbProfileStats: null,

    settings: {
        notifications: true,
        auditLogging: true,
        telemetryLogging: true,
        eventLogging: true,
        remoteModeRequests: true
    }
};



/* =========================================================
   PCB PROFILE API

   The 10,000-profile dataset is stored in the backend SQLite
   database. The browser only receives the page of profiles it
   needs, so the dashboard never loads the 33 MB source dataset.
========================================================= */

async function loadPCBProfiles({
    page = 1,
    pageSize = 24,
    search = "",
    sector = "ALL",
    mission = "ALL",
    altitude = "ALL",
    power = "ALL"
} = {}) {

    try {
        const params = new URLSearchParams({
            page,
            pageSize
        });

        if (search) params.set("search", search);
        if (sector !== "ALL") params.set("sector", sector);
        if (mission !== "ALL") params.set("mission", mission);
        if (altitude !== "ALL") params.set("altitude", altitude);
        if (power !== "ALL") params.set("power", power);

        const response = await fetch(`/api/pcb-profiles?${params.toString()}`, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!Array.isArray(result.profiles) || !result.pagination) {
            throw new Error("Invalid PCB profile API response.");
        }

        app.pcbProfiles = result.profiles;
        app.pcbProfilePagination = result.pagination;
        app.pcbProfilesLoaded = true;
        app.pcbProfileLoadError = false;

        return true;

    } catch (error) {
        console.error("AltisGuardian: PCB profile API unavailable.", error);

        app.pcbProfiles = [];
        app.pcbProfilesLoaded = false;
        app.pcbProfileLoadError = true;

        return false;
    }
}


async function loadPCBProfileStats() {

    try {
        const response = await fetch("/api/pcb-profiles/stats", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const stats = await response.json();
        app.pcbProfileStats = stats;
        return stats;

    } catch (error) {
        console.error("AltisGuardian: PCB profile statistics unavailable.", error);
        return null;
    }
}


function formatPCBProfile(profile) {

    return {
        id: profile.profile_id,
        name: profile.name,
        sector: profile.sector,
        mission: profile.mission_class,
        altitude: profile.altitude_band,
        powerClass: profile.power_class,
        safePower: `${profile.safe_power_w} W`,
        nominalPower: `${profile.nominal_power_w} W`,
        highPower: `${profile.high_power_w} W`,
        thermalWarning: `${profile.warning_temp_c} °C`,
        thermalCritical: `${profile.critical_temp_c} °C`
    };
}

/* =========================================================
   SENSOR + TELEMETRY NORMALIZATION
========================================================= */

function profileAltitudeKm(host) {
    const text = host.pcbProfileMeta?.altitude_band || "0-2 km";
    const match = String(text).match(/([0-9]+(?:\.[0-9]+)?)\s*-\s*([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return 1;
    return (Number(match[1]) + Number(match[2])) / 2;
}

function normalizeHostTelemetry(host) {
    const c = host.config;
    if (!c) return;

    const now = Date.now() / 1000;
    const seed = [...host.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

    const minV = Number(c.minVoltageV);
    const maxV = Number(c.maxVoltageV);
    const maxPower = Number(c.maxPowerW);
    const maxCurrent = Number(c.maxCurrentA);
    const warning = Number(c.warningTemperatureC);
    const critical = Number(c.criticalTemperatureC);

    // Keep the synthetic test telemetry inside the configured electrical
    // envelope for HEALTHY/WARNING hosts. This avoids a false CRITICAL caused
    // by deriving current from power at a voltage that is below Vmax.
    const voltage = Math.max(
        minV + 0.5,
        Math.min(
            maxV - 0.5,
            (minV + maxV) / 2 + Math.sin(now / 25 + seed) * 0.08
        )
    );

    let powerFraction = 0.55;
    let temperature = warning - 12;

    if (host.id === "HOST-002") {
        // WARNING: near the power ceiling and above the warning temperature,
        // but still inside the absolute electrical/thermal limits.
        powerFraction = 0.92;
        temperature = warning + 2;
    } else if (host.id === "HOST-003") {
        // CRITICAL: deliberately exceeds the configured power and critical
        // temperature limits.
        powerFraction = 1.08;
        temperature = critical + 2;
    }

    const power = Math.max(0.01, maxPower * powerFraction);

    // Current is derived from P = V * I. For HOST-001/002, maxCurrent is
    // defined against minimum allowed voltage, so normal telemetry remains
    // inside the current envelope.
    let current = power / Math.max(voltage, 0.1);

    // For the critical test host, exceed the current envelope as well.
    if (host.id === "HOST-003") {
        current = Math.max(current, maxCurrent * 1.08);
    }

    host.telemetry.voltage = Number(voltage.toFixed(2));
    host.telemetry.power = Number(power.toFixed(2));
    host.telemetry.current = Number(current.toFixed(3));
    host.telemetry.temperature = Number(temperature.toFixed(1));

    updateEnvironmentalSensors(host);
}

function updateEnvironmentalSensors(host) {
    const altitude = profileAltitudeKm(host);
    const seed = [...host.id].reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const wave = Math.sin(Date.now() / 60000 + seed) * 0.15;

    host.environment = {
        altitudeKm: Number(altitude.toFixed(1)),
        pressureHpa: Number((1013.25 * Math.exp(-altitude / 8.4) + wave).toFixed(1)),
        ambientTemperatureC: Number((host.telemetry.temperature - 3 + wave).toFixed(1)),
        uvIndex: Number(Math.max(0, Math.min(11, 5 + altitude * 0.18 + wave)).toFixed(1))
    };

    host.hallEffect = {
        magneticFieldMt: Number((Math.max(0.01, host.telemetry.current * 0.42 + 0.08 + wave / 5)).toFixed(3)),
        sensedCurrentA: Number(host.telemetry.current.toFixed(3)),
        state: host.telemetry.current <= host.limits.currentMax * 0.9 ? "NORMAL" : "NEAR LIMIT"
    };
}

function renderDashboardSensors() {
    const host = app.hosts.find(h => h.id === app.selectedHostId) || app.hosts[0];
    if (!host) return;
    updateEnvironmentalSensors(host);

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    set("dashboardSensorHost", `${host.id} · ${host.name}`);
    set("dashboardAltitude", host.environment.altitudeKm);
    set("dashboardPressure", host.environment.pressureHpa);
    set("dashboardAmbientTemp", host.environment.ambientTemperatureC);
    set("dashboardUvIndex", host.environment.uvIndex);
    set("dashboardHallField", host.hallEffect.magneticFieldMt);
    set("dashboardHallCurrent", host.hallEffect.sensedCurrentA);
    set("dashboardHallState", host.hallEffect.state);
}

/* =========================================================
   HOST CONFIGURATION API
========================================================= */

async function loadHostsFromBackend() {

    try {
        const response = await fetch("/api/hosts", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        if (!Array.isArray(result.hosts)) throw new Error("Invalid host API response.");

        result.hosts.forEach(record => {
            const host = getHost(record.host_id);
            if (!host) return;

            host.name = record.name;
            host.description = record.description;
            host.pcbId = record.pcb_profile_id;
            host.pcbName = record.pcb_profile_name || record.pcb_profile_id;
            host.pcbProfileMeta = record;
            host.pcbDescription = record.pcb_profile_description || '';
            host.config = {
                minVoltageV: Number(record.min_voltage_v),
                maxVoltageV: Number(record.max_voltage_v),
                maxCurrentA: Number(record.max_current_a),
                maxPowerW: Number(record.max_power_w),
                minTemperatureC: Number(record.min_temperature_c),
                warningTemperatureC: Number(record.warning_temperature_c),
                criticalTemperatureC: Number(record.critical_temperature_c),
                status: record.config_status || 'GUARDIAN_VALIDATED',
                guardianValidatedAt: record.guardian_validated_at || null
            };
            host.limits = {
                voltageMin: host.config.minVoltageV,
                voltageMax: host.config.maxVoltageV,
                currentMax: host.config.maxCurrentA,
                powerMax: host.config.maxPowerW,
                temperatureMin: host.config.minTemperatureC,
                temperatureWarning: host.config.warningTemperatureC,
                temperatureCritical: host.config.criticalTemperatureC,
                // Keep legacy fields used elsewhere in the UI.
                voltageWarning: host.config.maxVoltageV,
                voltageCritical: host.config.maxVoltageV,
                currentWarning: host.config.maxCurrentA,
                currentCritical: host.config.maxCurrentA
            };
            normalizeHostTelemetry(host);
            syncHostStatus(host);
            syncHostAlerts(host);
            loadHostCommandHistory(host);
        });

        return true;
    } catch (error) {
        console.error("AltisGuardian: Host configuration API unavailable.", error);
        return false;
    }
}


async function saveHostConfiguration(hostId, values) {
    if (values.pcbProfileId && app.currentUser?.role !== "ADMINISTRATOR") {
        throw new Error("Administrator role required to change a host PCB profile.");
    }
    if (!values.pcbProfileId && app.currentUser?.role !== "ADMINISTRATOR") {
        throw new Error("Administrator role required to change host protection configuration.");
    }


    const response = await fetch(`/api/hosts/${encodeURIComponent(hostId)}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
    }

    const host = getHost(hostId);
    if (host && result.host) {
        host.name = result.host.name;
        host.description = result.host.description;
        host.pcbId = result.host.pcb_profile_id;
        host.pcbName = result.host.pcb_profile_name;
        host.pcbProfileMeta = result.host;
        host.pcbDescription = result.host.pcb_profile_description || '';
    }

    return result.host;
}



async function loadHostProtectionConfig(hostId) {
    const response = await fetch(`/api/hosts/${encodeURIComponent(hostId)}/config`, { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
    return result.config;
}

async function saveHostProtectionConfig(hostId, values) {
    const response = await fetch(`/api/hosts/${encodeURIComponent(hostId)}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, actor: 'Administrator' })
    });
    const result = await response.json();
    if (!response.ok) {
        const error = new Error(result.reason || result.error || `HTTP ${response.status}`);
        error.guardianRejected = result.guardianValidated === false;
        throw error;
    }

    const host = getHost(hostId);
    if (host && result.config) {
        const c = result.config;
        host.config = {
            minVoltageV: Number(c.min_voltage_v),
            maxVoltageV: Number(c.max_voltage_v),
            maxCurrentA: Number(c.max_current_a),
            maxPowerW: Number(c.max_power_w),
            minTemperatureC: Number(c.min_temperature_c),
            warningTemperatureC: Number(c.warning_temperature_c),
            criticalTemperatureC: Number(c.critical_temperature_c),
            status: c.config_status,
            guardianValidatedAt: c.guardian_validated_at
        };
        host.limits = {
            voltageMin: host.config.minVoltageV,
            voltageMax: host.config.maxVoltageV,
            currentMax: host.config.maxCurrentA,
            powerMax: host.config.maxPowerW,
            temperatureMin: host.config.minTemperatureC,
            temperatureWarning: host.config.warningTemperatureC,
            temperatureCritical: host.config.criticalTemperatureC,
            voltageWarning: host.config.maxVoltageV,
            voltageCritical: host.config.maxVoltageV,
            currentWarning: host.config.maxCurrentA,
            currentCritical: host.config.maxCurrentA
        };
    }
    return result.config;
}

function renderHostProtectionConfig(host) {
    const panel = document.getElementById("hostProtectionConfigPanel");
    const content = document.getElementById("hostProtectionConfigContent");

    if (!panel || !content) {
        console.error("AltisGuardian: Host protection configuration panel is missing from index.html.");
        return;
    }

    const c = host.config || {};
    const meta = host.pcbProfileMeta || {};
    const status = c.status || "GUARDIAN_VALIDATED";

    const num = (value, fallback = "") =>
        Number.isFinite(Number(value)) ? Number(value) : fallback;

    content.innerHTML = `
        <div class="config-reference-strip">
            <div>
                <span>Active PCB Profile</span>
                <strong>${host.pcbId || "—"}</strong>
            </div>
            <div>
                <span>PCB Reference HIGH Power</span>
                <strong>${meta.high_power_w != null ? `${meta.high_power_w} W` : "—"}</strong>
            </div>
            <div>
                <span>PCB Critical Temperature</span>
                <strong>${meta.critical_temp_c != null ? `${meta.critical_temp_c} °C` : "—"}</strong>
            </div>
        </div>

        <div class="config-grid">
            <div class="config-section-title">Host Identity</div>

            <label class="config-field config-field-wide">
                <span>Host Display Name</span>
                <input id="cfgHostName" type="text" maxlength="80" value="${String(host.name || "").replace(/"/g, "&quot;")}">
            </label>

            <div class="config-section-title">Electrical Protection</div>

            <label class="config-field">
                <span>Minimum Voltage (V)</span>
                <input id="cfgMinVoltage" type="number" min="0.01" step="0.01" value="${num(c.minVoltageV)}">
            </label>

            <label class="config-field">
                <span>Maximum Voltage (V)</span>
                <input id="cfgMaxVoltage" type="number" min="0.01" step="0.01" value="${num(c.maxVoltageV)}">
            </label>

            <label class="config-field">
                <span>Maximum Current (A)</span>
                <input id="cfgMaxCurrent" type="number" min="0.01" step="0.01" value="${num(c.maxCurrentA)}">
            </label>

            <label class="config-field">
                <span>Maximum Power (W)</span>
                <input id="cfgMaxPower" type="number" min="0.01" step="0.01" value="${num(c.maxPowerW)}">
            </label>

            <div class="config-section-title">Thermal Protection</div>

            <label class="config-field">
                <span>Minimum Temperature (°C)</span>
                <input id="cfgMinTemp" type="number" step="0.1" value="${num(c.minTemperatureC)}">
            </label>

            <label class="config-field">
                <span>Warning Temperature (°C)</span>
                <input id="cfgWarnTemp" type="number" step="0.1" value="${num(c.warningTemperatureC)}">
            </label>

            <label class="config-field">
                <span>Critical Temperature (°C)</span>
                <input id="cfgCriticalTemp" type="number" step="0.1" value="${num(c.criticalTemperatureC)}">
            </label>

            <div class="config-field config-readonly">
                <span>Configuration Authority</span>
                <strong>LOCAL GUARDIAN</strong>
            </div>
        </div>

        <div class="config-safety-note">
            Website values are requests only. The Guardian independently validates every value against
            the active PCB profile and keeps the previous known-good configuration if the request is rejected.
            Users may make limits more conservative, but cannot raise them above the Guardian's validated envelope.
        </div>

        <div class="config-actions">
            <span class="config-last-validated">
                ${c.guardianValidatedAt
                    ? `Last Guardian validation: ${new Date(c.guardianValidatedAt).toLocaleString()}`
                    : "Not yet validated"}
            </span>
            <button type="button" class="primary-button" id="saveHostProtectionConfig">
                Validate &amp; Save Configuration
            </button>
        </div>

        <div class="config-validation-result ${status === "GUARDIAN_VALIDATED" ? "accepted" : "pending"}" id="configValidationResult">
            <strong>${status === "GUARDIAN_VALIDATED" ? "Guardian validation active" : "Configuration pending validation"}</strong>
            <span>${status === "GUARDIAN_VALIDATED"
                ? "The displayed limits are the configuration currently accepted by the Guardian."
                : "The Guardian has not accepted this configuration yet."}</span>
        </div>
    `;

    const badge = document.getElementById("configValidationBadge");
    if (badge) {
        badge.textContent = status === "GUARDIAN_VALIDATED" ? "GUARDIAN VALIDATED" : "PENDING";
        badge.className = `config-validation-badge ${status === "GUARDIAN_VALIDATED" ? "validated" : "pending"}`;
    }

    const saveButton = document.getElementById("saveHostProtectionConfig");
    if (!saveButton) return;

    if (app.currentUser?.role !== "ADMINISTRATOR") {
        saveButton.disabled = true;
        saveButton.textContent = "Administrator Only";
        saveButton.classList.add("disabled-control");
        const nameInput = document.getElementById("cfgHostName");
        if (nameInput) nameInput.disabled = true;
    }

    saveButton.onclick = async () => {
        const values = {
            minVoltageV: Number(document.getElementById("cfgMinVoltage").value),
            maxVoltageV: Number(document.getElementById("cfgMaxVoltage").value),
            maxCurrentA: Number(document.getElementById("cfgMaxCurrent").value),
            maxPowerW: Number(document.getElementById("cfgMaxPower").value),
            minTemperatureC: Number(document.getElementById("cfgMinTemp").value),
            warningTemperatureC: Number(document.getElementById("cfgWarnTemp").value),
            criticalTemperatureC: Number(document.getElementById("cfgCriticalTemp").value)
        };

        saveButton.disabled = true;
        saveButton.textContent = "Guardian validating…";

        try {
            await saveHostProtectionConfig(host.id, values);

            const requestedHostName = document.getElementById("cfgHostName")?.value.trim();
            if (requestedHostName && requestedHostName !== host.name) {
                await saveHostConfiguration(host.id, { name: requestedHostName });
            }

            await loadHostsFromBackend();
            const updatedHost = getHost(host.id);
            if (updatedHost) {
                normalizeHostTelemetry(updatedHost);
                syncHostStatus(updatedHost);
                syncHostAlerts(updatedHost);
            }

            if (app.currentView === "dashboard") renderHosts();
            renderHostProtectionConfig(updatedHost || host);
            if (updatedHost) renderHostDetails(updatedHost);
            showToast("Guardian accepted the configuration and applied the host identity change.");
        } catch (error) {
            saveButton.disabled = false;
            saveButton.textContent = "Validate & Save Configuration";

            const result = document.getElementById("configValidationResult");
            if (result) {
                result.className = "config-validation-result rejected";
                result.innerHTML = `
                    <strong>Guardian rejected configuration</strong>
                    <span>${error.message || "The requested configuration was not accepted. The previous configuration remains active."}</span>
                `;
            }

            showToast(error.message || "Guardian rejected the configuration.");
        }
    };
}

async function searchPCBProfilesForAssignment(search, pageSize = 8) {

    const params = new URLSearchParams({
        page: "1",
        pageSize: String(pageSize),
        search: search.trim()
    });

    const response = await fetch(`/api/pcb-profiles?${params.toString()}`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}


async function openPCBProfileAssignmentModal(fixedHostId = null, initialProfileId = null) {

    const currentHost = fixedHostId ? getHost(fixedHostId) : null;
    const selectedInitialProfile = initialProfileId || currentHost?.pcbId || "";

    const hostOptions = app.hosts.map(host => `
        <option value="${host.id}" ${host.id === (fixedHostId || "") ? "selected" : ""}>
            ${host.id} — ${host.name}
        </option>
    `).join("");

    openModal(
        currentHost ? "Edit Host PCB Profile" : "Assign PCB Profile",
        `
            <div class="pcb-assignment-form">
                <label class="form-label">Host</label>
                <select id="assignmentHost" class="form-select" ${fixedHostId ? "disabled" : ""}>
                    ${fixedHostId ? "" : "<option value=\"\">Select a host...</option>"}
                    ${hostOptions}
                </select>

                <label class="form-label">Host Display Name</label>
                <input
                    type="text"
                    id="assignmentHostName"
                    class="form-input"
                    maxlength="120"
                    value="${String(currentHost?.name || "").replace(/"/g, "&quot;")}"
                    placeholder="Enter a host name"
                >

                <label class="pcb-auto-identity">
                    <input type="checkbox" id="assignmentAutoIdentity" checked>
                    <span>
                        <strong>Auto-sync host identity from PCB</strong>
                        <small>Changing the PCB automatically updates the host name and description. You can still edit the name before saving.</small>
                    </span>
                </label>

                <div id="assignmentDescriptionPreview" class="assignment-description-preview">
                    ${String(currentHost?.description || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
                </div>

                <label class="form-label">Find PCB profile</label>
                <input
                    type="search"
                    id="assignmentSearch"
                    class="form-input"
                    placeholder="Search UAV, avionics, balloon, satellite..."
                    autocomplete="off"
                >

                <div id="assignmentSelected" class="assignment-selected">
                    ${selectedInitialProfile ? `Current profile: <strong>${selectedInitialProfile}</strong>` : "No profile selected"}
                </div>

                <div id="assignmentResults" class="assignment-results">
                    <div class="pcb-loading-inline">Search the database to choose a profile.</div>
                </div>
            </div>
        `,
        async () => {
            const hostId = document.getElementById("assignmentHost").value || fixedHostId;
            const profileId = document.getElementById("assignmentSelected").dataset.profileId || selectedInitialProfile;

            if (!hostId) {
                showToast("Select a host first.");
                return;
            }

            if (!profileId) {
                showToast("Select a PCB profile first.");
                return;
            }

            try {
                const hostNameInput = document.getElementById("assignmentHostName");
                const hostName = hostNameInput?.value.trim();

                if (!hostName) {
                    showToast("Enter a host display name.");
                    return;
                }

                await saveHostConfiguration(hostId, {
                    name: hostName,
                    pcbProfileId: profileId,
                    autoIdentity: document.getElementById("assignmentAutoIdentity")?.checked === true
                });

                await loadHostsFromBackend();
                const updatedHost = getHost(hostId);
                if (updatedHost) {
                    normalizeHostTelemetry(updatedHost);
                    syncHostStatus(updatedHost);
                    syncHostAlerts(updatedHost);
                }

                addEvent(
                    updatedHost || getHost(hostId),
                    `PCB profile assigned: ${profileId}.`,
                    "Configuration"
                );

                showToast(`PCB profile ${profileId} assigned to ${hostId}.`);

                // Reload the backend record so the new host name and PCB
                // profile are reflected everywhere immediately.
                await loadHostsFromBackend();

                if (app.currentView === "dashboard") {
                    showDashboard();
                } else if (app.currentView === "hosts" && app.selectedHostId === hostId) {
                    renderHostDetails(getHost(hostId));
                }

                // If the edited host is currently open, force the header and
                // all host-specific fields to use the backend's saved name.
                if (app.selectedHostId === hostId) {
                    const refreshed = getHost(hostId);
                    if (refreshed) {
                        setPageHeader(
                            refreshed.name,
                            `${refreshed.pcbName} · Guardian-protected host`
                        );
                        renderHostDetails(refreshed);
                    }
                }
            } catch (error) {
                showToast(`Could not save PCB profile: ${error.message}`);
            }
        }
    );

    const searchInput = document.getElementById("assignmentSearch");
    const results = document.getElementById("assignmentResults");
    const selected = document.getElementById("assignmentSelected");
    const autoIdentity = document.getElementById("assignmentAutoIdentity");
    const nameInput = document.getElementById("assignmentHostName");

    if (autoIdentity && nameInput) {
        autoIdentity.addEventListener("change", async () => {
            if (!autoIdentity.checked) return;
            const profileId = selected.dataset.profileId;
            if (!profileId) return;
            try {
                const response = await fetch(`/api/pcb-profiles/${encodeURIComponent(profileId)}`, { cache: "no-store" });
                if (!response.ok) return;
                const profile = await response.json();
                nameInput.value = profile.name || nameInput.value;
                const preview = document.getElementById("assignmentDescriptionPreview");
                if (preview) preview.textContent = profile.description || "";
            } catch (_) {}
        });
    }

    function setSelectedProfile(profile) {
        selected.dataset.profileId = profile.profile_id;
        selected.innerHTML = `Selected: <strong>${profile.profile_id}</strong><span>${profile.name}</span>`;

        const autoIdentity = document.getElementById("assignmentAutoIdentity");
        const nameInput = document.getElementById("assignmentHostName");
        const descriptionPreview = document.getElementById("assignmentDescriptionPreview");

        if (autoIdentity?.checked) {
            if (nameInput) nameInput.value = profile.name || "";
            if (descriptionPreview) descriptionPreview.textContent = profile.description || "";
        }
    }

    async function refreshAssignmentResults() {
        const query = searchInput.value.trim();
        if (!query) {
            results.innerHTML = `<div class="pcb-loading-inline">Type a name, ID, sector or mission to search.</div>`;
            return;
        }

        results.innerHTML = `<div class="pcb-loading-inline">Searching 10,000 profiles...</div>`;

        try {
            const result = await searchPCBProfilesForAssignment(query, 8);
            if (!result.profiles.length) {
                results.innerHTML = `<div class="assignment-empty">No matching PCB profiles.</div>`;
                return;
            }

            results.innerHTML = result.profiles.map(profile => `
                <button type="button" class="assignment-profile" data-profile-id="${profile.profile_id}">
                    <span>
                        <strong>${profile.profile_id}</strong>
                        <small>${profile.name}</small>
                    </span>
                    <span>${profile.altitude_band} · ${profile.power_class}</span>
                </button>
            `).join("");

            results.querySelectorAll(".assignment-profile").forEach(button => {
                button.addEventListener("click", async () => {
                    try {
                        const response = await fetch(`/api/pcb-profiles/${encodeURIComponent(button.dataset.profileId)}`, { cache: "no-store" });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const profile = await response.json();
                        setSelectedProfile(profile);
                    } catch (error) {
                        showToast(`Could not load profile: ${error.message}`);
                    }
                });
            });
        } catch (error) {
            results.innerHTML = `<div class="assignment-empty">Profile search failed: ${error.message}</div>`;
        }
    }

    let timer;
    searchInput.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(refreshAssignmentResults, 200);
    });

    if (selectedInitialProfile) {
        try {
            const response = await fetch(`/api/pcb-profiles/${encodeURIComponent(selectedInitialProfile)}`, { cache: "no-store" });
            if (response.ok) setSelectedProfile(await response.json());
        } catch (_) {
            /* The host can still be saved with its existing profile ID. */
        }
    }
}


/* =========================================================
   BASIC HELPERS
========================================================= */

function getHost(hostId) {
    return app.hosts.find(host => host.id === hostId);
}


function getPCBProfile(pcbId) {

    const direct = app.pcbProfiles.find(
        profile => profile.profile_id === pcbId || profile.id === pcbId
    );

    if (direct) {
        return direct;
    }

    /*
        Compatibility aliases for the three original frontend demo hosts.
        These can be removed once real backend host records are connected.
    */
    const legacyMap = {
        "PCB-HA-001": "AG-HA-00001",
        "PCB-TP-002": "AG-HA-00011",
        "PCB-EX-003": "AG-HA-00021"
    };

    const mappedId = legacyMap[pcbId];

    return app.pcbProfiles.find(
        profile => profile.profile_id === mappedId
    );
}


function formatNumber(value, decimals = 2) {
    return Number(value).toFixed(decimals);
}


function currentTimeString() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}


function addEvent(host, text, type = "System") {

    host.events.unshift({
        time: currentTimeString(),
        text,
        type
    });

    /* Keep frontend history bounded. */
    if (host.events.length > 100) {
        host.events = host.events.slice(0, 100);
    }
}


function showToast(message) {

    const existing = document.querySelector(".toast");

    if (existing) {
        existing.remove();
    }

    const toast = document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2800);
}


/* =========================================================
   STATUS / HEALTH
========================================================= */

function evaluateHostHealth(host) {

    const t = host.telemetry || {};
    const l = host.limits || {};

    if (!host.guardian.online) return "CRITICAL";

    const voltageOutside =
        Number.isFinite(t.voltage) &&
        (t.voltage < l.voltageMin || t.voltage > l.voltageMax);

    const currentCritical =
        Number.isFinite(t.current) && t.current > l.currentMax;

    const powerCritical =
        Number.isFinite(t.power) && t.power > l.powerMax;

    const temperatureCritical =
        Number.isFinite(t.temperature) && t.temperature >= l.temperatureCritical;

    if (voltageOutside || currentCritical || powerCritical || temperatureCritical) {
        return "CRITICAL";
    }

    const voltageMargin = Math.max(0.05, (l.voltageMax - l.voltageMin) * 0.05);
    const voltageWarning =
        Number.isFinite(t.voltage) &&
        (t.voltage <= l.voltageMin + voltageMargin || t.voltage >= l.voltageMax - voltageMargin);

    const currentWarning =
        Number.isFinite(t.current) && t.current >= l.currentMax * 0.9;

    const powerWarning =
        Number.isFinite(t.power) && t.power >= l.powerMax * 0.9;

    const temperatureWarning =
        Number.isFinite(t.temperature) && t.temperature >= l.temperatureWarning;

    if (voltageWarning || currentWarning || powerWarning || temperatureWarning) {
        return "WARNING";
    }

    return "HEALTHY";
}

function syncHostStatus(host) {

    host.status = evaluateHostHealth(host);
}


function evaluateHostAlerts(host) {

    const t = host.telemetry;
    const l = host.limits;

    const generated = [];

    if (t.temperature >= l.temperatureCritical) {

        generated.push({
            id: `${host.id}-TEMP-CRITICAL`,
            severity: "CRITICAL",
            message: "Temperature above critical threshold",
            parameter: "Temperature",
            value: t.temperature,
            threshold: l.temperatureCritical,
            unit: "°C"
        });

    } else if (t.temperature >= l.temperatureWarning) {

        generated.push({
            id: `${host.id}-TEMP-WARNING`,
            severity: "WARNING",
            message: "Temperature above warning threshold",
            parameter: "Temperature",
            value: t.temperature,
            threshold: l.temperatureWarning,
            unit: "°C"
        });
    }


    if (t.voltage >= l.voltageCritical) {

        generated.push({
            id: `${host.id}-VOLTAGE-CRITICAL`,
            severity: "CRITICAL",
            message: "Voltage above critical threshold",
            parameter: "Voltage",
            value: t.voltage,
            threshold: l.voltageCritical,
            unit: "V"
        });

    } else if (t.voltage >= l.voltageWarning) {

        generated.push({
            id: `${host.id}-VOLTAGE-WARNING`,
            severity: "WARNING",
            message: "Voltage above warning threshold",
            parameter: "Voltage",
            value: t.voltage,
            threshold: l.voltageWarning,
            unit: "V"
        });
    }


    if (t.current >= l.currentCritical) {

        generated.push({
            id: `${host.id}-CURRENT-CRITICAL`,
            severity: "CRITICAL",
            message: "Current above critical threshold",
            parameter: "Current",
            value: t.current,
            threshold: l.currentCritical,
            unit: "A"
        });

    } else if (t.current >= l.currentWarning) {

        generated.push({
            id: `${host.id}-CURRENT-WARNING`,
            severity: "WARNING",
            message: "Current above warning threshold",
            parameter: "Current",
            value: t.current,
            threshold: l.currentWarning,
            unit: "A"
        });
    }

    return generated;
}


function syncHostAlerts(host) {

    const generated = evaluateHostAlerts(host);

    const previous = host.alerts || [];

    host.alerts = generated.map(alert => {

        const old = previous.find(item => item.id === alert.id);

        return {
            ...alert,
            time: old?.time || currentTimeString(),
            acknowledged: old?.acknowledged || false
        };
    });
}


function syncAllHealth() {

    app.hosts.forEach(host => {
        syncHostStatus(host);
        syncHostAlerts(host);
    });
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document.querySelectorAll(".nav-item").forEach(item => {

        item.addEventListener("click", () => {

            const view = item.dataset.view;

            if (!view) {
                return;
            }

            navigate(view);
        });
    });


    document
        .getElementById("backToDashboard")
        .addEventListener("click", () => {

            showDashboard();
        });


    const settingsThemeToggle = document.getElementById("settingsThemeToggle");

    if (settingsThemeToggle) {
        settingsThemeToggle.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            applyTheme(current === "light" ? "dark" : "light");
            settingsThemeToggle.textContent =
                document.documentElement.getAttribute("data-theme") === "light" ? "Light" : "Dark";
        });
    }


    document
        .getElementById("modalClose")
        .addEventListener("click", closeModal);


    document
        .getElementById("modalCancel")
        .addEventListener("click", closeModal);


    document
        .getElementById("modalConfirm")
        .addEventListener("click", async () => {

            if (typeof app.modalAction === "function") {
                const action = app.modalAction;

                try {
                    await action();
                    closeModal();
                } catch (error) {
                    console.error("Modal action failed:", error);
                }
            } else {
                closeModal();
            }
        });
}


function navigate(view) {

    app.currentView = view;

    updateNavigation(view);

    switch (view) {

        case "dashboard":
            showDashboard();
            break;

        case "hosts":
            showDashboard();
            break;

        case "alerts":
            renderAlerts();
            break;

        case "history":
            renderHistory();
            break;

        case "pcb-profiles":
            renderPCBProfiles();
            break;

        case "guardian":
            renderGuardianPage();
            break;

        case "settings":
            renderSettingsPage();
            break;

        default:
            showDashboard();
    }
}


function updateNavigation(view) {

    document.querySelectorAll(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.view === view
        );
    });
}


function setPageHeader(title, subtitle) {

    document.getElementById("pageTitle").textContent = title;
    document.getElementById("pageSubtitle").textContent = subtitle;
}


function hideAllViews() {

    const dashboard = document.getElementById("dashboardView");
    const hostDetails = document.getElementById("hostDetailsView");
    const dynamic = document.getElementById("dynamicView");

    dashboard.style.display = "none";
    hostDetails.style.display = "none";
    dynamic.style.display = "none";

    // Every page starts at the top. This prevents a previous page's
    // scroll position from clipping the History header/cards.
    dashboard.scrollTop = 0;
    hostDetails.scrollTop = 0;
    dynamic.scrollTop = 0;
}


/* =========================================================
   DASHBOARD
========================================================= */

function showDashboard() {

    hideAllViews();

    document.getElementById("dashboardView").style.display = "block";

    app.currentView = "dashboard";

    updateNavigation("dashboard");

    setPageHeader(
        "Dashboard",
        "System overview and connected Guardian devices"
    );

    syncAllHealth();

    renderDashboardStats();
    renderHosts();
    renderDashboardSensors();

    document.getElementById("lastUpdate").textContent =
        currentTimeString();
}


function renderDashboardStats() {

    const healthy = app.hosts.filter(
        host => host.status === "HEALTHY"
    ).length;

    const warnings = app.hosts.filter(
        host => host.status === "WARNING"
    ).length;

    const critical = app.hosts.filter(
        host => host.status === "CRITICAL"
    ).length;

    document.getElementById("statHosts").textContent =
        app.hosts.length;

    document.getElementById("statHealthy").textContent =
        healthy;

    document.getElementById("statWarnings").textContent =
        warnings;

    document.getElementById("statCritical").textContent =
        critical;
}


function renderHosts() {

    const container = document.getElementById("hostsGrid");

    container.innerHTML = "";

    app.hosts.forEach(host => {

        const statusClass =
            host.status.toLowerCase();

        const card = document.createElement("div");

        card.className = "host-card";

        card.innerHTML = `
            <div class="host-card-top">

                <div>
                    <div class="host-name">
                        ${host.name}
                    </div>

                    <div class="host-id">
                        ${host.id}
                    </div>
                </div>

                <span class="status-badge ${statusClass}">
                    ${host.status}
                </span>

            </div>


            <div class="host-card-description">
                ${host.description}
            </div>


            <div class="host-card-metrics">

                <div class="host-mini-metric">
                    <span>Voltage</span>
                    <strong>
                        ${formatNumber(host.telemetry.voltage)} V
                    </strong>
                </div>

                <div class="host-mini-metric">
                    <span>Power</span>
                    <strong>
                        ${formatNumber(host.telemetry.power)} W
                    </strong>
                </div>

                <div class="host-mini-metric">
                    <span>Temperature</span>
                    <strong>
                        ${formatNumber(host.telemetry.temperature, 1)} °C
                    </strong>
                </div>

            </div>


            <div class="host-card-footer">

                <span class="mode-pill">
                    ${host.mode}
                </span>

                <div class="host-card-actions">
                    <button
                        class="view-button"
                        data-host-id="${host.id}">
                        View Host →
                    </button>
                    <button
                        class="view-button configure-host-button"
                        data-config-host-id="${host.id}">
                        Configure
                    </button>
                </div>

            </div>
        `;

        container.appendChild(card);
    });


    container.querySelectorAll(".view-button").forEach(button => {

        button.addEventListener("click", () => {
            if (button.dataset.configHostId) return;
            openHost(button.dataset.hostId);
        });
    });

    container.querySelectorAll(".configure-host-button").forEach(button => {
        button.addEventListener("click", () => {
            openPCBProfileAssignmentModal(button.dataset.configHostId);
        });
    });
}


/* =========================================================
   HOST DETAILS
========================================================= */

function openHost(hostId) {

    const host = getHost(hostId);

    if (!host) {
        return;
    }

    app.selectedHostId = hostId;

    hideAllViews();

    document.getElementById("hostDetailsView").style.display =
        "block";

    setPageHeader(
        host.name,
        `${host.pcbName} · Guardian-protected host`
    );

    updateNavigation("hosts");

    renderHostDetails(host);
}


function renderHostDetails(host) {

    syncHostStatus(host);
    syncHostAlerts(host);

    const statusClass =
        host.status.toLowerCase();

    document.getElementById("detailHostName").textContent =
        host.name;

    document.getElementById("detailHostId").textContent =
        host.id;

    const header = document.querySelector(".host-detail-header");
    let configButton = document.getElementById("editHostPCBButton");
    if (!configButton && header) {
        configButton = document.createElement("button");
        configButton.id = "editHostPCBButton";
        configButton.className = "primary-button host-config-button";
        configButton.textContent = "Edit PCB Profile";
        header.appendChild(configButton);
    }
    if (configButton) {
        configButton.onclick = () => openPCBProfileAssignmentModal(host.id);
    }

    document.getElementById("detailHostMeta").textContent =
        `${host.pcbName} · ${host.pcbId}`;

    renderHostProtectionConfig(host);

    const detailStatus =
        document.getElementById("detailHostStatus");

    detailStatus.className =
        `status-badge ${statusClass}`;

    detailStatus.textContent =
        host.status;


    document.getElementById("guardianStateBadge").className =
        "status-badge healthy";

    document.getElementById("guardianStateBadge").textContent =
        host.guardian.online ? "ONLINE" : "OFFLINE";

    document.getElementById("guardianStateText").textContent =
        host.guardian.online
            ? "Guardian Active"
            : "Guardian Offline";

    document.getElementById("guardianStateDescription").textContent =
        host.guardian.online
            ? "Autonomous protection is operating normally."
            : "Guardian communication has been lost.";

    document.getElementById("guardianCycle").textContent =
        `${host.guardian.cycle} s`;

    document.getElementById("guardianLastCycle").textContent =
        host.guardian.lastCycle;

    document.getElementById("guardianProtection").textContent =
        host.guardian.protection;


    document.getElementById("connectionGuardian").textContent =
        host.guardian.online ? "Connected" : "Disconnected";

    document.getElementById("connectionTelemetry").textContent =
        currentTimeString();

    document.getElementById("connectionSignal").textContent =
        host.signal;


    document.getElementById("telemetryVoltage").textContent =
        formatNumber(host.telemetry.voltage);

    document.getElementById("telemetryCurrent").textContent =
        formatNumber(host.telemetry.current);

    document.getElementById("telemetryPower").textContent =
        formatNumber(host.telemetry.power);

    document.getElementById("telemetryTemperature").textContent =
        formatNumber(host.telemetry.temperature, 1);


    document
        .querySelectorAll(".mode-button")
        .forEach(button => {

            const isSelected = button.dataset.mode === host.mode;
            button.classList.toggle("active", isSelected);
            button.setAttribute("aria-pressed", isSelected ? "true" : "false");
            button.dataset.selected = isSelected ? "true" : "false";

            button.onclick = () => {

                requestModeChange(
                    host.id,
                    button.dataset.mode
                );
            };
        });


    renderCommandHistory(host);
    loadHostCommandHistory(host);

    renderCharts(host);
}


/* =========================================================
   MODE CONTROL
========================================================= */

function requestModeChange(hostId, requestedMode) {

    if (getSetting("remoteModeRequests", true) === false) {
        showToast("Remote mode requests are disabled in Guardian settings.");
        return;
    }

    const host = getHost(hostId);

    if (!host) return;

    if (host.mode === requestedMode) {
        showToast(`Host is already operating in ${requestedMode} mode.`);
        return;
    }

    openModal(
        "Confirm Remote Command",
        `
            Request <strong>${requestedMode}</strong> mode
            for <strong>${host.name}</strong>?
            <br><br>
            The command will be evaluated by the Guardian safety engine.
        `,
        async () => {

            try {
                const response = await fetch(
                    `/api/hosts/${encodeURIComponent(hostId)}/commands/mode`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ mode: requestedMode })
                    }
                );

                const result = await response.json();

                host.commandHistory.unshift({
                    time: currentTimeString(),
                    type: result.accepted ? "ACCEPTED" : "REJECTED",
                    command: requestedMode,
                    description: result.reason || "Guardian decision.",
                    actor: app.currentUser?.displayName || "User"
                });

                if (result.accepted) {
                    host.mode = requestedMode;
                    addEvent(
                        host,
                        `Guardian accepted remote ${requestedMode} mode: ${result.reason}`,
                        "Command"
                    );
                    showToast(`Guardian accepted ${requestedMode} mode. ${result.reason}`);
                } else {
                    addEvent(
                        host,
                        `Guardian rejected remote ${requestedMode} mode: ${result.reason}`,
                        "Command"
                    );
                    showToast(`Guardian rejected ${requestedMode} mode. ${result.reason}`);
                }

                renderHostDetails(host);
                await loadHostCommandHistory(host);

            } catch (error) {
                showToast(`Command failed: ${error.message}`);
            }
        }
    );
}


function validateGuardianCommand(host, requestedMode) {
    // The local Guardian is the final authority. SAFE is a protective
    // fallback and must remain available during warning/critical states.
    if (!host.guardian || !host.guardian.online) {
        return { accepted: false, reason: "Guardian is offline; remote command cannot be executed." };
    }

    if (!['SAFE', 'NOMINAL', 'HIGH'].includes(requestedMode)) {
        return { accepted: false, reason: "Unknown performance mode." };
    }

    // SAFE is an emergency/protective command. Once the local Guardian is
    // online, a remote request to SAFE must never be blocked by the host's
    // current WARNING/CRITICAL state or by operating-envelope checks.
    // Those conditions are precisely why SAFE exists.
    if (requestedMode === 'SAFE') {
        return {
            accepted: true,
            reason: 'SAFE accepted by Guardian: protective fallback is permitted in all host health states.'
        };
    }

    const t = host.telemetry || {};
    const l = host.limits || {};

    // SAFE is a protective command. Do not reject it merely because the
    // host is already outside a limit or in WARNING/CRITICAL state.
    // A healthy, online Guardian can always request the protective state.
    if (requestedMode === 'SAFE') {
        return { accepted: true, reason: "SAFE accepted: protective fallback is permitted during warning and critical conditions." };
    }

    if (!Number.isFinite(t.voltage) || !Number.isFinite(t.current) || !Number.isFinite(t.power) || !Number.isFinite(t.temperature)) {
        return { accepted: false, reason: "Telemetry is incomplete; Guardian cannot safely approve this mode." };
    }

    // A non-SAFE mode requires the host to be inside its active envelope.
    if (t.voltage < l.voltageMin || t.voltage > l.voltageMax) {
        return { accepted: false, reason: "Voltage is outside the active protection envelope." };
    }
    if (t.current > l.currentMax) {
        return { accepted: false, reason: "Current exceeds the active protection limit." };
    }
    if (t.power > l.powerMax) {
        return { accepted: false, reason: "Power exceeds the active protection limit." };
    }
    if (t.temperature < l.temperatureMin || t.temperature >= l.temperatureCritical) {
        return { accepted: false, reason: "Temperature is outside the active operating envelope." };
    }

    if (requestedMode === 'HIGH') {
        if (host.status !== 'HEALTHY') {
            return { accepted: false, reason: "HIGH requires HEALTHY host status." };
        }
        if (t.temperature >= l.temperatureWarning) {
            return { accepted: false, reason: "HIGH is blocked while temperature is at or above the warning threshold." };
        }
        if (t.power > l.powerMax * 0.85) {
            return { accepted: false, reason: "HIGH requires power below 85% of the active maximum." };
        }
    }

    if (requestedMode === 'NOMINAL') {
        if (host.status === 'CRITICAL') {
            return { accepted: false, reason: "NOMINAL is blocked while the host is CRITICAL. Select SAFE to protect the host." };
        }
        if (t.temperature >= l.temperatureWarning) {
            return { accepted: false, reason: "NOMINAL is blocked while temperature is at or above the warning threshold." };
        }
    }

    return { accepted: true, reason: `${requestedMode} accepted by Guardian.` };
}

/* =========================================================
   COMMAND HISTORY
========================================================= */

async function loadHostCommandHistory(host) {
    try {
        const response = await fetch(`/api/hosts/${encodeURIComponent(host.id)}/commands`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        if (!Array.isArray(result.commands)) return;

        host.commandHistory = result.commands.map(command => ({
            id: command.id,
            time: new Date(command.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            type: command.decision,
            command: command.requested_mode,
            description: command.reason,
            actor: command.actor
        }));

        if (app.currentView === "hosts" && app.selectedHostId === host.id) {
            renderCommandHistory(host);
        }
    } catch (error) {
        console.error("Could not load remote command history", error);
    }
}

function renderCommandHistory(host) {

    const container =
        document.getElementById("commandHistory");

    if (!host.commandHistory.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">◷</div>
                <strong>No remote commands</strong>
                <p>No remote commands have been recorded.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="command-list">

            ${host.commandHistory.map(command => `

                <div class="command-row">

                    <div class="command-time">
                        ${command.time}
                    </div>

                    <div class="command-type ${
                        command.type === "ACCEPTED"
                            ? "accepted"
                            : "rejected"
                    }">
                        ${command.type}
                    </div>

                    <div class="command-description">
                        ${command.description}
                        <br>
                        Requested mode:
                        <strong>${command.command}</strong>
                    </div>

                    <div class="command-actor">
                        ${command.actor}
                    </div>

                </div>

            `).join("")}

        </div>
    `;
}


/* =========================================================
   CHARTS
========================================================= */

function chartOptions(unit, decimals = 2) {

    const isLight =
        document.documentElement.getAttribute("data-theme") === "light";

    const gridColor = isLight
        ? "rgba(60,72,88,0.10)"
        : "rgba(255,255,255,0.04)";

    const tickColor = isLight
        ? "#68778a"
        : "#687180";

    return {

        responsive: true,
        maintainAspectRatio: false,

        animation: {
            duration: 700,
            easing: "easeOutQuart"
        },

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {
                enabled: true,
                mode: "index",
                intersect: false,
                displayColors: false,

                backgroundColor: isLight ? "#17202b" : "#11151d",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
                borderColor: isLight ? "#cbd4df" : "#303744",
                borderWidth: 1,
                padding: 9,

                callbacks: {

                    label: function(context) {

                        const value = Number(context.parsed.y);

                        return `${value.toFixed(decimals)} ${unit}`;
                    }
                }
            }
        },

        scales: {

            x: {
                grid: {
                    color: gridColor
                },

                ticks: {
                    color: tickColor,
                    font: {
                        size: 8
                    }
                }
            },

            y: {
                grid: {
                    color: gridColor
                },

                ticks: {
                    color: tickColor,
                    font: {
                        size: 8
                    }
                }
            }
        },

        elements: {

            line: {
                tension: 0.35,
                borderWidth: 2
            },

            point: {
                radius: 0,
                hoverRadius: 5,
                hitRadius: 12
            }
        }
    };
}


function destroyCharts() {

    Object.keys(app.charts).forEach(key => {

        if (app.charts[key]) {

            app.charts[key].destroy();

            app.charts[key] = null;
        }
    });
}


function renderCharts(host) {

    destroyCharts();

    const labels = host.history.labels;


    const voltageCanvas =
        document.getElementById("voltageChart");

    const powerCanvas =
        document.getElementById("powerChart");

    const temperatureCanvas =
        document.getElementById("temperatureChart");


    app.charts.voltage = new Chart(
        voltageCanvas,
        {
            type: "line",

            data: {
                labels,

                datasets: [
                    {
                        label: "Voltage",
                        data: host.history.voltage,
                        borderColor: "#8fa4ff",
                        backgroundColor: "rgba(143,164,255,0.08)",
                        fill: true
                    }
                ]
            },

            options: chartOptions("V", 3)
        }
    );


    app.charts.power = new Chart(
        powerCanvas,
        {
            type: "line",

            data: {
                labels,

                datasets: [
                    {
                        label: "Power",
                        data: host.history.power,
                        borderColor: "#55c78a",
                        backgroundColor: "rgba(85,199,138,0.06)",
                        fill: true
                    }
                ]
            },

            options: chartOptions("W", 2)
        }
    );


    app.charts.temperature = new Chart(
        temperatureCanvas,
        {
            type: "line",

            data: {
                labels,

                datasets: [
                    {
                        label: "Temperature",
                        data: host.history.temperature,
                        borderColor: "#e5b85c",
                        backgroundColor: "rgba(229,184,92,0.06)",
                        fill: true
                    }
                ]
            },

            options: chartOptions("°C", 1)
        }
    );
}


/* =========================================================
   PCB PROFILES
========================================================= */

async function renderPCBProfiles() {

    hideAllViews();

    const container = document.getElementById("dynamicView");
    container.style.display = "block";

    setPageHeader(
        "PCB Profiles",
        "High-altitude electronics profiles used for automatic Guardian configuration"
    );

    updateNavigation("pcb-profiles");

    container.innerHTML = `
        <div class="page-header-block">
            <div>
                <h2>High-Altitude PCB Profile Database</h2>
                <p>Search and configure against 10,000 scalable reference profiles without loading the full dataset into the browser.</p>
            </div>
            <div class="pcb-dataset-badge">10,000 PROFILES</div>
        </div>

        <div class="pcb-profile-toolbar">
            <div class="pcb-search-wrap">
                <span class="pcb-search-icon">⌕</span>
                <input
                    type="search"
                    id="pcbProfileSearch"
                    placeholder="Search UAV, avionics, telemetry, balloon, satellite..."
                    autocomplete="off"
                >
            </div>

            <select id="pcbSectorFilter">
                <option value="ALL">All sectors</option>
            </select>

            <select id="pcbAltitudeFilter">
                <option value="ALL">All altitudes</option>
            </select>

            <select id="pcbPowerFilter">
                <option value="ALL">All power classes</option>
            </select>
        </div>

        <div class="pcb-results-line">
            <span id="pcbResultsCount">Loading profiles...</span>
            <span>Reference profiles • validation required</span>
        </div>

        <div class="pcb-profile-grid" id="pcbProfileGrid"></div>

        <div class="pcb-pagination" id="pcbPagination"></div>

        <div class="auto-config-panel">
            <strong>Automatic Guardian Configuration</strong>
            <p>
                The database provides a scalable hardware-profile layer. A real deployment must replace
                reference values with validated limits from the actual PCB, components, mission requirements
                and qualification evidence. The local Guardian remains the final safety authority.
            </p>
        </div>
    `;

    const grid = document.getElementById("pcbProfileGrid");
    const searchInput = document.getElementById("pcbProfileSearch");
    const sectorFilter = document.getElementById("pcbSectorFilter");
    const altitudeFilter = document.getElementById("pcbAltitudeFilter");
    const powerFilter = document.getElementById("pcbPowerFilter");
    const pagination = document.getElementById("pcbPagination");

    const stats = await loadPCBProfileStats();
    app.pcbProfileStats = stats;

    if (stats) {
        for (const item of stats.sectors || []) {
            sectorFilter.insertAdjacentHTML("beforeend", `<option value="${item.sector}">${item.sector}</option>`);
        }
        for (const item of stats.altitudes || []) {
            altitudeFilter.insertAdjacentHTML("beforeend", `<option value="${item.altitude_band}">${item.altitude_band}</option>`);
        }
        for (const item of stats.powerClasses || []) {
            powerFilter.insertAdjacentHTML("beforeend", `<option value="${item.power_class}">${item.power_class}</option>`);
        }
    }

    let requestSerial = 0;

    async function refreshProfiles(page = 1) {
        const serial = ++requestSerial;
        const search = searchInput.value.trim();

        grid.innerHTML = `<div class="pcb-loading-inline"><div class="loading-spinner"></div><strong>Searching database...</strong></div>`;

        const ok = await loadPCBProfiles({
            page,
            pageSize: 24,
            search,
            sector: sectorFilter.value,
            altitude: altitudeFilter.value,
            power: powerFilter.value
        });

        if (serial !== requestSerial) return;

        if (!ok) {
            grid.innerHTML = `
                <div class="empty-state pcb-empty-state">
                    <div class="empty-state-icon">!</div>
                    <strong>PCB database unavailable</strong>
                    <p>Start AltisGuardian with <code>npm start</code>, then retry.</p>
                    <button class="primary-button" id="retryPCBProfiles">Retry</button>
                </div>
            `;
            document.getElementById("pcbResultsCount").textContent = "Database offline";
            return;
        }

        const meta = app.pcbProfilePagination;
        document.getElementById("pcbResultsCount").textContent =
            `${meta.total.toLocaleString()} matching profile${meta.total === 1 ? "" : "s"}`;

        if (app.pcbProfiles.length === 0) {
            grid.innerHTML = `
                <div class="empty-state pcb-empty-state">
                    <div class="empty-state-icon">⌕</div>
                    <strong>No matching profiles</strong>
                    <p>Try a different mission, sector, altitude or power class.</p>
                </div>
            `;
        } else {
            grid.innerHTML = app.pcbProfiles.map(profile => {
                const view = formatPCBProfile(profile);
                return `
                    <div class="pcb-profile-card">
                        <div class="pcb-profile-top">
                            <div>
                                <div class="pcb-profile-name">${view.name}</div>
                                <div class="pcb-profile-id">${view.id}</div>
                            </div>
                            <span class="profile-active">${view.sector}</span>
                        </div>

                        <div class="pcb-profile-description">
                            ${view.mission} • ${view.altitude}
                        </div>

                        <div class="profile-validation-badge">
                            REFERENCE • UNVALIDATED
                        </div>

                        <div class="profile-specs">
                            <div class="profile-spec">
                                <span>Altitude</span>
                                <strong>${view.altitude}</strong>
                            </div>
                            <div class="profile-spec">
                                <span>Power Class</span>
                                <strong>${view.powerClass}</strong>
                            </div>
                            <div class="profile-spec">
                                <span>SAFE</span>
                                <strong>${view.safePower}</strong>
                            </div>
                            <div class="profile-spec">
                                <span>NOMINAL</span>
                                <strong>${view.nominalPower}</strong>
                            </div>
                            <div class="profile-spec">
                                <span>HIGH</span>
                                <strong>${view.highPower}</strong>
                            </div>
                            <div class="profile-spec">
                                <span>Temp. Warning</span>
                                <strong>${view.thermalWarning}</strong>
                            </div>
                        </div>

                        <div class="pcb-profile-assignment-row">
                            <button
                                type="button"
                                class="assign-pcb-button"
                                data-profile-id="${view.id}"
                                aria-label="Assign ${view.id} to a host"
                            >ASSIGN TO HOST</button>
                        </div>

                    </div>
                `;
            }).join("");
        }

        grid.querySelectorAll(".assign-pcb-button").forEach(button => {
            button.addEventListener("click", () => {
                openPCBProfileAssignmentModal(null, button.dataset.profileId);
            });
        });

        const totalPages = meta.totalPages;
        const currentPage = meta.page;
        const buttons = [];

        buttons.push(`<button class="secondary-button" data-page="${currentPage - 1}" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>`);
        buttons.push(`<span>Page ${currentPage.toLocaleString()} of ${totalPages.toLocaleString()}</span>`);
        buttons.push(`<button class="secondary-button" data-page="${currentPage + 1}" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>`);

        pagination.innerHTML = buttons.join("");
        pagination.querySelectorAll("button[data-page]").forEach(button => {
            button.addEventListener("click", () => {
                const target = Number(button.dataset.page);
                if (target >= 1 && target <= totalPages) refreshProfiles(target);
            });
        });
    }

    let debounceTimer;
    function scheduleSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => refreshProfiles(1), 250);
    }

    searchInput.addEventListener("input", scheduleSearch);
    sectorFilter.addEventListener("change", () => refreshProfiles(1));
    altitudeFilter.addEventListener("change", () => refreshProfiles(1));
    powerFilter.addEventListener("change", () => refreshProfiles(1));

    await refreshProfiles(1);

    const retry = document.getElementById("retryPCBProfiles");
    if (retry) retry.addEventListener("click", () => renderPCBProfiles());
}


/* =========================================================
   ALERTS
========================================================= */

function getAlertCounts() {

    let active = 0;
    let critical = 0;
    let warning = 0;
    let acknowledged = 0;

    app.hosts.forEach(host => {

        host.alerts.forEach(alert => {

            if (alert.acknowledged) {
                acknowledged++;
            } else {
                active++;
            }

            if (alert.severity === "CRITICAL") {
                critical++;
            }

            if (alert.severity === "WARNING") {
                warning++;
            }

        });
    });

    return {
        active,
        critical,
        warning,
        acknowledged
    };
}


function renderAlerts() {

    hideAllViews();

    const container =
        document.getElementById("dynamicView");

    container.style.display = "block";

    setPageHeader(
        "Alerts",
        "Active warnings, critical conditions and acknowledgements"
    );

    updateNavigation("alerts");

    syncAllHealth();

    const counts = getAlertCounts();

    const alerts = [];

    app.hosts.forEach(host => {

        host.alerts.forEach(alert => {

            alerts.push({
                ...alert,
                hostId: host.id,
                hostName: host.name
            });
        });
    });


    alerts.sort((a, b) => {

        if (a.severity === "CRITICAL" &&
            b.severity !== "CRITICAL") {

            return -1;
        }

        if (a.severity !== "CRITICAL" &&
            b.severity === "CRITICAL") {

            return 1;
        }

        return 0;
    });


    container.innerHTML = `

        <div class="page-header-block">

            <h2>Alert Center</h2>

            <p>
                Guardian protection conditions detected across
                connected hosts.
            </p>

        </div>


        <div class="alert-summary-grid">

            <div class="alert-summary">
                <span>ACTIVE</span>
                <strong>${counts.active}</strong>
            </div>

            <div class="alert-summary">
                <span>CRITICAL</span>
                <strong>${counts.critical}</strong>
            </div>

            <div class="alert-summary">
                <span>WARNING</span>
                <strong>${counts.warning}</strong>
            </div>

            <div class="alert-summary">
                <span>ACKNOWLEDGED</span>
                <strong>${counts.acknowledged}</strong>
            </div>

        </div>


        <div class="panel">

            ${
                alerts.length === 0

                ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">✓</div>
                        <strong>No alerts</strong>
                        <p>All monitored systems are operating within limits.</p>
                    </div>
                  `

                : `
                    <table class="alert-table">

                        <thead>

                            <tr>
                                <th>SEVERITY</th>
                                <th>HOST</th>
                                <th>CONDITION</th>
                                <th>VALUE</th>
                                <th>TIME</th>
                                <th>STATUS</th>
                                <th></th>
                            </tr>

                        </thead>

                        <tbody>

                            ${alerts.map(alert => `

                                <tr>

                                    <td>
                                        <span class="alert-severity ${
                                            alert.severity.toLowerCase()
                                        }">
                                            ${alert.severity}
                                        </span>
                                    </td>

                                    <td>
                                        ${alert.hostName}
                                        <br>
                                        <small>
                                            ${alert.hostId}
                                        </small>
                                    </td>

                                    <td>
                                        ${alert.message}
                                    </td>

                                    <td>
                                        ${formatNumber(alert.value, 1)}
                                        ${alert.unit}
                                        <br>
                                        <small>
                                            Limit:
                                            ${alert.threshold}
                                            ${alert.unit}
                                        </small>
                                    </td>

                                    <td>
                                        ${alert.time}
                                    </td>

                                    <td class="${
                                        alert.acknowledged
                                            ? "acknowledged"
                                            : ""
                                    }">

                                        ${
                                            alert.acknowledged
                                                ? "Acknowledged"
                                                : "Active"
                                        }

                                    </td>

                                    <td>

                                        ${
                                            alert.acknowledged

                                            ? ""

                                            : `
                                                <button
                                                    class="alert-ack"
                                                    data-host-id="${alert.hostId}"
                                                    data-alert-id="${alert.id}">
                                                    Acknowledge
                                                </button>
                                              `
                                        }

                                    </td>

                                </tr>

                            `).join("")}

                        </tbody>

                    </table>
                `
            }

        </div>


        <div class="auto-config-panel">

            <strong>Guardian protection remains active</strong>

            <p>
                Acknowledging an alert only records that an operator
                has seen the condition. It does not disable, modify,
                or bypass Guardian protection.
            </p>

        </div>
    `;


    container
        .querySelectorAll(".alert-ack")
        .forEach(button => {

            button.addEventListener("click", () => {

                acknowledgeAlert(
                    button.dataset.hostId,
                    button.dataset.alertId
                );
            });
        });


    updateAlertNavigation();
}


function acknowledgeAlert(hostId, alertId) {

    const host = getHost(hostId);

    if (!host) {
        return;
    }

    const alert = host.alerts.find(
        item => item.id === alertId
    );

    if (!alert) {
        return;
    }

    alert.acknowledged = true;

    addEvent(
        host,
        `Alert acknowledged: ${alert.message}.`,
        "Alert"
    );

    renderAlerts();

    showToast("Alert acknowledged.");
}


function updateAlertNavigation() {

    const counts = getAlertCounts();

    const label =
        document.getElementById("alertsNavLabel");

    label.textContent =
        counts.active > 0
            ? `Alerts (${counts.active})`
            : "Alerts";
}


/* =========================================================
   HISTORY
========================================================= */

async function renderHistory() {

    hideAllViews();

    const container =
        document.getElementById("dynamicView");

    container.style.display = "block";

    setPageHeader(
        "History",
        "Chronological Guardian, telemetry, alert and command events"
    );

    updateNavigation("history");


    const allEvents = [];

    app.hosts.forEach(host => {

        host.events.forEach(event => {

            allEvents.push({
                ...event,
                hostId: host.id,
                hostName: host.name
            });
        });
    });


    // Remote commands are persisted by the backend. Merge them into
    // History so rejected commands survive page reloads.
    try {
        const response = await fetch("/api/audit?limit=500", { cache: "no-store" });
        if (response.ok) {
            const result = await response.json();

            (result.events || []).forEach(event => {
                if (event.event_type !== "MODE_COMMAND") return;

                const host = app.hosts.find(h => h.id === event.host_id);
                if (!host) return;

                allEvents.push({
                    time: new Date(event.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }),
                    text: event.description,
                    type: "Command",
                    hostId: event.host_id,
                    hostName: host.name
                });
            });
        }
    } catch (error) {
        console.error("Could not load persisted audit history", error);
    }

    // Remove duplicate command rows that may already exist in the local
    // in-memory event list.
    const seen = new Set();
    const uniqueEvents = allEvents.filter(event => {
        const key = [
            event.hostId,
            event.type,
            event.time,
            event.text
        ].join("|");

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    allEvents.length = 0;
    allEvents.push(...uniqueEvents);

    const typeCounts = {

        Guardian: 0,
        Telemetry: 0,
        Alert: 0,
        Command: 0,
        System: 0
    };


    allEvents.forEach(event => {

        if (typeCounts[event.type] !== undefined) {
            typeCounts[event.type]++;
        }
    });


    container.innerHTML = `

        <div class="page-header-block">

            <h2>System Event History</h2>

            <p>
                Unified record of Guardian activity,
                telemetry reception, alerts and remote commands.
            </p>

        </div>


        <div class="stats-grid">

            <div class="stat-card">

                <div class="stat-header">
                    <span>Guardian Events</span>
                </div>

                <div class="stat-value">
                    ${typeCounts.Guardian}
                </div>

                <div class="stat-description">
                    Autonomous control activity
                </div>

            </div>


            <div class="stat-card">

                <div class="stat-header">
                    <span>Telemetry Events</span>
                </div>

                <div class="stat-value">
                    ${typeCounts.Telemetry}
                </div>

                <div class="stat-description">
                    Telemetry reception
                </div>

            </div>


            <div class="stat-card">

                <div class="stat-header">
                    <span>Alert Events</span>
                </div>

                <div class="stat-value">
                    ${typeCounts.Alert}
                </div>

                <div class="stat-description">
                    Warnings and acknowledgements
                </div>

            </div>


            <div class="stat-card">

                <div class="stat-header">
                    <span>Command Events</span>
                </div>

                <div class="stat-value">
                    ${typeCounts.Command}
                </div>

                <div class="stat-description">
                    Remote requests
                </div>

            </div>

        </div>


        <div class="history-toolbar">

            <select class="history-filter" id="historyHostFilter">

                <option value="ALL">
                    All Hosts
                </option>

                ${app.hosts.map(host => `
                    <option value="${host.id}">
                        ${host.id}
                    </option>
                `).join("")}

            </select>


            <select class="history-filter" id="historyTypeFilter">

                <option value="ALL">
                    All Event Types
                </option>

                <option value="Guardian">Guardian</option>
                <option value="Telemetry">Telemetry</option>
                <option value="Alert">Alert</option>
                <option value="Command">Command</option>
                <option value="System">System</option>

            </select>


            <input
                class="history-search"
                id="historySearch"
                type="text"
                placeholder="Search events..."
            >

        </div>


        <div
            class="history-list"
            id="historyList">
        </div>
    `;


    const hostFilter =
        document.getElementById("historyHostFilter");

    const typeFilter =
        document.getElementById("historyTypeFilter");

    const search =
        document.getElementById("historySearch");


    function updateHistoryList() {

        const hostValue = hostFilter.value;
        const typeValue = typeFilter.value;
        const searchValue =
            search.value.trim().toLowerCase();


        const filtered =
            allEvents.filter(event => {

                const hostMatch =
                    hostValue === "ALL" ||
                    event.hostId === hostValue;

                const typeMatch =
                    typeValue === "ALL" ||
                    event.type === typeValue;

                const searchMatch =
                    !searchValue ||
                    (event.text || '').toLowerCase().includes(searchValue) ||
                    (event.hostName || '').toLowerCase().includes(searchValue) ||
                    event.hostId.toLowerCase().includes(searchValue);

                return hostMatch &&
                    typeMatch &&
                    searchMatch;
            });


        const list =
            document.getElementById("historyList");


        if (!filtered.length) {

            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">◷</div>
                    <strong>No matching events</strong>
                    <p>Try changing the selected filters.</p>
                </div>
            `;

            return;
        }


        list.innerHTML = filtered.map(event => `

            <div class="history-row">

                <div class="history-time">
                    ${event.time}
                </div>

                <div class="history-type ${event.type.toLowerCase()}">
                    ${event.type.toUpperCase()}
                </div>

                <div class="history-host">
                    ${event.hostId}
                </div>

                <div class="history-description">
                    ${event.text}
                </div>

            </div>

        `).join("");
    }


    hostFilter.addEventListener(
        "change",
        updateHistoryList
    );

    typeFilter.addEventListener(
        "change",
        updateHistoryList
    );

    search.addEventListener(
        "input",
        updateHistoryList
    );


    updateHistoryList();
}


/* =========================================================
   GUARDIAN PAGE
========================================================= */

function getSetting(key, fallback = true) {
    const raw = localStorage.getItem(`altisguardian-${key}`);
    if (raw === null) return fallback;
    return raw === "true";
}

function setSetting(key, value) {
    app.settings[key] = Boolean(value);
    localStorage.setItem(`altisguardian-${key}`, String(Boolean(value)));
    return app.settings[key];
}

function wireToggle(element, key, labelElement = null) {
    if (!element) return;

    const current = getSetting(key, app.settings[key] !== false);
    app.settings[key] = current;
    element.classList.toggle("on", current);
    element.classList.toggle("off", !current);
    element.setAttribute("role", "switch");
    element.setAttribute("aria-checked", String(current));
    element.tabIndex = 0;

    const update = () => {
        const next = !app.settings[key];
        setSetting(key, next);
        element.classList.toggle("on", next);
        element.classList.toggle("off", !next);
        element.setAttribute("aria-checked", String(next));
        if (labelElement) labelElement.textContent = next ? "ON" : "OFF";
    };

    element.onclick = update;
    element.onkeydown = event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            update();
        }
    };
}

function renderGuardianPage() {

    hideAllViews();

    const container =
        document.getElementById("dynamicView");

    container.style.display = "block";

    setPageHeader(
        "Guardian",
        "Autonomous protection and control configuration"
    );

    updateNavigation("guardian");


    container.innerHTML = `

        <div class="page-header-block">

            <h2>Guardian Management</h2>

            <p>
                Monitor Guardian operation and protection authority.
            </p>

        </div>


        <div class="info-grid">

            <div class="info-card">

                <h3>Autonomous Control</h3>

                <p>
                    Each Guardian performs its own supervisory
                    control cycle independently of the remote
                    web interface.
                </p>

                <div class="setting-row">
                    <div>
                        <strong>Control interval</strong>
                        <span>Guardian supervisory cycle</span>
                    </div>

                    <strong>30 seconds</strong>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Protection authority</strong>
                        <span>Local Guardian</span>
                    </div>

                    <strong>ACTIVE</strong>
                </div>

            </div>


            <div class="info-card">

                <h3>Black-Box Buffer</h3>

                <p>
                    Guardian-side records remain available during
                    communication loss and can be synchronized
                    after reconnection.
                </p>

                <div class="setting-row">
                    <div>
                        <strong>Telemetry logging</strong>
                        <span>Local recording</span>
                    </div>

                    <div class="toggle on" id="guardianTelemetryToggle"></div>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Event logging</strong>
                        <span>Faults and actions</span>
                    </div>

                    <div class="toggle on" id="guardianEventToggle"></div>
                </div>

            </div>


            <div class="info-card">

                <h3>Connected Guardians</h3>

                <p>
                    Current Guardian communication state across
                    registered hosts.
                </p>

                ${app.hosts.map(host => `

                    <div class="setting-row">

                        <div>
                            <strong>${host.id}</strong>
                            <span>${host.name}</span>
                        </div>

                        <strong>
                            ${host.guardian.online
                                ? "ONLINE"
                                : "OFFLINE"}
                        </strong>

                    </div>

                `).join("")}

            </div>


            <div class="info-card">

                <h3>Remote Command Policy</h3>

                <p>
                    Commands received from the web interface are
                    requests only. Guardian-side safety validation
                    remains authoritative.
                </p>

                <div class="setting-row">
                    <div>
                        <strong>Remote mode requests</strong>
                        <span>Operator access</span>
                    </div>

                    <div class="toggle on" id="guardianRemoteToggle"></div>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Local protection override</strong>
                        <span>Web access</span>
                    </div>

                    <strong>NOT PERMITTED</strong>
                </div>

            </div>

        </div>
    `;

    wireToggle(document.getElementById("guardianTelemetryToggle"), "telemetryLogging");
    wireToggle(document.getElementById("guardianEventToggle"), "eventLogging");
    wireToggle(document.getElementById("guardianRemoteToggle"), "remoteModeRequests");
}


/* =========================================================
   SETTINGS PAGE
========================================================= */

function renderSettingsPage() {

    hideAllViews();

    const container = document.getElementById("dynamicView");
    container.style.display = "block";

    setPageHeader(
        "Settings",
        "Application and communication configuration"
    );

    updateNavigation("settings");

    const refresh = getTelemetryRefreshSeconds();

    container.innerHTML = `

        <div class="page-header-block">
            <h2>System Settings</h2>
            <p>
                Configure the web application's display and communication preferences.
            </p>
        </div>

        <div class="info-grid">

            <div class="info-card">
                <h3>Communication</h3>

                <div class="setting-row">
                    <div>
                        <strong>Backend connection</strong>
                        <span>API communication</span>
                    </div>
                    <strong>CONNECTED</strong>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Telemetry stream</strong>
                        <span>Real-time channel</span>
                    </div>
                    <strong>READY</strong>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Guardian synchronization</strong>
                        <span>Device communication</span>
                    </div>
                    <strong>ENABLED</strong>
                </div>
            </div>

            <div class="info-card">
                <h3>Application</h3>

                <div class="setting-row">
                    <div>
                        <strong>Theme</strong>
                        <span>User interface</span>
                    </div>
                    <button class="theme-setting-button" type="button" id="settingsThemeToggle">
                        ${document.documentElement.getAttribute("data-theme") === "dark" ? "Dark" : "Light"}
                    </button>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Notifications</strong>
                        <span>System alerts</span>
                    </div>
                    <div class="toggle" id="settingsNotificationsToggle"></div>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Telemetry refresh</strong>
                        <span>Web telemetry display interval</span>
                    </div>

                    <select class="settings-select" id="telemetryRefreshSelect">
                        ${[5,10,30,60].map(value => `
                            <option value="${value}" ${value === refresh ? "selected" : ""}>
                                ${value} seconds
                            </option>
                        `).join("")}
                    </select>
                </div>
            </div>

            <div class="info-card">
                <h3>Security</h3>

                <div class="setting-row">
                    <div>
                        <strong>Authentication</strong>
                        <span>Account login</span>
                    </div>
                    <strong>BACKEND</strong>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Role-based access</strong>
                        <span>Operator / Administrator</span>
                    </div>
                    <strong>ENABLED</strong>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Audit logging</strong>
                        <span>Remote actions</span>
                    </div>
                    <div class="toggle" id="settingsAuditToggle"></div>
                </div>
            </div>

            <div class="info-card">
                <h3>System Information</h3>

                <div class="setting-row">
                    <div>
                        <strong>Application</strong>
                        <span>AltisGuardian Web</span>
                    </div>
                    <strong>2.0</strong>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Hosts</strong>
                        <span>Registered systems</span>
                    </div>
                    <strong>${app.hosts.length}</strong>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>PCB profiles</strong>
                        <span>Supported configurations</span>
                    </div>
                    <strong>${app.pcbProfileStats?.total ?? 10000}</strong>
                </div>
            </div>

        </div>
    `;

    const themeButton = document.getElementById("settingsThemeToggle");

    if (themeButton) {
        themeButton.onclick = () => {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            applyTheme(current === "light" ? "dark" : "light");
            themeButton.textContent =
                document.documentElement.getAttribute("data-theme") === "dark"
                    ? "Dark"
                    : "Light";
        };
    }

    const refreshSelect = document.getElementById("telemetryRefreshSelect");

    if (refreshSelect) {
        refreshSelect.addEventListener("change", event => {
            setTelemetryRefreshSeconds(event.target.value);
        });
    }

    wireToggle(
        document.getElementById("settingsNotificationsToggle"),
        "notifications"
    );

    wireToggle(
        document.getElementById("settingsAuditToggle"),
        "auditLogging"
    );
}

/* =========================================================
   MODAL
========================================================= */

function openModal(title, body, action) {

    document.getElementById("modalTitle").textContent =
        title;

    document.getElementById("modalBody").innerHTML =
        body;

    app.modalAction = action;

    document
        .getElementById("modalOverlay")
        .classList.add("show");
}


function closeModal() {

    document
        .getElementById("modalOverlay")
        .classList.remove("show");

    app.modalAction = null;
}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    document.getElementById("currentTime").textContent =
        currentTimeString();
}


/* =========================================================
   SIMULATED TELEMETRY UPDATE
========================================================= */

function simulateTelemetryCycle() {

    app.hosts.forEach(host => {
        const c = host.config;
        if (!c) return;

        // Deterministic test scenario for the integrated build:
        // HOST-001 = optimal, HOST-002 = WARNING, HOST-003 = CRITICAL.
        // This is deliberately simulated test telemetry, not hardware data.
        normalizeHostTelemetry(host);

        const now = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        host.history.labels.push(now);
        host.history.voltage.push(host.telemetry.voltage);
        host.history.power.push(host.telemetry.power);
        host.history.temperature.push(host.telemetry.temperature);

        if (host.history.labels.length > 20) {
            host.history.labels.shift();
            host.history.voltage.shift();
            host.history.power.shift();
            host.history.temperature.shift();
        }

        updateEnvironmentalSensors(host);
        syncHostStatus(host);
        syncHostAlerts(host);
        host.guardian.lastCycle = currentTimeString();
    });

    if (app.currentView === "dashboard") {
        renderDashboardStats();
        renderHosts();
        renderDashboardSensors();
        const lastUpdate = document.getElementById("lastUpdate");
        if (lastUpdate) lastUpdate.textContent = currentTimeString();
    }

    if (app.currentView === "hosts" && app.selectedHostId) {
        const host = getHost(app.selectedHostId);
        if (host) renderHostDetails(host);
    }

    if (app.currentView === "alerts") renderAlerts();
    updateAlertNavigation();
}

function restartTelemetryTimer() {
    if (app.telemetryTimer) {
        clearInterval(app.telemetryTimer);
    }

    const seconds = Math.max(5, Number(app.telemetryRefreshSeconds) || 30);

    app.telemetryTimer = setInterval(
        simulateTelemetryCycle,
        seconds * 1000
    );
}

function getTelemetryRefreshSeconds() {
    const value = Number(localStorage.getItem("altisguardian-telemetryRefreshSeconds"));
    return [5, 10, 30, 60].includes(value) ? value : 30;
}

function setTelemetryRefreshSeconds(seconds) {
    const value = Number(seconds);
    if (![5, 10, 30, 60].includes(value)) return;

    app.telemetryRefreshSeconds = value;
    localStorage.setItem(
        "altisguardian-telemetryRefreshSeconds",
        String(value)
    );

    restartTelemetryTimer();
    showToast(`Telemetry display refresh set to ${value} seconds.`);

    if (app.currentView === "settings") {
        renderSettingsPage();
    }
}

/* =========================================================
   THEME
   Light mode is the default. The user's choice is persisted.
========================================================= */

function applyTheme(theme) {

    const normalized = theme === "dark" ? "dark" : "light";
    const root = document.documentElement;

    root.setAttribute("data-theme", normalized);
    localStorage.setItem("altisguardian-theme", normalized);

    const toggle = document.getElementById("themeToggle");
    const label = document.getElementById("themeToggleLabel");
    const icon = document.getElementById("themeToggleIcon");

    if (toggle) {
        const nextTheme = normalized === "light" ? "dark" : "light";
        toggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
        toggle.setAttribute("title", `Switch to ${nextTheme} mode`);
    }

    if (label) {
        label.textContent = normalized === "light" ? "Light" : "Dark";
    }

    if (icon) {
        icon.textContent = normalized === "light" ? "☼" : "☾";
    }
}

function initializeTheme() {

    const saved = localStorage.getItem("altisguardian-theme");

    // Light mode is the default when no preference exists.
    applyTheme(saved === "dark" ? "dark" : "light");

    const toggle = document.getElementById("themeToggle");

    if (toggle) {
        toggle.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            applyTheme(current === "light" ? "dark" : "light");
        });
    }
}



/* =========================================================
   AUTHENTICATION
========================================================= */

async function checkAuthentication() {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await response.json();

    if (!data.authenticated) {
        showLogin();
        return false;
    }

    app.currentUser = data.user;
    hideLogin();
    applyRolePermissions();
    return true;
}

function showLogin() {
    const overlay = document.getElementById("loginOverlay");
    if (overlay) overlay.classList.add("visible");
}

function hideLogin() {
    const overlay = document.getElementById("loginOverlay");
    if (overlay) overlay.classList.remove("visible");
}

function applyRolePermissions() {
    const user = app.currentUser;
    if (!user) return;

    const name = document.getElementById("currentUserName");
    const role = document.getElementById("currentUserRole");

    if (name) name.textContent = user.displayName;
    if (role) role.textContent = user.role === "ADMINISTRATOR" ? "Administrator Account" : "Operator Account";

    const avatar = document.getElementById("currentUserAvatar");
    if (avatar) avatar.textContent = user.role === "ADMINISTRATOR" ? "AD" : "OP";

    // PCB profiles, hosts and telemetry remain visible to both roles.
    // Configuration-changing controls are disabled for Operators.
    document.querySelectorAll(".admin-only").forEach(el => {
        el.style.display = user.role === "ADMINISTRATOR" ? "" : "none";
    });
}

async function loginUser(username, password) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login failed.");
    }

    app.currentUser = data.user;
    hideLogin();
    applyRolePermissions();
}

async function logoutUser() {
    await fetch("/api/auth/logout", { method: "POST" });
    app.currentUser = null;
    showLogin();
}

function setupAuthentication() {
    const form = document.getElementById("loginForm");
    const error = document.getElementById("loginError");
    const logout = document.getElementById("logoutButton");
    const passwordToggle = document.getElementById("passwordToggle");
    const passwordInput = document.getElementById("loginPassword");

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener("click", () => {
            const showing = passwordInput.type === "text";
            passwordInput.type = showing ? "password" : "text";
            passwordToggle.textContent = showing ? "Show" : "Hide";
            passwordToggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
        });
    }

    if (form) {
        form.addEventListener("submit", async event => {
            event.preventDefault();
            error.textContent = "";

            try {
                await loginUser(
                    document.getElementById("loginUsername").value,
                    document.getElementById("loginPassword").value
                );
                await initializeAuthenticatedApplication();
            } catch (err) {
                error.textContent = err.message;
            }
        });
    }

    if (logout) {
        logout.onclick = logoutUser;
    }
}

async function initializeAuthenticatedApplication() {
    syncAllHealth();
    await loadPCBProfileStats();
    await loadHostsFromBackend();
    setupNavigation();
    updateClock();
    setInterval(updateClock, 1000);
    app.telemetryRefreshSeconds = getTelemetryRefreshSeconds();
    restartTelemetryTimer();
    showDashboard();
    updateAlertNavigation();
}


/* =========================================================
   INITIALIZATION
========================================================= */

async function initializeApplication() {
    initializeTheme();
    setupAuthentication();

    try {
        const authenticated = await checkAuthentication();
        if (authenticated) {
            await initializeAuthenticatedApplication();
        }
    } catch (error) {
        console.error("Authentication initialization failed:", error);
        showLogin();
    }
}


document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);