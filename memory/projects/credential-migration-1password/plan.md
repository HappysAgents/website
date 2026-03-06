# 1Password + SecretRef Migration Plan
**Created:** 2026-03-06
**Status:** DRAFT — Awaiting Security Review + R Approval
**Owner:** Happy

---

## Objective

Migrate all OpenClaw credentials from plaintext storage (openclaw.json + ~/.secrets/) to 1Password, accessed via the SecretRef exec provider. This eliminates at-rest credential exposure on the local filesystem and adds audit logging for every credential read.

---

## Why This Matters

Current state: all credentials (Telegram bot token, Discord bot tokens, AgentMail API key, Brave Search API key, gateway auth token) exist as plaintext values in either `~/.openclaw/openclaw.json` or flat files in `~/.secrets/`. Any process running as `dirtyagent` — including sub-agents — can read them directly.

1Password + SecretRef:
- Credentials never stored on this machine's filesystem
- `op` CLI session expires — no active session = no read access, even for sub-agents
- Every credential read is audit-logged in 1Password (who, what, when)
- Single rotation point — update in 1Password vault, propagates automatically

---

## Prerequisites (Before Any Installation)

1. **1Password account** — R must have or create a 1Password personal/team account (approx. $3/mo individual or $19/mo Teams)
2. **Security review** — `op` CLI installation requires a mandatory security review sub-agent before `brew install 1password-cli` is run (Rule 7)
3. **Known-good backup** — confirm `~/.openclaw/openclaw.json.known-good` is current before any config changes
4. **R approval** — this plan must be approved before execution begins

---

## Phase 1: Install 1Password CLI

**Command (pending security review):**
```bash
brew install 1password-cli
```

**Validation:**
```bash
op --version
# expected: 2.x.x
```

**Security review required:** Yes — mandatory per Rule 7 before this command runs. Security agent will verify the Homebrew formula, publisher (AgileBits), checksum integrity, and absence of postinstall scripts.

---

## Phase 2: Create 1Password Vault + Add Credentials

Create a dedicated vault in 1Password called `openclaw-agent` to contain all agent credentials. Separation from personal vaults keeps the blast radius contained.

**Credentials to migrate:**

| Credential | Current Location | 1Password Item Name |
|------------|-----------------|---------------------|
| Telegram bot token | openclaw.json (plaintext) | `openclaw-telegram-bot` |
| Discord bot token (Happy) | ~/.secrets/discord/ | `openclaw-discord-happy` |
| Discord bot tokens (Nova, Coda, Pixel, Vault) | openclaw.json (plaintext) | `openclaw-discord-[name]` |
| AgentMail API key | openclaw.json (plaintext) | `openclaw-agentmail` |
| Brave Search API key | openclaw.json (plaintext) | `openclaw-brave` |
| Gateway auth token | openclaw.json (plaintext) | `openclaw-gateway-auth` |

Each credential stored as a Login or API Credential item with the secret value in the `password` or `credential` field.

**Reference format:**
```
op://openclaw-agent/openclaw-telegram-bot/credential
```

---

## Phase 3: Configure SecretRef in openclaw.json

Update `~/.openclaw/openclaw.json` to replace plaintext credential values with SecretRef objects.

**Current (plaintext example):**
```json
{
  "telegram": {
    "token": "7123456789:AABBcc..."
  }
}
```

**Target (SecretRef):**
```json
{
  "telegram": {
    "token": {
      "source": "exec",
      "provider": "default",
      "id": "op://openclaw-agent/openclaw-telegram-bot/credential"
    }
  }
}
```

**Important constraints:**
- The exec provider only runs commands from `trustedDirs` — must confirm `op` CLI location (`/opt/homebrew/bin/op`) is in the trusted directories list
- SecretRef is resolved at OpenClaw startup — gateway restart is required after migration
- Fail-fast behavior: if `op` session is not active at startup, the gateway will not start. Must ensure `op signin` is run before `openclaw gateway start` in the daily workflow.

**Config change method:** Direct edit of `~/.openclaw/openclaw.json` via exec (not config.apply — known to fail with REDACTED tokens).

---

## Phase 4: Session Management Workflow

After migration, starting OpenClaw requires an active `op` session:

```bash
# Each time before starting gateway (or after reboot):
eval $(op signin)
openclaw gateway start
```

**Automation option:** Add to a startup script or launchd agent that prompts for 1Password master password / biometric on boot.

**Session timeout:** By default, `op` sessions expire after 30 minutes of inactivity. Configure `OP_SESSION_TIMEOUT` or use biometric unlock on macOS to manage this without friction.

**Sub-agent risk post-migration:** A sub-agent could attempt `op read op://...` IF a session is active. This is better than the current state (flat files readable without any session), but is not zero risk. The audit log will surface any unexpected reads.

---

## Phase 5: Cleanup

After validating the migration works (gateway starts clean, all channels functional):

1. Remove plaintext credential values from `openclaw.json` backup files (`*.bak`)
2. Remove `~/.secrets/discord/` flat files
3. Update `known-good` backup with new SecretRef config
4. Document `op signin` as a required step in startup runbook

---

## Rollback Plan

If migration fails at any step:

```bash
cp ~/.openclaw/openclaw.json.known-good ~/.openclaw/openclaw.json
openclaw gateway restart
```

This restores the last working plaintext config. No data loss. Full function restored.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `op` session not active at gateway start | Medium | Gateway won't start | Document startup sequence; launchd helper |
| 1Password service outage | Low | Gateway won't start | Keep known-good plaintext backup as emergency fallback |
| Sub-agent reads cred via active `op` session | Low | Credential exposure | Audit log will detect; session expiry limits window |
| Config migration error breaks gateway | Low | Temporary outage | Rollback plan ready; test each credential one at a time |
| 1Password CLI postinstall script (supply chain) | Very low | Code execution | Security agent reviews before installation |

---

## What This Does NOT Solve

- **Runtime exposure:** Credentials are still resolved into memory when the gateway starts. Agent-Blind Architecture (Discussion #9676) is the right long-term solution.
- **Sub-agent sandbox:** No OS-level sandboxing exists. An active `op` session is readable by sub-agents. Behavioral rules remain the primary control.
- **In-context leakage:** If a credential value ever enters the agent's context (e.g., via a `config.get` call), it can appear in transcripts or logs.

---

## Estimated Effort

| Phase | Effort | Who |
|-------|--------|-----|
| 1Password account setup (if needed) | 10 min | R |
| Security review of op CLI | Auto (sub-agent) | Happy |
| Install + configure op CLI | 15 min | Happy (with R approval) |
| Create vault + add credentials | 20 min | Happy + R |
| Update openclaw.json | 30 min | Happy |
| Validation + cleanup | 15 min | Happy |
| **Total** | **~90 min** | |

---

## Open Questions for R

1. Do you have an existing 1Password account, or does one need to be created?
2. Should the `openclaw-agent` vault be on a personal plan or a Teams plan (Teams gives more granular access control if more agents get added)?
3. Do you want biometric unlock configured for the `op` CLI (requires 1Password desktop app + system extension)?

---

*This plan requires R approval and security agent sign-off before any execution begins.*
