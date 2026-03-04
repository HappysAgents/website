# PRD: Mission Control Dashboard

| Field | Value |
|-------|-------|
| Author | PM Agent |
| Date | 2026-03-03 |
| Status | Draft |
| Version | 1.0 |
| Requested by | R |

---

## 1. Overview

Mission Control is a live operations dashboard for R — the single surface that shows every agent's status, every active project, every pending decision, and everything that happened in the last 24 hours. It replaces the daily archaeological dig through markdown files with a scannable, always-current ops view. Phase 1 is a pure static HTML dashboard served from the OpenClaw gateway at `/mission-control`, polling flat JSON data files that Happy writes continuously. Phase 2 (out of scope here) upgrades to React with live WebSocket feeds.

### One-Sentence Description

"A live ops dashboard that shows R what every agent is doing, what's blocked, and what needs a decision — in under 2 minutes, without opening a single file."

---

## 2. Problem Statement

### The Problem

Running a multi-agent operation entirely from memory and markdown files is not scalable. R currently has no single place to check operational status — every morning review requires reading daily notes, checking agent sessions, and mentally assembling a picture of what's running, blocked, or waiting for input. As the agent team grows, this compounds: more parallel threads mean more cognitive overhead and more things that can silently stall.

### Evidence

- **Quantitative:** R's current morning review takes 10–20 minutes and requires reading at least 3 markdown files (MEMORY.md, daily notes, project summaries) plus querying Happy for status
- **Qualitative:** "What's happening right now?" requires Happy to assemble a status report — a task that should be self-service

### Current Alternatives

- Reading `memory/YYYY-MM-DD.md` daily notes — requires reading, not scanning; lags by hours
- Asking Happy for a status summary — takes a full agent turn; blocks R while waiting
- OpenClaw Control UI — shows sessions but not projects, decisions, or agent-level activity

---

## 3. Target User

### Primary Persona

| Attribute | Description |
|-----------|-------------|
| Name | R |
| Role | Founder / operator of a multi-agent business |
| Goal | Know what's happening across all agents and projects without asking or digging |
| Pain Point | Every status check requires a manual dig through files or a round-trip to Happy |
| Technical Level | Expert |

### User Context

R checks in at irregular intervals throughout the day and first thing in the morning. The dashboard must be instantly readable — no training, no navigation, no context switching.

---

## 4. Solution Overview

### Value Proposition

One URL. One glance. Full operational picture. R opens `/mission-control` and within 10 seconds knows: what's on fire, what's running smoothly, what agents did today, and what decisions are sitting idle. No files to open.

### Key Differentiators

1. **Attention Bar** — Only surfaces items that require R's input. Everything else stays below the fold.
2. **Agent + Project + Feed in one view** — No tab switching; the whole picture fits one screen.
3. **Written by the agents themselves** — Happy writes `blocker.json` and `activity-log.jsonl` as a behavioral habit, so the dashboard always reflects real operational state.

---

## 5. Features (In Scope — Phase 1)

### Feature 1: Attention Bar

**Description:** A top-of-screen banner that shows only items requiring R's input (blockers, pending decisions, required approvals). Zero items = green "All clear". Any items = red banner with count and inline chips.

**User Flow:**
1. R opens `/mission-control`
2. System displays Attention Bar at the top of the page
3. If blockers exist: R sees red banner with count + one chip per open item
4. R clicks a chip
5. System expands a drawer below the bar with full context and Happy's recommendation
6. If no blockers: R sees green bar "All clear"

**Behaviour Specification:**
- **Trigger:** Page load, then every 30 seconds
- **Action:** Fetch `memory/projects/mission-control/blocker.json` via gateway file API; filter `status: "open"` items
- **Result:** Banner renders with correct count and chips; clicking any chip expands its drawer

