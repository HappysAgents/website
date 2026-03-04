# PRD: Mission Control Dashboard

| Field | Value |
|-------|-------|
| Author | Happy (updated from PM Agent draft) |
| Date | 2026-03-04 |
| Status | **v2.0 — Awaiting R Final Approval** |
| Version | 2.0 |
| Supersedes | PRD-MissionControl-v1.md |
| Requested by | R |

---

## Changelog v1 → v2

| # | Change | Source |
|---|--------|--------|
| 1 | Tailscale remote access promoted from Phase 2 → **Phase 1** | R Q2 |
| 2 | Agent task dispatch (full control) promoted from Phase 2 → **Phase 1** | R Q1 |
| 3 | Mobile-responsive layout required (min 768px) for Tailscale/mobile use | R Q2 |
| 4 | Agent Status panel + Activity Feed designed for N agents from day one | R Q5 |
| 5 | Projects panel notes agent-native products (no human-facing UI) | R Q3 |
| 6 | Design for longevity — no Phase 1 shortcuts that create Phase 2 rework | R Q4 |
| 7 | Inline Approve/Reject/Snooze removed from Phase 2 out-of-scope → **Phase 1 in-scope** | R Q1 |
| 8 | Auth layer: Tailscale auth + gateway token both required for remote access | R Q2 |

---

## 1. Overview

Mission Control is a live operations command centre for R — the single surface that shows every agent's status, every active project, every pending decision, and everything that happened in the last 24 hours. It replaces the daily archaeological dig through markdown files with a scannable, always-current ops view.

Phase 1 is a pure static HTML dashboard served from the OpenClaw gateway at `/mission-control`, polling flat JSON data files that Happy writes continuously. It is accessible both locally (Canvas) and remotely via Tailscale on any of R's personal devices. R can read the full operational picture **and dispatch tasks or approve decisions** without opening a single file or leaving the dashboard.

Phase 2 (out of scope here) upgrades to React with live WebSocket feeds and richer agent orchestration.

### One-Sentence Description

"A live ops command centre — accessible anywhere via Tailscale — where R sees what every agent is doing, approves decisions, and dispatches tasks, all without opening a file."

---

## 2. Problem Statement

### The Problem

Running a multi-agent operation entirely from memory and markdown files is not scalable. R currently has no single place to check operational status — every morning review requires reading daily notes, checking agent sessions, and mentally assembling a picture of what's running, blocked, or waiting for input. As the agent team grows to multiple simultaneous agents, this compounds: more parallel threads mean more cognitive overhead and more things that can silently stall.

R also has no way to dispatch tasks to agents or approve decisions from a mobile device — currently requiring access to the Mac or a full webchat session.

### Evidence

- **Quantitative:** R's current morning review takes 10–20 minutes and requires reading at least 3 markdown files (MEMORY.md, daily notes, project summaries) plus querying Happy for status
- **Qualitative:** "What's happening right now?" requires Happy to assemble a status report — a task that should be self-service
- **Scale evidence:** Multiple agents running simultaneously is a near-term reality — the current system has no structure for tracking N parallel agents

### Current Alternatives

- Reading `memory/YYYY-MM-DD.md` daily notes — requires reading, not scanning; lags by hours
- Asking Happy for a status summary — takes a full agent turn; blocks R while waiting
- OpenClaw Control UI — shows sessions but not projects, decisions, or agent-level activity; no task dispatch; no mobile access

---

## 3. Target User

### Primary Persona

| Attribute | Description |
|-----------|-------------|
| Name | R |
| Role | Founder / operator of a multi-agent business |
| Goal | Know what's happening across all agents and projects without asking or digging; approve and dispatch without switching context |
| Pain Point | Every status check requires a manual dig through files or a round-trip to Happy; task dispatch requires full chat session |
| Technical Level | Expert |
| Access Pattern | Checks from Mac (Canvas/browser), phone, and iPad throughout the day — often remotely via Tailscale |

---

## 4. Solution Overview

### Value Proposition

One URL. One glance. Full operational picture + action capability. R opens `/mission-control` (on any device, anywhere) and within 10 seconds knows: what's on fire, what's running smoothly, what agents did today, what decisions need input — and can approve or dispatch tasks directly from the dashboard. No files to open.

### Key Differentiators

