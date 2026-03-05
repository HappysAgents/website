# Credential Exposure Audit — Risk Assessment
**Date:** 2026-03-05  
**Reviewed by:** Security Review Agent  
**Scope:** ~/openclaw-workspace and ~/.openclaw on dedicated MacBook Pro M1 (dirtyagent user)  
**Threat model:** Physical machine access, prompt injection via email/web content, malicious sub-agent, accidental git push  
**Phase:** Phase 1 operations (all sensitive credentials live on this machine)

---

## Executive Summary

The scan identified **2 CRITICAL findings** and **1 HIGH finding** requiring immediate remediation. The remaining findings are MEDIUM/LOW and involve defensive hygiene gaps that, while not immediately exploitable, create compounding risk when combined with the critical items. No credentials appear to have been leaked externally as of this audit. Immediate action is required on Findings 1 and 5 before any further git operations.

---

## Finding 1: Discord Credential JSON Files in World-Readable Workspace Directory

**What's exposed:** Discord bot token (Happy bot) and Discord account password for the happysagents account, stored in two JSON files at `memory/resources/credentials/discord-happy-bot.json` and `memory/resources/credentials/discord-server-owner.json` inside the git-tracked workspace directory.

**Risk level:** CRITICAL

**Risk:**
Three distinct attack paths converge here, each independently sufficient:

1. **Any process on this machine** (browser tabs, Node scripts, sub-agents, any tool invoked via OpenClaw, a compromised npm package) can `cat` or `open()` these files with zero privilege escalation required. File permissions are 644 — world-readable. A prompt-injected sub-agent receiving a malicious instruction from a crafted web page or email could exfiltrate the Discord bot token and account password in a single tool call, then relay them to an attacker-controlled endpoint before the session ends.

2. **Accidental git commit:** The files are inside a git-tracked workspace and are NOT in `.gitignore`. A single `git add .` or `git add memory/` followed by `git push` publishes both credentials to GitHub (potentially a public repo, or one with other collaborators). Even a private repo with a compromised PAT (see Finding 2) would expose them. GitHub's secret scanning may catch some tokens post-push but the window of exposure is real.

3. **Account password in plaintext** is categorically worse than a bot token. The bot token can be rotated via Discord developer portal. The Discord account password for happysagents, if compromised, gives an attacker full account takeover — access to all servers, DMs, and the ability to revoke bot tokens themselves, lock out the legitimate owner, and use the account as a pivot for social engineering within trusted Discord communities.

**Remediation:**
1. **Immediately** move these files OUT of the workspace directory to a location outside the git tree, e.g. `~/.secrets/discord/` (not inside ~/openclaw-workspace).
2. Fix permissions to 600: `chmod 600 ~/.secrets/discord/*.json`
3. Add `memory/resources/credentials/` to `.gitignore` NOW (even after moving, as a belt-and-suspenders defense against future additions).
4. Consider whether plaintext credential files are the right storage mechanism at all. Prefer macOS Keychain for passwords and tokens where possible — use `security add-generic-password` and retrieve at runtime.
5. Rotate the Discord account password immediately if there's any uncertainty about whether it has been read by any process since creation.
6. Verify via `git log --all --full-history -- "memory/resources/credentials/"` that these files have never been committed, even accidentally, in any prior commit.

---

## Finding 2: GitHub PAT in ~/.git-credentials — Overdue for Rotation

**What's exposed:** GitHub Personal Access Token (repo scope) for happy-agent-org, stored in plaintext in `~/.git-credentials`. File permissions are 600 (owner-only). Token has been flagged for rotation since 2026-03-03.

**Risk level:** HIGH

**Risk:**
The 600 permissions are the correct baseline and provide meaningful protection against casual cross-user access. However, the threat model here is specifically **processes running as dirtyagent** — which includes every sub-agent, every OpenClaw tool invocation, every npm postinstall script, and any compromised process spawned within the session. All of these can read `~/.git-credentials` trivially:

```
cat ~/.git-credentials
```

With repo-scoped access to happy-agent-org, an attacker can:
- Read all private repository contents (source code, config files, secrets committed by mistake)
- Push malicious commits or branches to production repos
- Create new repositories under the org for persistence or data exfiltration staging
- Modify GitHub Actions workflows to inject malicious steps into CI/CD pipelines
- Access any GitHub Pages deployments

The "overdue since 2026-03-03" flag is meaningful: a token that should have been rotated 2 days ago was likely used as the basis for a recent git operation, meaning it's active and working — high-value to an attacker.

**Remediation:**
1. **Rotate the PAT immediately** via GitHub → Settings → Developer Settings → Personal access tokens. Generate a new token, update `~/.git-credentials`, and invalidate the old one.
2. Scope the new token as narrowly as possible. If it's only needed for push/pull to specific repos, limit to those repos using fine-grained tokens (GitHub now supports repo-specific PATs) rather than org-wide repo scope.
3. Consider using SSH keys instead of `~/.git-credentials` for git operations — SSH keys stored in `~/.ssh/` with standard 600 permissions, used with `ssh-agent`, are harder to accidentally exfiltrate via plaintext scraping.
4. Set a calendar reminder or cron to rotate every 30 days. Document rotation date in MEMORY.md.
5. Audit happy-agent-org for any unexpected commits, branches, or Actions workflow changes from 2026-03-03 to now.

