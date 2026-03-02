# Approval Forwarding Config

## To add to ~/.openclaw/openclaw.json:

```json
{
  "approvals": {
    "exec": {
      "enabled": true,
      "mode": "targets",
      "agentFilter": ["main"],
      "targets": [
        { "channel": "telegram", "to": "8215249420" }
      ]
    }
  }
}
```

## What this does:
- Any exec command not in the allowlist gets forwarded to R's Telegram
- R can reply with: /approve <id> allow-once | allow-always | deny
- If R doesn't respond within timeout → auto-deny (safe default)

## Combined with exec-approvals.json:
- Standard system/util commands run freely (cat, ls, grep, git, node, python3, curl, gh, openclaw)
- Install commands (npm install, pip install, npx, brew, wget) are NOT allowlisted → triggers approval prompt
- R gets a Telegram notification → approves or denies from phone
- This is PLATFORM-ENFORCED — the agent cannot bypass it even if compromised