1. **Full agent control** — Not a viewer. R can approve decisions, dispatch tasks to agents, and clear blockers without leaving the dashboard.
2. **Anywhere access** — Served via Tailscale. Works on R's phone, iPad, or any personal device.
3. **Multi-agent by design** — Built for N agents running simultaneously, not retrofitted from a single-agent view.
4. **Agent-native** — Written by the agents themselves. Happy writes `blocker.json` and `activity-log.jsonl` as a behavioral habit, so the dashboard always reflects real operational state.

---

## 5. Features (In Scope — Phase 1)

### Feature 1: Attention Bar + Action Drawer

**Description:** A top-of-screen banner showing only items requiring R's input (blockers, pending decisions, required approvals). Zero items = green "All clear". Any items = red banner with count + inline chips. Clicking a chip expands a drawer with full context and **inline action buttons** — R can act without switching to chat.

**User Flow:**
1. R opens `/mission-control` (on any device)
2. System displays Attention Bar at the top of the page
3. If blockers exist: R sees red banner with count + one chip per open item
4. R clicks a chip → drawer expands below bar with full context, Happy's recommendation, and action buttons
5. R clicks **Approve**, **Reject**, or **Dispatch Task** inline
6. System writes R's decision to `blocker.json` (`status: "resolved"` or `status: "dispatched"`) and writes a task entry to `task-queue.json`
7. Happy picks up the resolution on next poll cycle
8. If no blockers: R sees green bar "All clear"

**Action Buttons (Phase 1):**
- **Approve** — marks blocker resolved with `resolution: "approved"`
- **Reject** — marks blocker resolved with `resolution: "rejected"`; optional 1-line reason (text input)
- **Dispatch Task** — opens a simple task form: agent selector + task description + priority; writes to `task-queue.json`

**Behaviour Specification:**
- **Trigger:** Page load, then every 30 seconds
- **Action:** Fetch `mission-control/blocker.json` via gateway file API; filter `status: "open"` items
- **Write:** On action button press, PATCH `blocker.json` via gateway write API; append to `task-queue.json`

**Acceptance Criteria:**
- [ ] Given `blocker.json` has 2 open items, when the page loads, then Attention Bar shows red banner with count "2" and 2 chips
- [ ] Given `blocker.json` has 0 open items, when the page loads, then Attention Bar shows green "All clear" bar
- [ ] Given a chip is clicked, when the drawer opens, then it shows `title`, `description`, `recommendation`, and 3 action buttons
- [ ] Given R clicks Approve, then `blocker.json` item is updated to `status: "resolved", resolution: "approved"` and banner reflects new count within 30s
- [ ] Given R clicks Dispatch Task, when the form is submitted, then a task entry is appended to `task-queue.json` with correct `agentId`, `description`, `priority`, and `createdAt`
- [ ] Given `blocker.json` is updated externally, when 30s elapse, then banner auto-updates without page reload

**Error States:**
- If `blocker.json` cannot be fetched: amber warning "Status unavailable — check gateway connection"
- If write action fails: inline error "Could not save — retry or action via chat"

**Role Owners:**
- Frontend: bar, chips, drawer, action buttons, task form, write API calls, poll logic
- DevOps: confirm gateway write API endpoint; confirm `task-queue.json` path accessible for write
- QA: test all states + all action paths + write failures

---

### Feature 2: Agent Status Panel

**Description:** Left column. One card per registered agent — designed for N agents, not just Happy. Shows name, role, status emoji, last action (80-char truncated), relative timestamp. Clicking opens a slide-out with last 10 activity log entries + a **quick-dispatch button** to send a task to that agent directly.

**User Flow:**
1. Dashboard loads; Agent Status panel renders all known agents (current + future)
2. Each agent card shows current status and last action
3. R clicks an agent card → slide-out shows last 10 activity entries + Quick Dispatch button
4. R clicks Quick Dispatch → task form pre-filled with that agent; R adds description + priority; submits
5. Task written to `task-queue.json`; slide-out confirms

**Multi-Agent Design Notes:**
- Panel must handle 1 to 20+ agents without layout breaking
- Cards should stack/scroll gracefully if agent count exceeds visible area
- Agent list is derived from `agents-registry.json` (new file — see Data Contracts) — not hardcoded
- New agents added by Happy appear automatically on next poll without frontend changes

**Behaviour Specification:**
- **Trigger:** Page load, then every 30 seconds
- **Action:** Read `agents-registry.json` for agent list; read `activity-log.jsonl` to derive last action per agent; read `blocker.json` for status overrides

