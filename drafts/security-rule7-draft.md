# DRAFT — SOUL.md Rule 7: Mandatory Security Review

## Proposed addition to SOUL.md (after Rule 6):

---

### Rule 7: Mandatory Security Review Before Installation

Before executing ANY command that installs, downloads, or introduces external software — including but not limited to `npm install`, `pip install`, `brew install`, `npx`, `curl`, `wget`, binary downloads, or `git clone` of executable code — you MUST:

1. **Spawn a security review sub-agent** using the template at `memory/resources/security-agent-template.md`
2. **Provide the exact command** you intend to run (not a summary — the literal command)
3. **Wait for the verdict** before proceeding
4. **Act on the verdict:**
   - ✅ APPROVED → proceed, log the review file path in daily notes
   - ⚠️ CAUTION → surface flags to R, wait for explicit approval
   - 🚨 BLOCK → do not install, explain to R why
   - ⏸️ INCONCLUSIVE → do not install, escalate to R

**No exceptions. No "I'll check after." No "this one is obviously safe."**

If you catch yourself rationalizing why a specific install doesn't need review, that is exactly when it needs review most.

**Split-step evasion:** This rule applies to the INTENT, not just the command name. Downloading a file and executing it is an install. Curling a script and piping to bash is an install. If the end result is new executable code on this machine, it requires security review.

**Exec approvals enforcement:** Install-pattern commands are additionally enforced at the platform level via OpenClaw exec approvals. Even if you attempt to skip the security agent, the platform will block the command.

---

# DRAFT — OpenClaw Exec Approvals Config

## Proposed addition to ~/.openclaw/openclaw.json:

```json
{
  "exec": {
    "security": "allowlist",
    "allowlist": [
      "cat *", "ls *", "grep *", "find *", "head *", "tail *", "wc *",
      "echo *", "pwd", "whoami", "date", "which *", "env", "printenv *",
      "git status*", "git log*", "git diff*", "git add*", "git commit*",
      "git branch*", "git show*", "git rev-parse*",
      "node *", "python3 *", "npm run *", "npm test*", "npm start*",
      "gh auth status*", "gh api *", "gh repo view*", "gh issue *", "gh pr *",
      "openclaw *",
      "lsof *", "ps *", "stat *", "file *", "shasum *", "codesign *",
      "mkdir *", "cp *", "mv *", "touch *", "chmod *",
      "curl -s * https://registry.npmjs.org/*",
      "curl -s * https://api.github.com/*",
      "curl -s * https://api.agentmail.to/*",
      "curl -s * https://pypi.org/*",
      "curl -s * https://api.osv.dev/*"
    ],
    "denyPatterns": [
      "*install*",
      "npm i *",
      "npx *",
      "pip *",
      "pip3 *",
      "brew *",
      "curl * | *sh*",
      "curl * | *bash*",
      "wget *",
      "curl *-o *",
      "bash /tmp/*",
      "sh /tmp/*",
      "chmod +x *",
      "sudo *"
    ]
  }
}
```

Note: This is a DRAFT. The exact config schema for exec approvals needs
to be verified against OpenClaw docs before applying. The intent is:
- Safe read/analysis commands run freely
- Anything that introduces code requires explicit approval
- Approval comes from the security agent verdict + R confirmation if flagged

# DRAFT — Post-Install Monitoring Cron

## Proposed cron job: workspace integrity check (daily)

Checks:
- Any new binaries in PATH that weren't there yesterday
- Any new entries in ~/.zshrc, ~/.bashrc, ~/.profile
- Any new LaunchAgents/LaunchDaemons
- Any unexpected network listeners (lsof -i -P)
- Any modifications to ~/.openclaw/openclaw.json outside of known timestamps
- Hash comparison of critical files (SOUL.md, AGENTS.md, openclaw.json)

This catches delayed payloads and config poisoning that slip past install-time review.
