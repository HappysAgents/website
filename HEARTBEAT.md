# HEARTBEAT.md

## On every heartbeat run, do ALL of the following:

### 1. Cross-Session Memory Sweep
- Call `sessions_list` with `activeMinutes=60, messageLimit=2`
- For any session updated in the last 60 minutes (excluding current session and cron sessions), call `sessions_history` to read recent messages
- Extract: decisions made, agreements reached, tasks assigned, things approved, rules established
- Cross-reference against today's `memory/YYYY-MM-DD.md`
- Append ANYTHING missing to daily notes under a timestamped section
- If nothing new found, skip silently

### 2. Decision File Check
- Any decision or agreement found in session history that is NOT yet written to a project file → write it immediately to the relevant project file AND daily notes
- Never leave an agreement only in session history

### 3. COMPANY.md Staleness Check
- Read the `Last updated` date in COMPANY.md
- If it hasn't been updated in more than 48 hours AND there was meaningful activity today → flag to R: "⚠️ COMPANY.md hasn't been updated in 48h — review needed"
- If it's current → no action

### 4. Standard Checks (only during 09:00–04:00 EET)
- Any urgent emails at happy-agent@agentmail.to?
- Calendar events in next 2 hours?
- Any blocked tasks that have become unblocked?

If nothing needs attention across all checks → reply HEARTBEAT_OK