**Acceptance Criteria:**
- [ ] Given `agents-registry.json` has 5 agents, when page loads, then 5 agent cards render
- [ ] Given an agent has `type: "blocker_raised"` as most recent log entry, then status shows 🔴 Blocked
- [ ] Given a card is clicked, when slide-out opens, then it shows last 10 log entries for that agent + Quick Dispatch button
- [ ] Given Quick Dispatch is submitted, then task entry appears in `task-queue.json` with correct `agentId`
- [ ] Given an agent is added to `agents-registry.json`, when 30s elapse, then a new card appears without page reload
- [ ] Given 15 agents exist, panel scrolls gracefully without overflow

**Error States:**
- If `activity-log.jsonl` missing: placeholder cards with "Log unavailable"
- If `agents-registry.json` missing: show Happy's card only (fallback hardcoded entry)

**Role Owners:**
- Frontend: card grid, slide-out, quick dispatch, N-agent layout, polling
- QA: test N-agent layout (1, 5, 15 agents), dispatch flow, scroll

---

### Feature 3: Projects Panel

**Description:** Centre column. One card per active project from `memory/projects-index.json`. Shows project name, status badge, owner agent, and relative last-updated timestamp. Supports **agent-native projects** (no human-facing product) with a distinct badge. Clicking opens a drawer showing the project's `summary.md` rendered as markdown.

**Agent-Native Project Support:**
- Projects with `type: "agent-native"` in `projects-index.json` display a `⚙️ Agent-Native` badge
- These projects have no user-facing product — the ops view IS the product interface
- Status, blockers, and activity for agent-native projects surfaces identically to regular projects

**Behaviour Specification:**
- **Trigger:** Page load, then every 60 seconds
- **Action:** Fetch `memory/projects-index.json`; render one card per project where `status != "done"`; order: blocked → needs_decision → active → paused

**Acceptance Criteria:**
- [ ] Given `projects-index.json` has 3 active projects, when page loads, then 3 project cards render
- [ ] Given a project has `type: "agent-native"`, then card shows `⚙️ Agent-Native` badge
- [ ] Given a project has `status: "blocked"`, then status badge shows 🔴 Blocked
- [ ] Given `projects-index.json` is updated, when 60s elapse, then panel refreshes automatically
- [ ] Given a card is clicked, then drawer renders `summary.md` as formatted markdown
- [ ] Given a project has `status: "done"`, then it is NOT shown

**Error States:**
- If `projects-index.json` missing: "No project data — waiting for Happy's next heartbeat"

**Role Owners:**
- Frontend: card layout, agent-native badge, status ordering, drawer with markdown, polling
- QA: test all status types, agent-native badge, markdown rendering, done-project filtering

---

### Feature 4: Activity Feed

**Description:** Right column. Chronological list of agent events, newest first, last 24 hours. One row per event: `[relative time] [agent]: [summary]`. Colour-coded by level. Scrollable. Auto-updates every 30 seconds. Designed for high-volume multi-agent output (50+ events/day).

**Multi-Agent Capacity Notes:**
- Feed must handle high event volume without performance degradation
- Agent name shown on every row (essential when N agents are running)
- Optional filter: click an agent name in any row to filter feed to that agent only (quick drill-down)

**Behaviour Specification:**
- **Trigger:** Page load, then every 30 seconds
- **Action:** Read `memory/activity-log.jsonl`; filter to last 24h; sort descending; render
- **Result:** Scrollable list; colour coding: info=grey, warn=amber, error=red, success=green

**Acceptance Criteria:**
- [ ] Given `activity-log.jsonl` has 50 events, only last 24h events show
- [ ] Given a new event is appended, when 30s elapse, it appears at top without page reload
- [ ] Given an event has `level: "error"`, it displays with red indicator
- [ ] Given the feed has 20+ events, list is scrollable without overflow
- [ ] Given R clicks an agent name in a row, feed filters to that agent only; a clear filter button appears
- [ ] Given `activity-log.jsonl` is empty, feed shows "No activity in the last 24 hours"

**Error States:**
- If log file unavailable: "Activity log unavailable"

**Role Owners:**
- Frontend: feed layout, time filter, colour coding, scroll, agent-name filter, polling
- QA: test 24h filter, colour states, scroll, agent filter, live update, high-volume (50+ entries)

---

### Feature 5: Tailscale Remote Access

