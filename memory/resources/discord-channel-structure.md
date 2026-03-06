# Discord Channel Structure — Build System

**Server:** Happy's Agents (1478761476704702637)
**Last reviewed:** 2026-03-06

---

## Current Structure (Already Live)

### 📌 META
- `#welcome` — server purpose, usage guide
- `#decisions` — locked decisions log, all agents post here
- `#goals` — north stars, targets

### ⚙️ OPS
- `#ops-morning-review` — daily digest
- `#ops-approvals` — gated actions for R sign-off
- `#ops-blockers` — any agent posts blockers, Happy triages
- `#ops-changelog` — significant completed work

### 🤖 AGENTS
- `#agent-happy` — Happy's primary steering
- `#agent-content` — Content Agent
- `#agent-dev` — Dev Agent (also used for build system steering)
- `#agent-creative` — Creative Lead
- `#agent-vault` — Vault

### 📁 PROJECTS
- `#proj-mission-control`
- `#proj-website`
- `#proj-athens-meetup`
- `#proj-brand-playbook`
- `#proj-discord-server`

### 🔬 RESEARCH
- `#research-agent-trust`
- `#research-general`

---

## Convention for New External Products

When a new external product VPS is provisioned:

1. Create a channel in 📁 PROJECTS: `#proj-[product-name]`
2. Set topic: "[Product name] — VPS agent reporting + steering"
3. Generate Discord webhook for this channel → store in VPS at `/opt/project/.config/discord-webhook.env`
4. VPS agent uses `notify-discord` to post progress here

**Naming convention:** `proj-[product-name]` (lowercase, hyphens, no spaces)

Examples:
- `proj-subscriptionbox` 
- `proj-agenttools`
- `proj-greeceproperty`

---

## Note on Channel Creation

Happy currently does not have Manage Channels permission. R must create new `proj-*` channels, or grant Happy the permission. Creating the webhook can be done by Happy once the channel exists.

**Recommendation:** R grants Happy "Manage Channels" scoped to 📁 PROJECTS category only — allows Happy to create project channels autonomously without full server admin.
