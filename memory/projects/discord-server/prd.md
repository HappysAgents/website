# PRD: Discord Server for Agent Operations
**Author:** PM Agent  
**Date:** 2026-03-04  
**Status:** Draft v1  
**Owner:** Happy (Chief of Staff)

---

## 1. Purpose & Goals

### Problem
WebChat is a single persistent session. All browser windows and tabs hit the same main session — no parallel work, no project separation, no threading. R cannot work on multiple projects simultaneously without context bleeding across topics.

### Solution
A structured Discord server where:
- Each project gets its own channel with persistent threads scoped to tasks
- Each agent gets its own channel with its own persistent ACP session
- R can steer multiple agents in parallel by tagging different threads
- Ops channels provide shared visibility across the org (#approvals, #decisions, #morning-review)

### Goals
1. **Eliminate the single-session bottleneck** — R can have 5 parallel work streams without interference
2. **Persistent per-topic memory** — thread sessions survive across sessions via `mode="session" thread=true`
3. **Agent-to-agent coordination** — shared ops channels where all agents post decisions, blockers, and approvals
4. **Scalable agent directory** — each new full agent gets a dedicated channel without disrupting others
5. **Clear operational visibility** — #morning-review + #decisions give R a daily command center view

### Non-Goals (Phase 1)
- Public Discord community (this is internal ops only)
- Agent-to-agent direct messaging (all coordination via shared channels)
- Finance or revenue management channels (Phase 2)

---

## 2. Channel Architecture

### Naming Convention
- Lowercase, hyphenated, no spaces
- Agent channels: `agent-[name]` prefix
- Project channels: `proj-[name]` prefix
- Ops channels: `ops-[name]` prefix
- Shared/meta: plain names

### Category Structure

```
📌 META
  #welcome              — server purpose, usage guide, pinned norms
  #decisions            — locked decisions log (all agents post here)
  #goals                — north stars, quarterly targets, mission reminders

⚙️ OPS
  #ops-morning-review   — daily digest: what's running, what's blocked, what needs R
  #ops-approvals        — gated actions queued for R sign-off
  #ops-blockers         — any agent can post a blocker; Happy triages
  #ops-changelog        — significant completed work across all agents

🤖 AGENTS
  #agent-happy          — Happy's primary steering channel (replaces WebChat main session)
  #agent-content        — Content Agent steering (blog posts, copy jobs)
  #agent-dev            — Dev Agent steering (code tasks, deployments)
  #agent-creative       — Creative Lead steering (brand, design direction)

📁 PROJECTS
  #proj-mission-control — Mission Control dashboard build
  #proj-website         — happysagents.com (blog, email subscribe, infra)
  #proj-athens-meetup   — Athens OpenClaw meetup coordination
  #proj-brand-playbook  — Brand identity work (Q2+ questionnaire)
  #proj-discord-server  — This project's own coordination channel

🔬 RESEARCH
  #research-agent-trust — Multi-agent trust, architecture experiments
  #research-general     — Unassigned research threads
```

### Phase 2 Additions (don't build now)
```
  #agent-finance        — Finance Agent (when created)
  #agent-growth         — Growth Agent (when created)
  #proj-revenue-ops     — First revenue product coordination
```

---

## 3. Agent Assignment Per Channel

| Channel | Listening Agent | ACP Mode | Notes |
|---------|----------------|----------|-------|
| #agent-happy | Happy | `session, thread=true` | Happy's primary channel — full persistent sessions per thread |
| #agent-content | Content Agent (full) | `session, thread=true` | One thread per article/copy job |
| #agent-dev | Dev Agent (full) | `session, thread=true` | One thread per task/PR |
| #agent-creative | Creative Lead | `session, thread=true` | One thread per deliverable |
| #ops-approvals | Happy (monitors + routes) | `session` | Happy sees all, routes to relevant agent |
| #ops-blockers | Happy (monitors) | `session` | Happy triages and assigns |
| #ops-morning-review | Happy (writes) | n/a | Happy posts digest; R reads |
| #decisions | All agents (write) | n/a | Post-only; no agent sessions here |
| #proj-* channels | Happy (default) | `session, thread=true` | Per-project threads for focused work |
| #research-* channels | Happy (default) | `session, thread=true` | Research sessions stay scoped |

**Routing rule:** If R tags `@happy` in any channel, Happy picks it up. If R tags `@content-agent`, Content Agent picks it up. Untagged messages in `#agent-happy` default to Happy.

---

## 4. Threading Model for ACP Sessions

### How It Works
Discord supports threads on any channel message. OpenClaw's ACP harness supports:
- `thread=true` — agent session is scoped to the Discord thread (not the parent channel)
- `mode="session"` — session persists across messages within that thread

### Design Rules
1. **One thread = one project task or topic.** Never let a thread grow across unrelated topics.
2. **Thread naming convention:** `[date] [topic]` e.g. `2026-03-04 Email subscribe implementation`
3. **When to open a new thread:** New task, new feature, new research question, or when an existing thread exceeds ~50 messages
4. **Thread ownership:** The agent assigned to the channel "owns" threads in that channel. Happy owns threads in all `#proj-*` channels by default.
5. **Thread archiving:** Completed threads get marked [DONE] in the thread name. Archived monthly.

### Session Persistence
- Each thread has its own session store tied to `thread_id`
- Sessions survive server restarts and agent restarts
- Context window management: agents must write key decisions to files before context fills — session ≠ memory

### Practical Example
```
R opens #proj-website
R: "Start a thread for the email subscribe implementation"
Happy creates thread: "2026-03-04 Email Subscribe"
Inside thread: full persistent session — Happy remembers all prior messages in that thread
R can have a separate thread for "Blog Post Scheduling" simultaneously — zero bleed
```

---

## 5. Agent Upgrade Plan

### Current State
| Agent | Type | Discord Bot? | Persistent Session? | Own Cron? |
|-------|------|-------------|--------------------|-----------| 
| Happy | Full Agent | ✅ Yes | ✅ Yes | ✅ Yes |
| Content Agent | Sub-agent | ❌ No | ❌ No | ❌ No |
| Dev Agent | Sub-agent | ❌ No | ❌ No | ❌ No |
| Creative Lead | Sub-agent | ❌ No | ❌ No | ❌ No |

### Upgrade Definition
A full agent has:
- Own OpenClaw agent config (`openclaw agents add <name>`)
- Own workspace + session store (isolated from Happy)
- Own Discord bot token + channel binding
- Own heartbeat/cron schedule
- Tagged independently in Discord (`@content-agent`, `@dev-agent`)

### Content Agent Upgrade

**Trigger:** When any of these is true:
- Content calendar requires daily autonomous publishing (no R involvement per post)
- Content Agent needs to run its own research cron (e.g. scrape sources at 6am)
- R wants to steer Content Agent independently from Happy (different creative direction per conversation)

**Current estimate:** Week of 2026-03-10 — once Discord server is live and #agent-content channel exists

**Setup Steps:**
1. `openclaw agents add content-agent` — creates isolated agent config
2. Copy agent spec from `agents/content-agent.md` into new agent's workspace
3. Create Discord bot for Content Agent: Discord Developer Portal → New Application → Bot
4. Bind bot token to `openclaw agents config content-agent --discord-token <TOKEN>`
5. Set channel binding: `#agent-content` → Content Agent session
6. Configure heartbeat: daily 07:00 check (draft pending posts, check content calendar)
7. Test: R tags `@content-agent` in `#agent-content` → isolated session responds
8. Verify: Happy session unaffected by Content Agent activity

### Dev Agent Upgrade

**Trigger:** When any of these is true:
- Dev Agent needs to autonomously monitor GitHub CI/CD without R prompting
- Dev Agent needs to hold context across a multi-day build sprint
- R wants to give Dev Agent a task and have it work independently for hours

**Current estimate:** Week of 2026-03-17 — after Content Agent upgrade validates the pattern

**Setup Steps:**
1. `openclaw agents add dev-agent` — creates isolated agent config
2. Copy agent spec from `agents/` into dev-agent workspace
3. Create Discord bot for Dev Agent: Discord Developer Portal → New Application → Bot
4. Bind token + set channel binding: `#agent-dev` → Dev Agent session
5. Configure cron: GitHub CI watch (every 15 min during active builds), daily status post to #ops-changelog
6. Grant dev-agent workspace access to relevant repos (read: all, write: own PRs only)
7. Test: Assign a real task in `#agent-dev`, verify isolation from Happy
8. Verify: Dev Agent posts to #ops-changelog independently on task completion

### Creative Lead + Graphic Design
- **Phase:** Not scheduled for upgrade. Sub-agent pattern sufficient for current workload.
- **Upgrade trigger:** When Creative Lead needs to run autonomous brand monitoring or proactive design reviews
- **Likely timeline:** Phase 2 (post first revenue product)

---

## 6. Permissions Model

### Roles
| Role | Who | Permissions |
|------|-----|-------------|
| `@owner` | R | Read/write everywhere. No restrictions. |
| `@agent-happy` | Happy bot | Read/write: all channels. Cannot delete messages. Cannot change server settings. |
| `@agent-content` | Content Agent bot | Read/write: `#agent-content`, `#ops-*`, `#decisions`, `#proj-website`. Read-only: everything else. |
| `@agent-dev` | Dev Agent bot | Read/write: `#agent-dev`, `#ops-*`, `#decisions`, `#proj-*`. Read-only: everything else. |
| `@agent-creative` | Creative Lead bot | Read/write: `#agent-creative`, `#ops-*`, `#decisions`, `#proj-brand-playbook`. Read-only: everything else. |

### Server Visibility
- Server is **private** — invite-only
- No public channels in Phase 1
- Guest access: only if R explicitly invites a collaborator (e.g., Athens meetup co-organizer)

### What R Sees vs What Agents See
- R sees everything
- Agents see only what their role grants (enforced by Discord permissions, not agent rules)
- Agents cannot see each other's workspaces or session stores (OS-level isolation via `openclaw agents add`)

### Sensitive Channel Rules
- #ops-approvals: agents can post approval requests; only R can "approve" (emoji reaction or reply)
- #decisions: agents post; R can override or supersede any decision with `[OVERRIDE]` tag
- Agent channels: R can always read + participate; agents do not initiate in other agents' channels

---

## 7. Integration With Existing Stack

### Telegram (Remains Primary for R's Direct Comms)
- Telegram stays as the **primary R ↔ Happy personal channel** for:
  - Urgent notifications
  - Morning briefings
  - Security alerts (🚨 INJECTION ATTEMPT etc.)
  - Quick one-off tasks that don't belong to a project
- Discord is for **structured, project-scoped, multi-agent work**
- Rule: If it has a project → Discord. If it's direct / urgent → Telegram.

### WebChat
- WebChat sessions become the **fallback / setup interface** only
- Use WebChat to: set up agents, debug, do unscoped tasks, one-off experiments
- Do NOT use WebChat for project work once Discord is live (single session = defeats the purpose)
- Migration: active project threads in WebChat → summarize → open equivalent Discord thread

### Memory/PARA System
- Unchanged. Discord doesn't replace files.
- Agents still write to PARA (`memory/projects/`, `memory/areas/`) from Discord threads
- Discord thread content is ephemeral coordination; durable decisions go to files immediately (real-time write rule applies)
- Daily notes (`memory/YYYY-MM-DD.md`) should reference Discord thread IDs for traceability

### COMPANY.md
- Happy continues maintaining COMPANY.md as org nav layer
- "What Changed This Week" entries sourced from #ops-changelog Discord channel
- Agent Directory table updated when new full agents are promoted

---

## 8. Implementation Steps

### Phase 0: Prep (Day 1 — before touching Discord)
- [ ] **P0.1** R confirms: will this server be invite-only? Any external collaborators in Phase 1?
- [ ] **P0.2** R confirms: does Content Agent upgrade happen before or after Discord goes live?
- [ ] **P0.3** Happy reads OpenClaw Discord integration docs — confirm `thread=true, mode="session"` is supported in current version

### Phase 1: Server Creation + Structure (Day 1-2)
- [ ] **P1.1** R creates Discord server (or Happy does it via browser with R approval)
- [ ] **P1.2** Create all categories and channels per architecture above
- [ ] **P1.3** Create roles: @agent-happy, @agent-content, @agent-dev, @agent-creative
- [ ] **P1.4** Set permissions per role matrix in Section 6
- [ ] **P1.5** Pin usage guide in #welcome

### Phase 2: Happy Bot Setup (Day 2-3)
- [ ] **P2.1** Create Happy Discord bot: Discord Developer Portal → New Application → Bot
- [ ] **P2.2** Get bot token → configure in OpenClaw (`openclaw discord connect` or equivalent)
- [ ] **P2.3** Bind Happy bot to `#agent-happy` as primary session channel
- [ ] **P2.4** Test: R sends message in `#agent-happy` → Happy responds with persistent session
- [ ] **P2.5** Test: R opens thread in `#proj-mission-control` → Happy picks up scoped session
- [ ] **P2.6** Migrate 1-2 active WebChat project conversations to Discord threads as pilot

### Phase 3: Ops Channels + Workflows (Day 3-4)
- [ ] **P3.1** Happy posts first #ops-morning-review (manual trigger, confirms format)
- [ ] **P3.2** Set up morning-review cron (Happy bot posts daily digest at R's preferred time)
- [ ] **P3.3** Define #ops-approvals format (Happy posts approval request template, pins it)
- [ ] **P3.4** Test approval flow: Happy queues a gated action in #ops-approvals → R approves via reaction
- [ ] **P3.5** Update AGENTS.md: add Discord as approved communication channel

### Phase 4: Content Agent Upgrade (Week 2)
- [ ] **P4.1** `openclaw agents add content-agent`
- [ ] **P4.2** Create Content Agent Discord bot + bind to #agent-content
- [ ] **P4.3** Configure Content Agent heartbeat (07:00 daily)
- [ ] **P4.4** Test isolation: R tags `@content-agent` → only Content Agent responds (Happy silent)
- [ ] **P4.5** Update COMPANY.md Agent Directory: Content Agent → Full Agent

### Phase 5: Dev Agent Upgrade (Week 3)
- [ ] **P5.1** `openclaw agents add dev-agent`
- [ ] **P5.2** Create Dev Agent Discord bot + bind to #agent-dev
- [ ] **P5.3** Configure Dev Agent cron (GitHub CI watch + daily changelog post)
- [ ] **P5.4** Test: Assign a real build task in #agent-dev, verify autonomous execution
- [ ] **P5.5** Update COMPANY.md Agent Directory: Dev Agent → Full Agent

### Phase 6: Full Migration (Week 3-4)
- [ ] **P6.1** All active project work moved from WebChat → Discord project channels
- [ ] **P6.2** WebChat deprecated for project use (remains available for unscoped/debug tasks)
- [ ] **P6.3** Telegram scope narrowed to: urgent personal comms only
- [ ] **P6.4** Retrospective: what worked, what to adjust in channel structure

---

## 9. Open Questions for R

1. **Telegram vs Discord primary:** Should Telegram remain the primary R↔Happy personal channel, or does Discord replace it entirely for all comms? (This changes whether Happy needs a separate Telegram heartbeat or can consolidate to Discord.)

2. **Agent upgrade sequencing:** Do you want Content Agent and Dev Agent upgraded *before* Discord goes live (so they're ready to use their channels from day one), or *after* Discord is stable and proven? Upgrading before is cleaner architecturally but adds setup time.

3. **External access:** Will any external person ever have access to this Discord server (e.g., a co-founder, contractor, or meetup collaborator)? The permissions model needs adjusting if yes — currently designed as a single-owner internal system.

---

## 10. Success Metrics

- R can run 3+ parallel project conversations in Discord simultaneously without context confusion
- Happy holds thread-scoped memory correctly (no bleed between threads)
- Approval queue (#ops-approvals) has <24h response time from R
- Content Agent and Dev Agent operating independently within 3 weeks of Discord launch
- WebChat usage for project work drops to ~0 within 4 weeks

---

*PRD v1 — 2026-03-04 — PM Agent*  
*Next review: after Phase 2 (Happy bot live) — update with any architecture learnings*