**Description:** Mission Control is accessible from any of R's personal devices (phone, iPad, Mac) via Tailscale. The gateway exposes `/mission-control` on the Tailscale network. The dashboard is mobile-responsive at 768px minimum width.

**Access Pattern:**
- Local: `http://127.0.0.1:18789/mission-control` (Canvas or desktop browser)
- Remote: `http://<tailscale-ip>:18789/mission-control` (any personal device on Tailscale)

**Mobile Layout:**
- At < 1024px: columns collapse to single-column stack (Attention Bar → Agents → Projects → Feed)
- All panels remain functional on mobile; action buttons (Approve, Reject, Dispatch) must be touch-friendly (min 44px tap targets)
- Quick Dispatch form usable on mobile keyboard

**Auth:**
- Gateway token auth (existing) applies on all access paths
- Tailscale network provides the transport security layer
- No new auth surface introduced

**DevOps Requirements:**
1. Confirm gateway listens on Tailscale IP (not just 127.0.0.1) — may require config change
2. Confirm port 18789 is accessible on Tailscale (or identify correct port)
3. Document the exact remote URL in `outputs/BUILD_STATUS.md`

**Acceptance Criteria:**
- [ ] Given R accesses the Tailscale IP from a mobile browser, then the dashboard loads and is usable
- [ ] Given viewport is 768px wide, then panels stack to single column without horizontal scroll
- [ ] Given R taps Approve on mobile, then action registers correctly (44px+ tap target)
- [ ] Given R accesses remote URL without gateway token, then access is denied (gateway handles this)

**Role Owners:**
- DevOps: gateway Tailscale binding, port confirmation, remote URL documentation
- Frontend: mobile-responsive CSS, touch-friendly action buttons
- QA: test on mobile browser (Safari iOS or Chrome Android) via Tailscale

---

## 6. Out of Scope (Phase 1)

- **NOT building:** Cron Jobs panel (needs gateway WS API — Phase 2)
- **NOT building:** Channel Health panel (needs gateway WS API — Phase 2)
- **NOT building:** React migration (Phase 2)
- **NOT building:** Historical feed toggle beyond 24 hours (Phase 2)
- **NOT building:** Cost Meter panel (Phase 2)
- **NOT building:** Agent-to-agent task routing (Phase 2) — Phase 1 is R → agent dispatch only
- **NOT building:** Task status tracking (Phase 2) — Phase 1 writes tasks; tracking in Phase 2

---

## 7. User Flows

### Primary Flow: Morning Review (Remote, Mobile)

```
1. R opens http://<tailscale-ip>:18789/mission-control on phone
2. Dashboard loads in ~1s (single HTML file, small payload)
3. Mobile layout: Attention Bar at top — R checks for blockers
4. Scrolls to Agents — all agents visible, status clear
5. Scrolls to Projects — blocked/stalled projects visible
6. Scrolls to Activity Feed — last 24h visible
7. Full ops picture in under 2 minutes without opening a file
```

### Secondary Flow: Approve a Decision (Anywhere)

```
1. R sees red Attention Bar: "2 items"
2. Taps chip "Approve Mission Control Phase 1"
3. Drawer opens with context + recommendation + 3 action buttons
4. R taps Approve
5. System writes resolution to blocker.json
6. Happy picks up resolution on next cycle, proceeds
7. Attention Bar updates to "1 item" within 30s
```

### Secondary Flow: Dispatch a Task (On the Go)

```
1. R opens Mission Control on iPad via Tailscale
2. Taps Agent Card for "Content Agent"
3. Slide-out opens with last 10 events + Quick Dispatch button
4. R taps Quick Dispatch → form appears (agent pre-filled: Content Agent)
5. R types: "Write Day 7 post — topic: task dispatch from Mission Control"
6. Sets priority: High
7. Taps Submit
8. task-queue.json updated; Happy picks up task on next cycle
9. Slide-out shows confirmation: "Task dispatched ✅"
```

### Secondary Flow: Filter Activity by Agent

```
1. R sees 30 events in Activity Feed
2. Wants to see only Dev Agent activity
3. Taps "Dev Agent" label on any Dev Agent row
4. Feed filters to Dev Agent events only
5. "Filtered: Dev Agent" label appears with × to clear
6. R taps × → full feed restored
```

### Error Flow: Gateway Unavailable

