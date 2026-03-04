# Security Review: launchctl Diagnostic Commands
*Reviewed: 2026-03-04 12:50 EET*
*Reviewed by: Security Agent (subagent)*
*Commands:*
```
launchctl list | grep openclaw
launchctl print gui/$(id -u)/ai.openclaw.gateway
```

---

## Verdict: ✅ SAFE TO RUN

*(with one important precaution — see Information Exposure Risk)*

---

## Summary

Both commands are strictly read-only macOS diagnostic tools that require no elevated privileges and cannot modify system state. The main risk is **not execution** — it's **output sharing**: `launchctl print` may expose API keys or tokens stored in the gateway's environment variables. Redact the `environment` block before pasting output into any chat.

---

## Command Analysis

### Command 1: `launchctl list | grep openclaw`

**What it does:**
- `launchctl list` enumerates all launch services currently loaded in the calling user's session (the per-user GUI domain).
- `grep openclaw` filters output to lines containing "openclaw".
- Output format: three columns — `PID | LastExitStatus | Label`

**Can it cause harm?**
- No. This is equivalent to `ps aux | grep something`. Purely observational.
- Cannot start, stop, restart, or affect any service.

**Privilege requirements:**
- Standard user. Works fine as `dirtyagent` without sudo.
- Only shows services belonging to the current user's session — cannot see system-level daemons (those in `/Library/LaunchDaemons`).

**Output sensitivity:**
- Low. Shows service label (e.g., `ai.openclaw.gateway`), PID, and last exit code.
- Exit code may reveal crash patterns but contains no credentials.
- Safe to share verbatim.

**Edge cases / risks:**
- None. No injection surface, no state modification.

---

### Command 2: `launchctl print gui/$(id -u)/ai.openclaw.gateway`

**What it does:**
- `$(id -u)` is a shell subshell that returns the calling user's numeric UID (e.g., `501`). Safe — it's just a number with no injection surface in this context, since R is typing this directly in their own shell.
- `gui/501` is the per-user GUI launchd domain (where LaunchAgents live).
- `launchctl print` prints a detailed service description for the named service.

**Output includes:**
- Service state (running, waiting, throttled, etc.)
- PID and parent PID
- Program path (e.g., `/usr/local/bin/openclaw` or similar)
- **Environment variables passed to the gateway process** ← 🔴 **SENSITIVE**
- Working directory
- stdout/stderr log paths
- Timeout, throttle interval, socket definitions
- On-demand and keepalive flags

**Can it cause harm?**
- No. `launchctl print` is read-only. It inspects the service descriptor — it does not send signals, restart, or affect the service.

**Privilege requirements:**
- Standard user for services in their own `gui/UID` domain. No sudo required.
- Cannot inspect services in the system domain (`system/`) without sudo.

**`$(id -u)` injection risk:**
- None. Shell substitution of `id -u` returns a plain integer. No untrusted input is involved. R is running this in their own terminal.

**Edge cases / risks:**
- The only risk is in the **output**, not the execution (see below).

---

## Information Exposure Risk

### Command 1 output: LOW risk
The three-column output (`PID ExitStatus Label`) contains no credentials. Safe to share as-is.

### Command 2 output: ⚠️ MODERATE risk — REDACT BEFORE SHARING

`launchctl print` will likely include an `environment` block that shows every environment variable the gateway was launched with. This **may contain**:
- `ANTHROPIC_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `AGENTMAIL_API_KEY`
- `GITHUB_TOKEN` or `GH_TOKEN`
- Google API keys
- Any other secrets set in the shell environment or OpenClaw config at gateway start time

**What to redact before sharing output:**
Look for a block like this and redact the values (not the names — names are fine for diagnosis):
```
environment = {
    ANTHROPIC_API_KEY => sk-ant-...      ← REDACT THE VALUE
    TELEGRAM_BOT_TOKEN => 12345:ABC...   ← REDACT THE VALUE
    ...
}
```
Replace values with `[REDACTED]` before pasting into any chat, including back to Happy.

**Everything else** in the `launchctl print` output (paths, PIDs, socket names, timeout values, state flags) is safe to share and is exactly what Happy needs for diagnosis.

---

## Alternative Approaches

### Could Happy diagnose this without R running terminal commands?

**Partial yes.** Happy can access some information directly:
- `openclaw gateway status` — Happy can run this to check the current gateway state without R needing to touch the terminal.
- OpenClaw log files — Happy can read gateway logs directly from disk (likely in `~/Library/Logs/` or the workspace) to identify the timeout pattern.
- The OpenClaw source code — Happy can inspect the `spawnSync launchctl` call directly to understand the timeout behavior.

**What only R can do from the terminal:**
- `launchctl print` — provides the live launchd service descriptor which may reveal socket/keepalive config not exposed through OpenClaw's own CLI. This is genuinely useful and not easily replicated by Happy.

**Verdict on alternatives:** Happy could reduce the need for terminal commands by first checking logs and gateway status internally. But for a launchd timeout diagnosis specifically, `launchctl print` is the right tool and is appropriate for R to run.

---

## Recommendation

**Run both commands. They are safe.**

**Before running:**
- No special precautions needed. These are read-only.

**After running:**
- For Command 2 output: scan the output for an `environment = { }` block.
- **Redact all environment variable values** (replace with `[REDACTED]`) before sharing with Happy or anyone else.
- Keep variable *names* — they help Happy diagnose config issues.
- Everything else can be shared verbatim.

**What to watch for in the output:**
- Command 1: Look for the gateway service entry and its `LastExitStatus` — a non-zero value indicates recent crashes.
- Command 2: Look for `state = ...` (should be `running`), `throttle interval` (high values indicate the service is being throttled due to repeated crashes), and `last exit code` / `last exit reason` fields — these will directly explain the timeout/restart issue.

**One additional note:** If the `launchctl print` output shows the gateway is in `throttled` state, that explains the port shift from 18800 → 18791. macOS launchd throttles services that crash repeatedly, which causes delayed restarts and port binding conflicts.

---

*Security Agent — review complete. No blockers. Safe to proceed.*