**Acceptance Criteria:**
- [ ] Given `blocker.json` has 2 open items, when the page loads, then the Attention Bar shows a red banner with count "2" and 2 chips
- [ ] Given `blocker.json` has 0 open items, when the page loads, then the Attention Bar shows a green "All clear" bar
- [ ] Given a chip is clicked, when the drawer opens, then it shows `title`, `description`, and `recommendation` from the blocker entry
- [ ] Given `blocker.json` is updated externally, when 30 seconds elapse, then the banner automatically reflects the new state without a page reload

**Error States:**
- If `blocker.json` cannot be fetched: display amber warning "Status unavailable — check gateway connection"

**Role Owners:**
- Frontend: render bar, chips, drawer, poll logic
- DevOps: ensure gateway file API endpoint is accessible for JSON reads
- QA: test all states (0 items, 1 item, 3+ items, file unavailable)

---

### Feature 2: Agent Status Panel

**Description:** Left column. One card per registered agent. Shows name, role, status emoji, last action (80-char truncated), and relative timestamp. Clicking opens a slide-out showing last 10 activity log entries for that agent.

**User Flow:**
1. Dashboard loads; Agent Status panel renders with all known agents
2. Each agent card shows current status and last action
3. R clicks an agent card
4. Slide-out opens with last 10 activity log entries for that agent
5. R closes slide-out; returns to main view

**Behaviour Specification:**
- **Trigger:** Page load, then every 30 seconds
- **Action:** Read `memory/activity-log.jsonl` to derive last action per agent; read `blocker.json` for status overrides
- **Result:** Cards render with correct status; slide-out shows filtered activity log

**Acceptance Criteria:**
- [ ] Given `activity-log.jsonl` has entries for 2 agents, when the page loads, then 2 agent cards render with correct names and last actions
- [ ] Given an agent has `type: "blocker_raised"` as their most recent log entry, when the card renders, then status shows 🔴 Blocked
- [ ] Given an agent has logged an event in the last 5 minutes, when the card renders, then timestamp shows "X min ago"
- [ ] Given a card is clicked, when the slide-out opens, then it shows the last 10 log entries for that agent only, newest first
- [ ] Given an agent has no log entries, when the card renders, then it shows "No activity recorded"

**Error States:**
- If `activity-log.jsonl` is missing: show placeholder cards with "Log unavailable"

**Role Owners:**
- Frontend: card layout, slide-out, log filtering, polling
- QA: test all status states, slide-out content, empty states

---

### Feature 3: Projects Panel

**Description:** Centre column. One card per active project from `memory/projects-index.json`. Shows project name, status badge, owner agent, and relative last-updated timestamp. Clicking opens a drawer showing the project's `summary.md` rendered as markdown.

**User Flow:**
1. Dashboard loads; Projects panel renders cards from `projects-index.json`
2. Each card shows name, status, and owner
3. R clicks a project card
4. Drawer opens with `summary.md` rendered as markdown
5. R closes drawer; returns to main view

**Behaviour Specification:**
- **Trigger:** Page load, then every 60 seconds
- **Action:** Fetch `memory/projects-index.json`; render one card per project where `status != "done"`
- **Result:** Project cards shown in status-priority order: blocked → needs_decision → active → paused

**Acceptance Criteria:**
- [ ] Given `projects-index.json` has 3 active projects, when the page loads, then 3 project cards render
- [ ] Given a project has `status: "blocked"`, when the card renders, then status badge shows 🔴 Blocked
- [ ] Given `projects-index.json` is updated by Happy (heartbeat), when 60 seconds elapse, then the panel refreshes automatically
- [ ] Given a project card is clicked, when the drawer opens, then it renders the project's `summary.md` as formatted markdown (not raw text)
- [ ] Given a project has `status: "done"`, when the panel renders, then that project is NOT shown

**Error States:**
- If `projects-index.json` is missing: show "No project data — waiting for Happy's next heartbeat"

**Role Owners:**
- Frontend: card layout, status-priority ordering, drawer with markdown rendering, polling
- QA: test all status types, markdown rendering, filtering of done projects

---

### Feature 4: Activity Feed