```
1. R opens /mission-control
2. Gateway unreachable or data files missing
3. Dashboard shell renders; amber warnings per panel
4. Each panel shows its specific error message
5. Panels retry on next poll interval automatically
```

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Morning review time | < 2 minutes | R self-reports |
| Blocker visibility | 100% of open blockers in Attention Bar | QA test |
| Decision turnaround | R can approve from mobile in < 30s | QA timing test |
| Data freshness | Max 30s lag on blockers/feed; 60s on projects | Manual timestamp check |
| Dashboard load time | < 1s on local; < 3s on Tailscale (mobile) | Browser DevTools |
| Multi-agent readiness | Works correctly with 10 simultaneous agents in test data | QA |

---

## 9. Frontend Specification

### Pages / Views

| Page | Route | Description | Auth |
|------|-------|-------------|------|
| Dashboard | /mission-control | Full ops command centre | Gateway token (existing) |

### Layout

**Desktop (≥ 1024px):** CSS Grid, 3-column body + full-width top bar:
```
[Attention Bar — full width]
[Agent Status | Projects | Activity Feed]
```

**Mobile (768px – 1023px):** Single column stack:
```
[Attention Bar]
[Agent Status]
[Projects]
[Activity Feed]
```

No external CSS framework. Vanilla CSS. System font stack. Default: light theme.

### Components

| Component | Description |
|-----------|-------------|
| AttentionBar | Top bar; fetches blocker.json; renders chips; manages action drawer |
| ActionDrawer | Slide-down below Attention Bar; shows blocker detail + Approve/Reject/Dispatch buttons |
| TaskForm | Inline form in drawer and slide-out; agent selector + description + priority; submits to task-queue.json |
| AgentCard | One card per agent (N agents); status emoji, name, last action, timestamp |
| AgentSlideOut | Slide-out; shows last 10 log entries for agent + Quick Dispatch button |
| ProjectCard | One card per project; name, status badge, agent-native badge, owner, timestamp |
| ProjectDrawer | Slide-out; renders summary.md as markdown |
| ActivityFeed | Scrollable list; last 24h events; colour-coded; agent-name filter |
| AgentFilter | Filter chip for Activity Feed; shows active filter + clear button |
| ErrorBanner | Amber inline warning per panel |

### State & Data Requirements

