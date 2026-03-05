# BACKLOG.md — Future Work

> Things we want to do but not now.
> Prioritized when the time comes. Never deleted — mark DONE or DROPPED instead.
> Happy updates this file. R reviews when prioritizing.

---

## Infrastructure

| Item | Why | When to revisit |
|------|-----|-----------------|
| openclaw.json in git repo (Level 2) | Every config change tracked, rollback = `git revert`, no manual backups | When we have 3+ agents making config changes |
| Config staging + validation (Level 2) | New configs validated before applied, zero-downtime changes | Before any agent gets write access to config |
| Gateway auto-restart on failure (Level 3) | Self-healing — don't need human to notice outage | Before scaling to paying customers |
| Monitoring + uptime alerts (Level 3) | Know gateway is down before R does | Same as above |
| Dedicated browser session management | Persistent logged-in sessions per platform, no re-login friction | When browser automation is core to agent workflow |
| Better browser than Playwright for authenticated sessions | Sites fingerprint Playwright — evaluate alternatives | When web automation is business-critical |

---

## Agent Architecture

| Item | Why | When to revisit |
|------|-----|-----------------|
| Dev Agent (Coda) owning infrastructure layer | Happy shouldn't be patching configs between blog posts | When Coda spec + SOUL.md are ready |
| MCP daemon mode for QMD | Agents query memory directly via tool calls | When 3+ agents need independent memory access |
| Agent-to-agent messaging protocol | Defined handoff patterns between agents | When 3+ agents are running simultaneously |
| Finance Agent spec | Budget, cost tracking, revenue attribution | When first revenue hits |

---

## Product

| Item | Why | When to revisit |
|------|-----|-----------------|
| Mission Control dashboard | Real-time ops visibility for R | After Coda spec ready — see COMPANY.md |
| D1 subscriber database | Own subscriber data, not just Beehiiv | At 500 confirmed subscribers or 2+ collection sources |
| QMD indexing setup | Better memory search across all files | Next available session |
| Meetup API for organizer messaging | Replace browser automation with API calls | When event frequency increases |

---

## Content

| Item | Why | When to revisit |
|------|-----|-----------------|
| Day 6 restructure | Fails new content standards scan test | Before Day 10 is published |
| Content Agent + Nova readability research | Nielsen Norman, Backlinko, HBR BLUF, Paul Graham, Hemingway | When Content Agent is fully operational |
| Blog post series on Planned Greece | Business idea documented publicly = distribution + validation | After R decides to move forward |

---

## Security

| Item | Why | When to revisit |
|------|-----|-----------------|
| Move Discord credential JSONs → ~/.secrets/ chmod 600 | CRITICAL finding from 2026-03-05 audit | ASAP — next session |
| GitHub PAT rotation | Overdue since 2026-03-03 | ASAP |
| macOS Keychain migration for passwords | More secure than Chrome saved passwords | After immediate security items done |
| Weekly credential scan (already scheduled) | Cron de774d91, Mondays 10am | Running — no action needed |
| Git history rewrite after token rotation | Credential committed in 78a03d72 (local only, no remote) | After token rotation |

---

## Business

| Item | Why | When to revisit |
|------|-----|-----------------|
| Planned Greece — go/no-go decision | 65% confidence GO, research complete | R decision pending — business plan at memory/projects/planned-greece/ |
| Discord server for backlog/project management | More structured than a flat file | When team grows beyond 5 agents |
| OpenClaw Athens meetup #2 planning | Validate demand from #1 | After March 26 event debrief |
| Beehiiv DPA signing | GDPR hygiene, R to sign | Settings → Legal in Beehiiv dashboard |
| Moltbook re-registration | Name: HappysAgents | Still outstanding |

---

## How to Use This File

- **Adding items:** Any agent can add. Include why it matters and when to revisit.
- **Prioritizing:** R reviews and moves items to active projects when the time comes.
- **Closing items:** Mark `~~strikethrough~~ DONE — [date]` or `DROPPED — [reason]`
- **Querying:** Ask Happy "what's in the backlog for X?" — Happy reads this file.

*Last updated: 2026-03-06*