**Description:** Right column. Chronological list of agent events, newest first, last 24 hours. One row per event: `[relative time] [agent]: [summary]`. Colour-coded by level. Scrollable. Auto-updates every 30 seconds.

**User Flow:**
1. Dashboard loads; Activity Feed shows last 24h of events newest-first
2. R scans feed to understand recent agent activity
3. Feed automatically updates as new events arrive (within 30s)

**Behaviour Specification:**
- **Trigger:** Page load, then every 30 seconds
- **Action:** Read `memory/activity-log.jsonl`; filter to last 24h; sort descending by timestamp; render
- **Result:** Scrollable list with colour coding: info=grey, warn=amber, error=red, success=green

**Acceptance Criteria:**
- [ ] Given `activity-log.jsonl` has 50 events, when the page loads, then only events from the last 24 hours are shown
- [ ] Given a new event is appended to `activity-log.jsonl`, when 30 seconds elapse, then the new event appears at the top of the feed without a page reload
- [ ] Given an event has `level: "error"`, when it renders in the feed, then it displays with a red colour indicator
- [ ] Given the feed has more than 20 events, when rendered, then the list is scrollable and does not overflow the panel
- [ ] Given `activity-log.jsonl` is empty, when the feed renders, then it shows "No activity in the last 24 hours"

**Error States:**
- If log file is unavailable: show "Activity log unavailable"

**Role Owners:**
- Frontend: feed layout, time filtering, scroll, colour-coding, polling
- QA: test 24h filter, colour states, scroll, empty state, live update

---

## 6. Out of Scope (Phase 1)

- **NOT building:** Cron Jobs panel (needs gateway WS API — Phase 2)
- **NOT building:** Channel Health panel (needs gateway WS API — Phase 2)
- **NOT building:** Inline Approve/Reject/Snooze buttons in Attention Bar drawer (Phase 2)
- **NOT building:** Agent detail slide-out beyond last 10 log entries
- **NOT building:** React migration (Phase 2)
- **NOT building:** Mobile/Tailscale remote access (Phase 2)
- **NOT building:** Historical feed toggle beyond 24 hours (Phase 2)
- **NOT building:** Authentication layer beyond existing gateway token (Phase 2)
- **NOT building:** Cost Meter panel (Phase 2)

---

## 7. User Flows

### Primary Flow: Morning Review

```
1. R navigates to http://127.0.0.1:18789/mission-control
2. System renders dashboard (~1 second load)
3. R reads Attention Bar — sees 0 or N items needing input
4. R scans Agent Status cards — all agents accounted for, status visible
5. R scans Project cards — blocked/stalled projects immediately visible
6. R reads Activity Feed — last 24h of agent work visible
7. R leaves dashboard — no file was opened, no Happy query needed
```

### Secondary Flow: Investigating a Blocker

```
1. R sees red Attention Bar with "2 items"
2. R clicks chip "Approve Mission Control Phase 1"
3. System expands drawer with full description and Happy's recommendation
4. R reads context inline
5. R takes action (in Telegram/chat — drawer is read-only in Phase 1)
6. Happy resolves blocker, sets status: "resolved" in blocker.json
7. Next poll cycle: Attention Bar updates, item disappears
```

### Secondary Flow: Drilling into a Project

```
1. R clicks a project card ("Athens Meetup 🔴 Blocked")
2. System opens drawer with rendered summary.md
3. R reads project summary inline
4. R closes drawer
5. R returns to main dashboard view
```

### Error Flow: Gateway Unavailable

```
1. R opens /mission-control
2. Gateway is unreachable or data files missing
3. System displays dashboard shell with amber warnings per panel
4. Each panel shows its specific error state message
5. Panels retry on next poll interval automatically
```

---

## 8. Success Metrics

| Metric | Target | Measurement Method | Owner |
|--------|--------|--------------------|-------|
| Morning review time | < 2 minutes | R self-reports | R |
| Data freshness | Max 30s lag on blockers/feed, 60s on projects | Manual check of log timestamps vs display | QA |
| Dashboard load time | < 1 second on localhost | Browser DevTools network tab | QA |
| Blocker visibility | 100% of open blockers surfaced in Attention Bar | QA test against blocker.json | QA |
| Zero missed blockers | No open blocker absent from Attention Bar | QA | QA |