- No framework — vanilla JS module pattern
- Each panel manages own fetch + setInterval independently
- No global state — panel failures are isolated
- Markdown: [marked.js](https://marked.js.org/) from CDN (single script tag)
- Write API calls: gateway write endpoint (DevOps to confirm exact pattern)

### UI/UX Constraints

- Responsive: works at 768px+ (mobile) and 1280px+ (desktop)
- All action buttons: min 44px tap target (touch-friendly)
- All panels handle loading, error, and empty states independently
- Timestamps: relative ("3 min ago", "2h ago") — vanilla JS, no library
- Status emoji: 🟢 Active/Running, 🟡 Idle/Needs Decision, 🔴 Blocked/Error, ✅ Done, ⚙️ Agent-Native
- Agent filter in Activity Feed resets on page reload (no persistence in Phase 1)

### File Endpoints (consumed by Frontend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /files/memory/projects/mission-control/blocker.json | Blocker list |
| GET | /files/memory/projects/mission-control/task-queue.json | Task queue (read for confirmation) |
| GET | /files/memory/projects-index.json | Project index |
| GET | /files/memory/activity-log.jsonl | Activity log |
| GET | /files/memory/projects/mission-control/agents-registry.json | Agent list |
| GET | /files/memory/projects/{id}/summary.md | Project summary |
| PATCH/POST | /files/memory/projects/mission-control/blocker.json | Write action resolutions |
| PATCH/POST | /files/memory/projects/mission-control/task-queue.json | Write dispatched tasks |

> **Note for Frontend:** Confirm exact gateway write API pattern with DevOps. Read path above is inferred; write endpoint may differ.

---

## 10. Backend Specification

*The "backend" is Happy's behavioral commitment to writing and maintaining the data files.*

### Data Files Happy Must Write

| File | When | Notes |
|------|------|-------|
| `mission-control/blocker.json` | Every blocker/decision surfacing | Never delete items; mark resolved |
| `activity-log.jsonl` | After every significant action | Append only; all agents write here |
| `projects-index.json` | Every heartbeat | Full regeneration by scanning `memory/projects/*/summary.md` |
| `mission-control/agents-registry.json` | When agent team changes | List of all registered agents + roles |
| `mission-control/task-queue.json` | Written by dashboard (via gateway write API) | Happy reads + processes; marks items done |

### task-queue.json Processing

Happy must poll `task-queue.json` on every heartbeat. For each item with `status: "queued"`:
1. Read task description and `agentId`
2. If `agentId == "happy"`: execute immediately
3. If `agentId` is another agent: dispatch via subagent spawn
4. Mark item `status: "processing"` immediately; `status: "done"` on completion

### Happy's Behavioral Commitment (starts today)
- [ ] Write to `blocker.json` on every blocker/decision surfacing
- [ ] Append to `activity-log.jsonl` after every significant action
- [ ] Regenerate `projects-index.json` on every heartbeat
- [ ] Poll `task-queue.json` on every heartbeat; process queued tasks
- [ ] Maintain `agents-registry.json` when agent team changes

---

## 11. DevOps & Infrastructure Specification

### What DevOps Must Deliver

1. **Gateway static file serving** — Confirm directory path for the HTML file at `/mission-control`
2. **Gateway file read API** — Confirm exact URL pattern for workspace file reads (needed by Frontend)
3. **Gateway file write API** — Confirm exact URL pattern + method for workspace file writes (needed for action buttons)
4. **Tailscale binding** — Confirm gateway listens on Tailscale IP (not only 127.0.0.1); configure if needed
5. **Remote URL** — Document the exact Tailscale URL for R's device access in `outputs/BUILD_STATUS.md`
6. **Deploy** — Place `index.html` at confirmed static serve path; verify `/mission-control` returns 200 on both local and Tailscale URLs

### Environment Requirements

| Variable | Local | Tailscale |
|----------|-------|-----------|
| Gateway URL | `http://127.0.0.1:18789` | `http://<tailscale-ip>:18789` |
| Auth | Gateway token | Gateway token (same) |

### Definition of Done (DevOps)

- [ ] Static serve path confirmed in `outputs/BUILD_STATUS.md`
- [ ] File read API URL confirmed + tested with `blocker.json`
- [ ] File write API URL confirmed + tested (write then read-back)
- [ ] Gateway confirmed listening on Tailscale IP
- [ ] Remote URL tested from a non-Mac device on Tailscale
- [ ] `/mission-control` returns 200 on both local and Tailscale URLs

---

## 12. QA & Test Plan

### Test Scope

| Feature | Test Types | Priority |
|---------|------------|----------|
| Attention Bar — read states | Manual functional | P0 |
| Attention Bar — action buttons (Approve/Reject/Dispatch) | Manual functional + write verification | P0 |
| Agent Status — N agents (1, 5, 15) | Manual functional | P0 |
| Agent Status — Quick Dispatch | Manual functional | P0 |
| Projects Panel — all states + agent-native badge | Manual functional | P0 |
| Activity Feed — all states + agent filter | Manual functional | P0 |
| Tailscale access + mobile layout | Manual on mobile device | P0 |
| 30s/60s auto-refresh | Manual timing | P0 |
| Error states (file unavailable) | Manual | P1 |
| Dashboard load time (local < 1s, Tailscale < 3s) | Browser DevTools | P1 |
| Markdown rendering in drawers | Manual visual | P1 |
| Touch targets (≥ 44px) on mobile | Manual/DevTools | P1 |

### Definition of Done (QA)

- [ ] All P0 ACs have a passing manual test
- [ ] All P1 ACs have a passing manual test
- [ ] Approve/Reject/Dispatch tested with write verification (read back `blocker.json` and `task-queue.json`)
- [ ] N-agent layout tested with 15-agent test data file
- [ ] Tailscale remote access tested on a non-Mac device
- [ ] Mobile layout tested at 768px viewport
- [ ] Auto-refresh timing verified for 30s and 60s intervals
- [ ] QA sign-off recorded in `outputs/BUILD_STATUS.md`

---

## 13. Cross-Role Dependencies

| Dependency | Blocking Role | Blocked Role | Resolution |
|------------|--------------|--------------|------------|
| Gateway static serve path + file read API URL | DevOps | Frontend | DevOps confirms in BUILD_STATUS.md |
| Gateway file write API URL + method | DevOps | Frontend (action buttons) | DevOps confirms before Frontend builds write calls |
| Tailscale IP + gateway binding confirmed | DevOps | QA (Tailscale test) | DevOps delivers before QA phase |
| `blocker.json` with real data | Happy (behavior) | QA | Happy starts writing today |
| `activity-log.jsonl` with real data | Happy (behavior) | QA | Happy starts writing today |
| `projects-index.json` + `agents-registry.json` | Happy (behavior) | QA | Happy creates both today |
| `task-queue.json` processing in Happy | Happy (behavior) | QA (dispatch test) | Happy implements polling before QA |

### Recommended Build Order

1. **Day 1 — Foundation:**
   - Happy: start writing all 5 data files immediately (blocker.json, activity-log.jsonl, projects-index.json, agents-registry.json, task-queue.json)
   - DevOps: confirm all gateway endpoints (read + write + Tailscale); document in BUILD_STATUS.md

2. **Days 1–3 — Build:**
   - Frontend: build all panels + action buttons + mobile layout using confirmed paths
   - QA: prepare test data files and test checklist

3. **Days 3–4 — Deploy & Test:**
   - DevOps: deploy `index.html`; confirm local + Tailscale URLs
   - QA: run full test checklist; Tailscale mobile test

4. **Day 4–5 — Sign-off:**
   - QA: all P0 ACs passing → sign off
   - R: open Mission Control on phone via Tailscale; confirm 2-minute morning review target met

---

## 14. Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Exact gateway static file serve directory path | DevOps | Open |
| Exact gateway file read API URL pattern | DevOps | Open |
| Exact gateway file write API URL + method | DevOps | Open |
| Does gateway currently bind to Tailscale IP? | DevOps | Open |
| Light or dark theme preference | R | **Default: light — confirm or override** |
| What is R's Tailscale IP for documentation? | R/DevOps | Open |
| Should done projects ever be visible (toggle)? | R | Deferred Phase 2 |

---

## 15. Timeline & Milestones

| Phase | Goal | Target | Owner |
|-------|------|--------|-------|
| Data files live | Happy writing all 5 data files | Today | Happy |
| DevOps foundation | All gateway endpoints confirmed + Tailscale binding confirmed | Day 1 | DevOps |
| Frontend build | All panels + action buttons + mobile layout complete | Days 1–3 | Frontend |
| Deploy + test | Dashboard live at local + Tailscale URLs; all P0 ACs passing | Day 4 | DevOps + QA |
| R sign-off | Morning review on mobile via Tailscale in < 2 minutes | Day 5 | R |

---

## Appendix: Data Contracts

### blocker.json

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
    "status": "open | resolved | snoozed | dispatched",
    "recommendation": "<Happy's suggested next action>",
    "resolution": "approved | rejected | dispatched | null",
    "rejectionReason": "<optional>",
    "resolvedAt": "<ISO8601 or omit>"
  }]
}
```

### activity-log.jsonl (one object per line)

```json
{"ts":"<ISO8601>","agent":"happy","type":"<event_type>","project":"<id or null>","summary":"<max 120 chars>","level":"info | warn | error | success"}
```

### projects-index.json

```json
{
  "version": "1",
  "generatedAt": "<ISO8601>",
  "projects": [{
    "id": "<folder name>",
    "name": "<display name>",
    "type": "standard | agent-native",
    "status": "active | needs_decision | blocked | paused | done",
    "ownerAgent": "happy",
    "phase": "<current phase string>",
    "lastUpdated": "<ISO8601>",
    "blockerIds": ["blocker-001"],
    "summaryPath": "memory/projects/<id>/summary.md"
  }]
}
```

### agents-registry.json

```json
{
  "version": "1",
  "lastUpdated": "<ISO8601>",
  "agents": [{
    "id": "happy",
    "name": "Happy",
    "role": "Chief of Staff",
    "model": "claude-sonnet-4-6",
    "status": "active | idle | retired",
    "addedAt": "<ISO8601>"
  }]
}
```

### task-queue.json

```json
{
  "version": "1",
  "lastUpdated": "<ISO8601>",
  "tasks": [{
    "id": "task-001",
    "agentId": "happy",
    "description": "<task description as written by R>",
    "priority": "critical | high | medium | low",
    "createdAt": "<ISO8601>",
    "createdBy": "R",
    "status": "queued | processing | done | failed",
    "startedAt": "<ISO8601 or omit>",
    "completedAt": "<ISO8601 or omit>",
    "blockerRef": "<blocker id if spawned from Attention Bar, or null>"
  }]
}
```

---

*PRD v2.0 — awaiting R final approval before build begins.*