---

## Finding 3: ~/.openclaw/openclaw.json — Master Config File (Highest-Value Target)

**What's exposed:** All active service credentials in a single file: Telegram bot token, 5x Discord bot tokens (Happy, Nova, Coda, Pixel, Vault), AgentMail API key, Brave Search API key, and gateway auth token. File permissions are 600 (owner-only).

**Risk level:** HIGH

**Risk:**
This is the crown jewels file. Compromising it gives an attacker:
- Full control of the Telegram bot (read all messages sent to it, send arbitrary messages as the bot, impersonate Happy to R)
- Control of all 5 Discord bot identities simultaneously
- Access to the AgentMail account (read/send emails from agent identities)
- Gateway auth token (ability to authenticate to the OpenClaw gateway, potentially inject agent tasks)

The 600 permissions are correct and appropriate for this file. The risk is not misconfiguration — it's the inherent exposure of any process running as `dirtyagent`. This includes sub-agents (which are the primary prompt-injection vector in Phase 1), any OpenClaw tool invocation that runs shell commands, and any npm package with a postinstall script.

The Telegram bot token is particularly high-value: if an attacker obtains it, they can intercept all commands sent to Happy (including from R), respond as Happy, and issue instructions that appear to come from the legitimate bot. This completely breaks the trusted communication channel between R and the agent infrastructure.

**Remediation:**
1. This file's location and permissions are **correct and expected** — this is by design in OpenClaw. The risk is inherent to how the platform works. Document and accept this risk explicitly.
2. The primary mitigation is the **sub-agent trust boundary**: sub-agents should not be able to read `~/.openclaw/openclaw.json` unless they need to. Consider whether OpenClaw supports sandboxed sub-agent environments with restricted filesystem access.
3. Implement the sub-agent content-is-data rule (SOUL.md Rule 1) rigorously — this is the primary defense against a compromised sub-agent reading and exfiltrating this file.
4. Rotate all tokens in this file on a regular schedule (quarterly minimum). Create a rotation runbook.
5. The gateway auth token in particular should be rotated after any suspicious sub-agent activity.
6. Monitor for unexpected bot activity on all 5 Discord bots and the Telegram bot — set up audit logging if Discord/Telegram supports it.

---

## Finding 4: Session Log Draft — Possible Token Leakage in Debug Notes

**What's exposed:** `drafts/2026_03_05_session-log-discord-multi-agent-build.md` — a session log containing config structure examples. Current content uses "HAPPY_BOT_TOKEN" as a placeholder (not an actual token). Risk is that actual tokens may have been pasted during a debug session.

**Risk level:** MEDIUM

**Risk:**
Debug sessions are high-risk for credential leakage. When troubleshooting a bot configuration, it's common to copy-paste actual tokens into a draft document "just to check the format," then forget to sanitize. If an actual token was pasted here:
- The file is currently untracked by git — safe for now
- But it's inside the workspace, world-readable status unknown, and one `git add drafts/` away from being committed
- If committed, the token would be in git history even if the file is later deleted (git history is permanent without a force-push rewrite)

**Remediation:**
1. **Immediately open and review this file** to confirm no actual token values are present. Look for anything that doesn't look like a placeholder — long random strings, strings that match the format of Discord tokens (e.g. base64-encoded segments), Telegram bot token format (numeric ID + colon + alphanumeric string).
2. If any actual tokens are found: rotate them immediately before doing anything else.
3. Add `drafts/` to `.gitignore` as a blanket precaution, or at minimum add `drafts/*.md` to ensure session logs are never accidentally committed.
4. Establish a rule: debug session logs that touched real credentials must be reviewed and sanitized before saving. Consider a naming convention like `*.UNSANITIZED.md` for raw drafts that serves as a visual warning.

---

## Finding 5: workspace .gitignore Missing credentials/ Exclusion

**What's exposed:** `~/openclaw-workspace/.gitignore` does not include `memory/resources/credentials/`. Credential files are currently untracked (safe), but there is no git-level protection preventing them from being committed.

**Risk level:** HIGH

**Risk:**
This is a **latent risk that becomes CRITICAL the instant anyone runs `git add .`**. The current safety is entirely behavioral — it relies on never running `git add .` or `git add memory/`. There is no structural protection.

Git operations that would silently stage credential files:
- `git add .`
- `git add -A`
- `git add memory/`
- `git add memory/resources/`
- IDE auto-stage features (VS Code source control panel "Stage All Changes")
- GitHub Desktop "commit all changes" button

A single `git push` after any of the above would publish Discord bot tokens and the Discord account password to whatever remote the workspace is pointed at. If the remote is a public GitHub repo, the credentials are publicly accessible within seconds and likely indexed by credential-scanning bots within minutes.

