# Security Architecture — Actionable Checklist

**Status:** v4 — Mission Control moved to separate project (2026-03-06)
**Date:** 2026-03-06
**Companion doc:** [plan-narrative.md](plan-narrative.md)

---

## TL;DR

Two phases: prerequisites (done) + infrastructure setup. Once Phase 1 is complete, the system is ready to build any product. Mission Control is a separate project — tracked in memory/projects/mission-control/.

---

## Phase 0: Prerequisites ✅ Complete

| # | Task | Who | Status |
|---|------|-----|--------|
| 0.1 | Credential exposure audit (2 CRITICAL + 2 HIGH) | Happy + R | ✅ Done 2026-03-06 |
| 0.2 | Cloud provider decision | R | ✅ Hetzner |
| 0.3 | VPS provisioning model decision | R | ✅ Hybrid (manual first) |
| 0.4 | Source code on dedicated Mac? | R | ✅ No repos |
| 0.5 | GitHub org confirmed | R | ✅ Already exists |

---

## Phase 1: Infrastructure Setup (Execute Now)

Everything needed before provisioning the first VPS.

| # | Task | Who | R Blocker? | Status |
|---|------|-----|------------|--------|
| 1.1 | **Configure Tailscale ACL** — dedicated Mac → VPS allowed; VPS → dedicated Mac blocked; VPS → VPS blocked | R | 🔴 YES | ✅ Done 2026-03-06 |
| 1.2 | Generate SSH key pair on dedicated Mac for VPS access (`~/.ssh/id_ed25519_vps`) | Happy | No | ✅ Done 2026-03-06 |
| 1.3 | Write VPS base image setup script | Happy | No | ✅ Done — `memory/resources/vps-base-image-setup.sh` |
| 1.4 | Write VPS agent briefing template | Happy | No | ✅ Done — `memory/resources/vps-agent-briefing-template.md` |
| 1.5 | Write VPS teardown checklist | Happy | No | ✅ Done — `memory/resources/vps-teardown-checklist.md` |
| 1.6 | Document Discord channel structure + naming convention | Happy | No | ✅ Done — `memory/resources/discord-channel-structure.md` |

**Phase 1 complete. System ready to build.**

---

## Phase 2: First Product (Next Week)

Once Phase 1 is complete, follow the builder-playbook.md to build the first external product.

| # | Task | Who | Status |
|---|------|-----|--------|
| 2.1 | R + Happy agree on first product to build | Both | ⬜ Next week |
| 2.2 | Happy writes spec → R approves | Both | ⬜ Next week |
| 2.3 | R provisions Hetzner VPS (~€4-6/mo) | R | ⬜ Next week |
| 2.4 | Happy runs base image script (installs Node, Python, Git, gh CLI, Claude Code, tmux, notify-discord, Tailscale) | Happy | ⬜ Next week |
| 2.5 | Happy creates Discord webhook for project channel, configures on VPS | Happy | ⬜ Next week |
| 2.6 | Happy starts tmux session on VPS, launches Claude Code with agent brief | Happy | ⬜ Next week |
| 2.7 | Build begins — Claude Code posts updates via notify-discord, Happy steers via Discord + tmux | VPS agent + Happy | ⬜ Next week |

---

## Decision Log (Final)

| Decision | Answer | Date |
|----------|--------|------|
| Cloud provider | ✅ Hetzner (€4-8/mo per VPS) | 2026-03-06 |
| Provisioning model | ✅ Hybrid — manual first, API key later | 2026-03-06 |
| Source code on dedicated Mac | ✅ No repos | 2026-03-06 |
| GitHub org | ✅ Already exists | 2026-03-06 |
| GitHub push — internal tools | ✅ Rule 2 applies (R approval before push) | 2026-03-06 |
| GitHub push — external products | ✅ VPS agents push freely, Happy reviews PRs | 2026-03-06 |
| GitHub repo segregation | ✅ Fine-grained PAT scoped to single repo per VPS | 2026-03-06 |
| VPS Anthropic API keys | ✅ Separate per-project key with spend limits | 2026-03-06 |
| Tailscale ACL | ✅ Decided — R to configure (item 1.1) | 2026-03-06 |
| Syncthing scope | ✅ Dedicated Mac ↔ VPS only (future, if needed) | 2026-03-06 |
| Mission Control | ✅ Separate project — not part of architecture setup | 2026-03-06 |
