# AltisGuardian — Integrated Test Build R3

This build is a consolidated testable prototype of the AltisGuardian remote Guardian system.

## Included
- AltisGuardian logo on login and authenticated UI
- Backend authentication with Administrator / Operator roles
- Password show/hide control
- 10,000 PCB profiles in SQLite
- PCB search/filtering and PCB-to-host assignment
- Automatic Guardian reference-envelope reload when a PCB is assigned
- Editable host display name for administrators
- Host protection limits: voltage, current, power and temperature
- Guardian validation of configuration requests
- SAFE / NOMINAL / HIGH Guardian command validation
- Persistent remote command history, including rejected commands
- Dashboard environmental sensing snapshot
- Hall-effect sensor display
- Current telemetry placed at the top of the host page
- Consistent host health evaluation across voltage/current/power/temperature
- Light mode default and dark mode toggle
- Functional settings/Guardian toggles
- 30-second supervisory/telemetry test cycle
- Telemetry history charts with hover values

## Local test accounts
Administrator: `admin` / `admin123`
Operator: `operator` / `operator123`

## Run
```powershell
cd "$HOME\Desktop\AltisGuardianWeb"
npm install
npm start
```
Open `http://localhost:3000`.

## Important engineering boundary
This is a software prototype/test adapter. Environmental, Hall-effect and host telemetry values are simulated for UI and logic testing. The Guardian safety logic is not a certified hardware safety controller and does not yet communicate with physical Guardian/host hardware. Real deployment requires hardware-qualified limits, an authenticated Guardian protocol, fault-injection testing and formal safety validation.


## R4 integrated test scenario

The frontend and server test telemetry intentionally keeps:
- HOST-001 in an optimal/healthy operating region
- HOST-002 in a warning region
- HOST-003 in a critical region

This is synthetic test telemetry for validation of the UI and Guardian decision paths. It is not physical hardware telemetry.

Telemetry display refresh is configurable in Settings: 5, 10, 30, or 60 seconds. This frontend display interval is separate from the Guardian's autonomous safety-cycle concept.
