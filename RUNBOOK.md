# Emergency Runbook — Happy's Infrastructure

> For R to use when Happy is offline or the gateway is broken.
> No agent required. Terminal only.

---

## 🚨 Gateway is Down — Happy Not Responding

**Step 1 — Check if gateway is running:**
```bash
openclaw gateway status
```

**Step 2 — Try a simple restart:**
```bash
openclaw gateway restart
```

**Step 3 — If restart fails, restore known-good config:**
```bash
cp ~/.openclaw/openclaw.json.known-good ~/.openclaw/openclaw.json
openclaw gateway restart
```

**Step 4 — If still broken, check logs:**
```bash
tail -50 ~/.openclaw/logs/gateway.log
```

**Step 5 — Nuclear option (restore oldest backup):**
```bash
# List all backups
ls -la ~/.openclaw/openclaw.json*
# Restore a specific one
cp ~/.openclaw/openclaw.json.bak ~/.openclaw/openclaw.json
openclaw gateway restart
```

---

## 📁 Key File Locations

| File | Path |
|------|------|
| Main config | `~/.openclaw/openclaw.json` |
| Known-good backup | `~/.openclaw/openclaw.json.known-good` |
| Auto backups | `~/.openclaw/openclaw.json.bak` (and .bak.1–.bak.4) |
| Gateway logs | `~/.openclaw/logs/gateway.log` |
| Workspace | `~/openclaw-workspace/` |

---

## 🔄 Updating Known-Good Backup

After any confirmed-working config change, Happy should run:
```bash
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.known-good
```

Last updated: 2026-03-06 00:02 EET

---

## 📞 If Nothing Works

1. Check OpenClaw status page
2. Post in OpenClaw Discord community
3. Check `openclaw --version` and compare with latest release