---

## 9. Frontend Specification

### Pages / Views

| Page | Route | Description | Auth Required |
|------|-------|-------------|---------------|
| Dashboard | /mission-control | Full ops dashboard | Gateway token (existing) |

### Layout

CSS Grid, 3-column body + full-width top bar + full-width bottom row:

```
[Attention Bar — full width]
[Agent Status | Projects | Activity Feed]
```

No external CSS framework. Vanilla CSS. System font stack. Dark or light — R's preference (default: light).

### Components

| Component | Description |
|-----------|-------------|
| AttentionBar | Top bar; fetches blocker.json; renders chips; manages drawer open/close |
| BlockerDrawer | Slide-down panel below Attention Bar; shows single blocker detail |
| AgentCard | One card per agent; shows status emoji, name, last action, timestamp |
| AgentSlideOut | Slide-out panel; shows last 10 log entries for selected agent |
| ProjectCard | One card per project; shows name, status badge, owner, timestamp |
| ProjectDrawer | Slide-out panel; renders project summary.md as markdown |
| ActivityFeed | Scrollable list; shows last 24h events colour-coded by level |
| ErrorBanner | Amber inline warning for individual panel data failures |

### State & Data Requirements

- No framework state management — vanilla JS module pattern
- Each panel manages its own fetch + setInterval independently
- No shared global state — panels are isolated; failure in one does not crash others
- Markdown rendering: use [marked.js](https://marked.js.org/) loaded from CDN (single script tag, no npm required)

### UI/UX Constraints

- Responsive down to 1280px wide minimum (desktop-only for Phase 1)
- No external font dependencies — system font stack
- All panels must handle their individual loading, error, and empty states — no global spinner
- Timestamps: always relative ("3 min ago", "2h ago", "yesterday") — use vanilla JS, no library
- Status emoji convention: 🟢 Active/Running, 🟡 Idle/Needs Decision, 🔴 Blocked/Error, ✅ Done

### File Endpoints (consumed by Frontend via gateway)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /files/memory/projects/mission-control/blocker.json | Blocker list for Attention Bar |
| GET | /files/memory/projects-index.json | Project index for Projects panel |
| GET | /files/memory/activity-log.jsonl | Activity log for Feed + Agent Status |
| GET | /files/memory/projects/{id}/summary.md | Project summary for drawer |

> **Note for Frontend Engineer:** Confirm exact gateway file-serving endpoint format with DevOps before building fetch calls. The path pattern above is the expected format — DevOps confirms the actual URL.

---

## 10. Backend Specification

*There is no backend engineer agent for Phase 1. The "backend" for Mission Control is Happy's behavioral change: writing and maintaining the three data files. This is documented here as a contract, not as an engineering task.*

### Data Files Happy Must Write

**`memory/projects/mission-control/blocker.json`**
Happy writes this file on every blocker/decision surfacing. Schema documented in Data Contracts section. Happy must also mark items `status: "resolved"` (never delete) when cleared.

**`memory/activity-log.jsonl`**
Happy appends one JSON line after each significant action. Schema documented in Data Contracts section. Entries are never deleted — archived to monthly files during heartbeat maintenance.

**`memory/projects-index.json`**
Happy regenerates this on every heartbeat by scanning `memory/projects/*/summary.md`. Schema documented in Data Contracts section.

### Happy's Behavioral Commitment (starts today)
- [ ] Write to `blocker.json` on every blocker/decision surfacing (not just in chat)
- [ ] Append to `activity-log.jsonl` after every significant action
- [ ] Regenerate `projects-index.json` on every heartbeat
- [ ] Mark blockers as `status: "resolved"` when cleared

---

## 11. DevOps & Infrastructure Specification

### What DevOps Must Deliver

1. **Confirm gateway static file serving** — Identify the correct directory path where the HTML file must live to be served at `/mission-control`. Document the exact path.
2. **Confirm gateway file API** — Confirm the exact URL pattern for reading files from the workspace via the gateway (needed by Frontend for data fetches). Test with `blocker.json`.
3. **Deploy dashboard HTML** — Place `index.html` (produced by Frontend) at the confirmed static serve path
4. **Verify** — Confirm `/mission-control` is reachable and returns the dashboard

### Environment Requirements

| Variable | Environment | Description | Sensitive |
|----------|-------------|-------------|-----------|
| Gateway URL | dev | `http://127.0.0.1:18789` | No |

### No CI/CD for Phase 1

Phase 1 is a single HTML file. Deploy = copy file to gateway directory. No pipeline required. Manual copy by DevOps engineer on completion.

### Definition of Done (DevOps)

- [ ] Gateway static serve path confirmed and documented in `outputs/BUILD_STATUS.md`
- [ ] Gateway file API URL pattern confirmed and documented
- [ ] `index.html` deployed and `/mission-control` returns 200
- [ ] File API tested: fetching `blocker.json` via confirmed URL returns valid JSON

---

## 12. QA & Test Plan

### Test Scope

| Feature | Test Types | Priority |
|---------|------------|----------|
| Attention Bar — all states | Manual functional | P0 |
| Agent Status — all states | Manual functional | P0 |
| Projects Panel — all states | Manual functional | P0 |
| Activity Feed — all states | Manual functional | P0 |
| 30s/60s auto-refresh | Manual timing | P0 |
| Error states (file unavailable) | Manual functional | P1 |
| Dashboard load time < 1s | Browser DevTools | P1 |
| Markdown rendering in drawers | Manual visual | P1 |

### Acceptance Criteria → Test Mapping

| AC | Criterion | Test Type | Priority |
|----|-----------|-----------|----------|
| AC-1.1 | Attention Bar shows red with 2 items when blocker.json has 2 open | Manual | P0 |
| AC-1.2 | Attention Bar shows green "All clear" when 0 open items | Manual | P0 |
| AC-1.3 | Drawer shows title, description, recommendation on chip click | Manual | P0 |
| AC-1.4 | Banner auto-refreshes at 30s without page reload | Manual + timer | P0 |
| AC-2.1 | Agent cards render for each agent in activity log | Manual | P0 |
| AC-2.2 | Blocked status shows 🔴 for agent with blocker_raised | Manual | P0 |
| AC-2.3 | Timestamps show relative format ("X min ago") | Manual | P0 |
| AC-2.4 | Slide-out shows last 10 entries for clicked agent | Manual | P0 |
| AC-2.5 | Empty state shows "No activity recorded" | Manual | P0 |
| AC-3.1 | Project cards render from projects-index.json | Manual | P0 |
| AC-3.2 | Blocked status badge shows 🔴 | Manual | P0 |
| AC-3.3 | Panel auto-refreshes at 60s | Manual + timer | P0 |
| AC-3.4 | Drawer renders summary.md as formatted markdown | Manual | P1 |
| AC-3.5 | Done projects not shown | Manual | P0 |
| AC-4.1 | Feed shows only last 24h events | Manual + log manipulation | P0 |
| AC-4.2 | New event appears within 30s without reload | Manual + timer | P0 |
| AC-4.3 | Error level events show red indicator | Manual | P0 |
| AC-4.4 | Feed is scrollable with 20+ events | Manual | P1 |
| AC-4.5 | Empty state shows "No activity in the last 24 hours" | Manual | P0 |

### Test Data Requirements

- `blocker.json` with: 0 items, 1 item, 3 items (mix of types)
- `activity-log.jsonl` with: entries from multiple agents, all 4 level types, entries older than 24h
- `projects-index.json` with: all status types including "done"
- Test scenario for missing/unavailable file (rename file temporarily)

### Definition of Done (QA)

- [ ] All P0 acceptance criteria have a passing manual test
- [ ] All P1 acceptance criteria have a passing manual test
- [ ] All 4 error states tested (file unavailable per panel)
- [ ] Auto-refresh timing verified for both 30s and 60s intervals
- [ ] Dashboard load time confirmed < 1 second in browser DevTools
- [ ] QA sign-off recorded in `outputs/BUILD_STATUS.md`

---

## 13. Cross-Role Dependencies

| Dependency | Blocking Role | Blocked Role | Resolution |
|------------|--------------|--------------|------------|
| Gateway static serve path + file API URL | DevOps | Frontend | DevOps confirms paths in BUILD_STATUS.md before Frontend writes fetch calls |
| `blocker.json` with real data | Happy (behavior) | QA | Happy starts writing today; QA has data before testing begins |
| `activity-log.jsonl` with real data | Happy (behavior) | QA | Same as above |
| `projects-index.json` with real data | Happy (behavior) | QA | Same as above |

### Recommended Build Order

1. **Phase 1 — Foundation (Day 1):**
   - Happy: start writing all 3 data files immediately (today)
   - DevOps: confirm gateway serve path + file API URL; document in BUILD_STATUS.md

2. **Phase 2 — Build (Days 1–3):**
   - Frontend: build all 4 panels using confirmed paths from DevOps
   - QA: write test checklist from acceptance criteria above

3. **Phase 3 — Deploy & Test (Day 3–4):**
   - DevOps: deploy `index.html` to gateway directory
   - QA: run full test checklist against live dashboard

4. **Phase 4 — Sign-off (Day 4):**
   - QA: all P0 ACs passing → sign off
   - R: open `/mission-control`, confirm 2-minute morning review target is met

---

## 14. Open Questions

| Question | Owner | Status | Answer |
|----------|-------|--------|--------|
| Exact gateway static file serve directory path | DevOps | Open — DevOps to investigate first | — |
| Exact gateway file API URL pattern for workspace file reads | DevOps | Open | — |
| Light or dark theme preference | R | Open | Default: light |
| Should done projects ever be visible (toggle)? | R | Deferred to Phase 2 | No toggle in Phase 1 |

---

## 15. Timeline & Milestones

| Phase | Goal | Target | Owner |
|-------|------|--------|-------|
| Data files live | Happy writing blocker.json + activity-log.jsonl | Today | Happy |
| DevOps foundation | Gateway paths confirmed | Day 1 | DevOps |
| Frontend build | All 4 panels complete | Day 1–3 | Frontend |
| Deploy + test | Dashboard live at /mission-control, all P0 ACs passing | Day 4 | DevOps + QA |
| R sign-off | Morning review target met | Day 5 | R |

---

## Appendix: Data Contracts

### blocker.json schema

```json
{
  "version": "1",
  "lastUpdated": "<ISO8601>",
  "items": [{
    "id": "blocker-001",
    "type": "pending_decision | blocker | approval_required",
    "priority": "critical | high | medium | low",
    "title": "<1-line summary — shown in chip>",
    "description": "<full context — shown in drawer>",
    "agentId": "happy",
    "projectId": "<project folder name>",
    "createdAt": "<ISO8601>",
    "status": "open | resolved | snoozed",
    "recommendation": "<Happy's suggested next action>",
    "resolvedAt": "<ISO8601 or omit>"
  }]
}
```

### activity-log.jsonl schema (one object per line)

```json
{"ts":"<ISO8601>","agent":"happy","type":"<event_type>","project":"<id or null>","summary":"<max 120 chars>","level":"info | warn | error | success"}
```

### projects-index.json schema

```json
{
  "version": "1",
  "generatedAt": "<ISO8601>",
  "projects": [{
    "id": "<folder name>",
    "name": "<display name>",
    "status": "active | needs_decision | blocked | paused | done",
    "ownerAgent": "happy",
    "phase": "<current phase string>",
    "lastUpdated": "<ISO8601>",
    "blockerIds": ["blocker-001"],
    "summaryPath": "memory/projects/<id>/summary.md"
  }]
}
```