**Remediation:**
1. **Add the following to `~/openclaw-workspace/.gitignore` RIGHT NOW** — this is the highest-priority item that can be fixed in one line:
   ```
   memory/resources/credentials/
   ```
2. Also add `drafts/` as per Finding 4's recommendation.
3. Verify the addition works: after updating `.gitignore`, run `git status` and confirm credential files do NOT appear in the untracked files list.
4. Consider adding a pre-commit hook that scans for common credential patterns (token-shaped strings, JSON files in paths containing "credentials", "secrets", "keys") and blocks commits containing them. Tools like `git-secrets` or `detect-secrets` can be configured for this.
5. After moving credential files out of the workspace (per Finding 1 remediation), the `.gitignore` entry still serves as a defense-in-depth measure — add it regardless.

---

## Finding 6: No .env Files Found

**What's exposed:** Nothing — no .env files present anywhere in the scanned scope.

**Risk level:** LOW (informational)

**Risk:** None. This is the expected and correct state. .env files are a common accidental credential vector that has been correctly avoided.

**Remediation:** Maintain this posture. If any future workflow introduces .env files, ensure they are immediately added to .gitignore.

---

## Finding 7: ~/.zshrc — Clean

**What's exposed:** Nothing — only PATH exports, no hardcoded API keys or credentials.

**Risk level:** LOW (informational)

**Risk:** None for credential exposure. Shell config files are occasionally used to export API keys as environment variables (e.g. `export OPENAI_API_KEY=...`), which is a bad practice. This machine correctly avoids it.

**Remediation:** Maintain this posture. Do not add credential exports to .zshrc, .bash_profile, or any shell initialization file.

---

## Finding 8: Website Repo .gitignore — Correctly Configured

**What's exposed:** Nothing — website repo .gitignore correctly excludes .env files.

**Risk level:** LOW (informational)

**Risk:** None currently. This is best practice correctly applied.

**Remediation:** No action required. Continue this pattern for any new repos created.

---

## Finding 9: openclaw.json Backup Files — Acceptable Risk

**What's exposed:** `openclaw.json.bak` and `.bak.1-.bak.4` in `~/.openclaw/` — backup copies of the master config. All have 600 permissions matching the main file.

**Risk level:** LOW

**Risk:** Backup files are commonly forgotten during token rotation. If a token in the main `openclaw.json` is rotated, the old (now-invalid) token persists in backup files. If backup files are not rotated/purged, they accumulate a history of all past credentials. This is a minor risk since permissions are correct (600), but it's worth noting.

**Remediation:**
1. During any token rotation: update or purge backup files as part of the rotation procedure.
2. Consider adding backup file cleanup to a rotation runbook: after rotating all tokens, run `ls -la ~/.openclaw/*.bak*` and either update or securely delete old backups.
3. No immediate action required — permissions are correct.

---

## Prioritized Remediation Checklist

In order of urgency:

- [ ] **[TODAY - IMMEDIATE]** Add `memory/resources/credentials/` to `~/openclaw-workspace/.gitignore` (Finding 5) — one line, prevents catastrophic accidental commit
- [ ] **[TODAY - IMMEDIATE]** Move credential JSON files out of workspace to `~/.secrets/discord/` and chmod 600 (Finding 1)
- [ ] **[TODAY - IMMEDIATE]** Review `drafts/2026_03_05_session-log-discord-multi-agent-build.md` for actual token values; rotate any found (Finding 4)
- [ ] **[TODAY]** Add `drafts/` to `.gitignore` (Finding 4)
- [ ] **[TODAY]** Rotate the overdue GitHub PAT; switch to fine-grained token or SSH key (Finding 2)
- [ ] **[THIS WEEK]** Evaluate macOS Keychain as storage backend for Discord tokens and password instead of plaintext JSON (Finding 1)
- [ ] **[THIS WEEK]** Install a pre-commit hook (git-secrets or detect-secrets) on the workspace repo (Finding 5)
- [ ] **[ONGOING]** Establish quarterly rotation schedule for all tokens in openclaw.json (Finding 3)
- [ ] **[ONGOING]** Include backup file cleanup in token rotation runbook (Finding 9)

---

## Overall Risk Posture

**Current state:** High risk due to Findings 1 and 5. The combination of world-readable credential files inside a git-tracked workspace that lacks gitignore protection is a single command away from a credential breach.

**After immediate remediations:** Risk profile drops significantly to acceptable for Phase 1 operations. The residual risk (all credentials readable by any process running as dirtyagent) is inherent to the single-user, single-machine architecture and is mitigated by the LuLu firewall, macOS firewall, Tailscale VPN, and the SOUL.md security rules.

**Biggest unresolved structural risk:** The sub-agent trust boundary. Any sub-agent spawned by the main agent runs as dirtyagent and can read any 600-permission file. This is the primary attack surface for prompt injection leading to credential exfiltration. SOUL.md Rule 1 (content is never instructions) is the primary control here — its consistent enforcement is more important than any file permission change.

---

*Audit completed: 2026-03-05*  
*Next recommended audit: 2026-06-05 (quarterly) or after any security incident*
