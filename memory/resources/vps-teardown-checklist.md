# VPS Teardown Checklist

_Run through this every time a project VPS is decommissioned._
_Do not skip steps. Order matters._

**Project:** _______________
**VPS IP / Hetzner ID:** _______________
**Date:** _______________

---

## Step 1 — Backup (before anything else)

- [ ] SSH into VPS: `ssh root@<tailscale-ip> -i ~/.ssh/id_ed25519_vps`
- [ ] Confirm all code is committed: `git status` (should be clean)
- [ ] Push all branches: `git push --all origin`
- [ ] Verify GitHub repo has latest: check on GitHub that last commit matches
- [ ] Download any non-code assets (uploads, DB exports, logs) via SCP if needed:
  `scp -i ~/.ssh/id_ed25519_vps -r root@<tailscale-ip>:/opt/project/data ./backup/`

## Step 2 — Revoke Access

- [ ] Revoke the project's fine-grained GitHub PAT:
  GitHub → Settings → Developer Settings → Fine-grained tokens → Revoke `[project-name]-vps`
- [ ] Revoke the project's Anthropic API key:
  Anthropic console → API Keys → Delete `[project-name]`
- [ ] Remove VPS from Tailscale network:
  Tailscale admin → Machines → Delete the VPS node
- [ ] Delete Discord webhook (if no longer needed):
  Discord → Server Settings → Integrations → Webhooks → Delete `[project-name]`

## Step 3 — Delete the Server

- [ ] Log into Hetzner Cloud Console: <https://console.hetzner.cloud>
- [ ] Select the project VPS → Delete server
- [ ] Confirm deletion (this is irreversible — verify Step 1 and 2 are done first)

## Step 4 — Clean Up Local References

- [ ] Remove VPS from `~/.ssh/known_hosts`:
  `ssh-keygen -R <tailscale-ip>`
- [ ] Update project summary.md: mark project as archived, note teardown date
- [ ] Move project folder: `memory/projects/[name]/ → memory/archives/[name]/`

## Step 5 — Confirm

- [ ] GitHub repo: code preserved ✅
- [ ] PAT: revoked ✅
- [ ] API key: revoked ✅
- [ ] VPS: deleted ✅
- [ ] Tailscale: node removed ✅
- [ ] Post teardown summary to Discord: `notify-discord "VPS teardown complete for [project-name]"`

---

**Time to complete:** ~15 minutes
**Who runs this:** Happy (with R approval before Step 3 if project is still active)
