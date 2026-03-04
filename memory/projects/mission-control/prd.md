# Mission Control — Product Requirements Document

*Written by Happy · 2026-03-03 · Status: Draft — Pending R Approval*

---

## 1. Problem Statement

Right now, running this operation means holding everything in R's head: which agent is doing what, which project is blocked, what decisions are sitting idle waiting for input, and what happened while R was offline. The daily notes and MEMORY.md are good for memory but terrible for situational awareness — they require reading, not scanning. Every morning review is a archaeological dig through markdown files. Every time R wants to know "is anything on fire?", there's no single place to look. As the agent team grows beyond Happy to include a Content Agent, Dev Agent, and eventually Finance, this problem compounds: there'll be a dozen parallel threads, and the only way to track them is to already know what to look for. Mission Control solves this by giving R a live ops dashboard — one surface that shows everything running, everything blocked, and everything waiting for a decision, without R having to go digging.

---

## 2. North Star

**In 90 days, R's morning review takes under 2 minutes because Mission Control shows exactly what needs attention, what's progressing on its own, and what to approve — without opening a single file.**

---

## 3. User Stories

1. **As R, I want to see every active agent's current status at a glance** so that I know what's running, what's idle, and what's broken without asking Happy to update me.

2. **As R, I want a top-of-screen alert banner that shows only things requiring my input** so that I can immediately triage decisions and approvals without scanning the full dashboard.

3. **As R, I want to see every active project's current status and owner agent** so that I know which threads are moving and which have stalled — without reading individual project files.

4. **As R, I want a live activity feed showing what all agents did in the last 24 hours** so that I have a CEO-level view of the operation without sitting in on agent runs.

5. **As R, I want to click on a blocker or pending decision and see the full context inline** so that I can approve, reject, or unblock without switching to another app or file.

6. **As R, I want to see what's scheduled to run (crons) and when** so that I know what's happening automatically and can kill a job if something's about to go wrong.

7. **As R, I want the dashboard to open with a single click and always show live data** so that it's actually used — not something I have to remember to refresh or navigate to.

---

## 4. Panels / UI Sections

### Layout (Desktop — OpenClaw Canvas)

```
┌──────────────────────────────────────────────────────────────────────┐
│  🚨  NEEDS YOU NOW: [2 items]  ·  [Pending Decision] [Blocker]       │  ← Attention Bar
├───────────────────┬──────────────────────┬───────────────────────────┤
│  AGENTS           │  PROJECTS            │  ACTIVITY FEED            │
│  ─────────        │  ─────────           │  ────────────────         │
│  Happy (CoS)      │  Mission Control     │  14:22  Happy: research   │
│  🟢 Running       │  🟡 PRD pending R    │          complete         │
│  Last: wrote PRD  │                      │  14:18  Dev: PR opened    │
│                   │  Athens Meetup       │  14:05  Content: blocked  │
│  Content Agent    │  🟢 In Progress      │  13:55  Happy: cron ran   │
│  🟡 Idle          │                      │                           │
│  Last: draft sent │  Agent Affiliates    │                           │
│                   │  🟡 Research done    │                           │
│  Dev Agent        │                      │                           │
│  🔴 Blocked       │  Agent Trust         │                           │
│  Last: PR review  │  🔴 Blocked          │                           │
├───────────────────┴──────────────────────┴───────────────────────────┤
│  CRON JOBS                    │  CHANNELS                            │
│  ───────────                  │  ─────────                           │
│  Nightly review  · 20:00      │  Telegram       🟢 Connected         │
│  Last: ✅ 2026-03-02          │  Discord        🟢 Connected         │
│  Next: 20:00 today            │  Email          🟢 Connected         │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Panel Specs

#### Panel 1: Attention Bar (Top — P0)
**What it shows:** Items explicitly requiring R's input right now — pending decisions, blocked agents, required approvals. Zero items = green bar ("All clear"). Any items = red banner with count and inline chips.

**Behavior:** Clicking a chip expands a drawer below the bar showing full context (what's blocked, why, what Happy recommends). Action buttons inline: Approve / Reject / Snooze.

**Data source:** `memory/projects/mission-control/blocker.json` — Happy writes this file whenever a blocker or pending decision is surfaced. Polled on page load + every 30 seconds.

---

#### Panel 2: Agent Status (Left column — P0)
**What it shows:** One card per agent. Fields: name, role, status emoji (🟢 Running / 🟡 Idle / 🔴 Blocked / ❌ Error), last action (1 line, truncated at 80 chars), last active timestamp (relative: "3 min ago").

**Behavior:** Clicking a card opens a slide-out panel with recent activity from `activity-log.jsonl` filtered to that agent. No full transcript — just the last 10 events.

**Data source:**
- Agent list + session status: OpenClaw `sessions.list` WebSocket API (real-time via WS)
- Last action + timestamps: `memory/activity-log.jsonl` — Happy (and future agents) append structured events here after each significant action
- Status override: `blocker.json` agent status fields (if Happy has explicitly set an agent to Blocked, this takes priority over `sessions.list`)

---

#### Panel 3: Projects (Center column — P0)
**What it shows:** One card per active project from `memory/projects/`. Fields: project name, status badge (🟢 Active / 🟡 Needs Decision / 🔴 Blocked / ✅ Done), owner agent, last updated (relative timestamp).

**Behavior:** Clicking a card opens a drawer showing the project `summary.md` rendered as markdown — no need to leave the dashboard. Link to full project folder for deep dive.

**Data source:** `memory/projects/mission-control/projects-index.json` — Happy regenerates this on each heartbeat by scanning `memory/projects/*/summary.md` and extracting status, owner, and last modified date. Dashboard polls this file every 60 seconds.

---

#### Panel 4: Activity Feed (Right column — P0)
**What it shows:** Chronological list of agent events, newest first, last 24 hours. Format per row: `[relative time] [agent name]: [1-line description]`. Scrollable. Color-coded by type: info (grey), decision needed (amber), error (red), completion (green).

**Data source:** `memory/activity-log.jsonl` — one JSON object per line, appended by Happy (and future agents) in real time. Dashboard reads tail of this file, updates every 30 seconds.

---

#### Panel 5: Cron Jobs (Bottom left — P1)
**What it shows:** All scheduled jobs. Fields: job name, schedule (human-readable: "Daily at 20:00"), last run timestamp + result (✅/❌), next run time.

**Data source:** OpenClaw `cron.*` WebSocket API (already surfaced in Control UI — low lift to wire up).

---

#### Panel 6: Channel Health (Bottom right — P1)
**What it shows:** Status of each connected channel: Telegram, Discord, AgentMail (Email), X/Twitter. One row each with 🟢/🔴 indicator and "last message" timestamp.

**Data source:** OpenClaw `channels.status` WebSocket API (already exists in Control UI).

---

## 5. Data Contracts

### 5.1 `blocker.json`

**Location:** `memory/projects/mission-control/blocker.json`
**Writer:** Happy (and future agents, with Happy as arbiter)
**Purpose:** Surfaces active blockers and pending decisions for the Attention Bar. Happy must write to this file whenever work stops or R's input is needed.

```json
{
  "version": "1",
  "lastUpdated": "2026-03-03T14:22:00Z",
  "items": [
    {
      "id": "blocker-001",
      "type": "pending_decision",
      "priority": "high",
      "title": "Approve Mission Control PRD",
      "description": "PRD is complete and ready for R's review before build begins.",
      "agentId": "happy",
      "projectId": "mission-control",
      "createdAt": "2026-03-03T13:00:00Z",
      "status": "open",
      "recommendation": "Approve and unblock Phase 1 build."
    },
    {
      "id": "blocker-002",
      "type": "blocker",
      "priority": "medium",
      "title": "Brave Search API key needed",
      "description": "Agent Trust Research is paused — Brave Search API returns 403. R needs to provision a key.",
      "agentId": "happy",
      "projectId": "agent-trust-research",
      "createdAt": "2026-03-02T10:00:00Z",
      "status": "open",
      "recommendation": "Set BRAVE_API_KEY in OpenClaw config."
    }
  ]
}
```

**Field definitions:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID, format: `blocker-NNN` or `decision-NNN` |
| `type` | enum | `blocker` \| `pending_decision` \| `approval_required` |
| `priority` | enum | `critical` \| `high` \| `medium` \| `low` |
| `title` | string | 1-line summary (shown in Attention Bar chip) |
| `description` | string | Full context (shown in expanded drawer) |
| `agentId` | string | Which agent raised this |
| `projectId` | string | Which project this belongs to (matches `memory/projects/<id>/`) |
| `createdAt` | ISO 8601 | When the blocker was created |
| `status` | enum | `open` \| `resolved` \| `snoozed` |
| `recommendation` | string | Happy's suggested next action for R |
| `resolvedAt` | ISO 8601 | Optional — when resolved |

**Convention:** Happy must set `status: resolved` (not delete the item) when a blocker is cleared. The dashboard only shows `open` items. Resolved items stay in the file for history.

---

### 5.2 `activity-log.jsonl`

**Location:** `memory/activity-log.jsonl`
**Writer:** Happy (initially); all agents append as they come online
**Purpose:** Single cross-agent event stream for the Activity Feed panel. One JSON object per line.

```jsonl
{"ts":"2026-03-03T14:22:00Z","agent":"happy","type":"research_complete","project":"mission-control","summary":"Research report written — Canvas is WKWebView, gateway route is the cleanest build target.","level":"info"}
{"ts":"2026-03-03T14:05:00Z","agent":"content-agent","type":"blocker_raised","project":"content-ops","summary":"Draft complete but blocked — waiting for R approval before publishing.","level":"warn"}
{"ts":"2026-03-03T13:55:00Z","agent":"happy","type":"cron_ran","project":null,"summary":"Nightly review cron completed. No urgent items.","level":"info"}
{"ts":"2026-03-03T13:30:00Z","agent":"dev-agent","type":"pr_opened","project":"website","summary":"PR #12 opened: 'Fix mobile nav layout'. Ready for review.","level":"info"}
```

**Field definitions:**
| Field | Type | Description |
|-------|------|-------------|
| `ts` | ISO 8601 | Event timestamp |
| `agent` | string | Agent identifier (e.g., `happy`, `content-agent`, `dev-agent`) |
| `type` | string | Event type — see taxonomy below |
| `project` | string \| null | Project ID if scoped to a project; null for system events |
| `summary` | string | 1-line human-readable description (shown in feed, max 120 chars) |
| `level` | enum | `info` \| `warn` \| `error` \| `success` |

**Event type taxonomy (extensible):**
- `research_complete` — research phase done
- `blocker_raised` — agent flagged a blocker
- `blocker_resolved` — blocker cleared
- `decision_requested` — R's input needed
- `decision_received` — R responded
- `task_started` — agent began a task
- `task_complete` — task finished
- `pr_opened` — code PR opened
- `cron_ran` — scheduled job completed
- `approval_pending` — gated action queued for R
- `approval_granted` — R approved a gated action
- `error` — agent encountered an error

**Retention:** Keep last 7 days inline. Archive older entries to `memory/archives/activity-log-YYYY-MM.jsonl` during heartbeat maintenance.

---

### 5.3 `projects-index.json`

**Location:** `memory/projects/mission-control/projects-index.json`

> ⚠️ **Note on naming:** This file is generated data for Mission Control's use. Placing it inside the `mission-control/` subfolder is fine for Phase 1. If/when other tools need it, move to `memory/projects-index.json` at the top of PARA.

**Writer:** Happy, regenerated on each heartbeat by scanning `memory/projects/*/summary.md`
**Purpose:** Pre-parsed project list for the Projects panel. Avoids the dashboard having to read raw markdown at query time.

```json
{
  "version": "1",
  "generatedAt": "2026-03-03T14:00:00Z",
  "projects": [
    {
      "id": "mission-control",
      "name": "Mission Control Dashboard",
      "status": "needs_decision",
      "ownerAgent": "happy",
      "phase": "PRD Review",
      "lastUpdated": "2026-03-03T13:00:00Z",
      "blockerIds": ["decision-001"],
      "summaryPath": "memory/projects/mission-control/summary.md"
    },
    {
      "id": "athens-openclaw-meetup",
      "name": "Athens OpenClaw Meetup",
      "status": "active",
      "ownerAgent": "happy",
      "phase": "Promotion",
      "lastUpdated": "2026-03-03T12:00:00Z",
      "blockerIds": [],
      "summaryPath": "memory/projects/athens-openclaw-meetup/summary.md"
    },
    {
      "id": "agent-trust-research",
      "name": "Agent Trust Research",
      "status": "blocked",
      "ownerAgent": "happy",
      "phase": "Research",
      "lastUpdated": "2026-03-02T10:00:00Z",
      "blockerIds": ["blocker-002"],
      "summaryPath": "memory/projects/agent-trust-research/summary.md"
    }
  ]
}
```

**Status enum:**
| Value | Meaning |
|-------|---------|
| `active` | Work progressing, no blocker |
| `needs_decision` | Waiting on R to decide something |
| `blocked` | Blocked by external dependency |
| `paused` | Intentionally paused (deprioritized) |
| `done` | Complete — move to archives |

**Happy's generation logic (heartbeat routine):**
1. List all dirs in `memory/projects/`
2. For each, read `summary.md` (first 20 lines) and extract: status line, last git-modified timestamp
3. Cross-reference with `blocker.json` to attach `blockerIds`
4. Write `projects-index.json`

---

## 6. Build Phases

### Phase 1 — MVP (Target: 1 week)

**Goal:** R can open Mission Control and immediately see what needs attention, what's running, and what happened today. No configuration required.

**Scope:**
- [ ] **Happy behavioral changes** (prerequisite — no UI without this):
  - Start writing `blocker.json` on every blocker/decision surfacing (TODAY — not waiting for UI)
  - Start appending to `activity-log.jsonl` after each significant action (TODAY)
  - Add heartbeat routine to regenerate `projects-index.json`
- [ ] **Static HTML dashboard** served as gateway route `/mission-control`
  - Attention Bar: reads `blocker.json`, shows open items, click-to-expand
  - Agent Status: reads `activity-log.jsonl` + `sessions.list` WS
  - Projects Panel: reads `projects-index.json`, renders cards
  - Activity Feed: reads `activity-log.jsonl`, last 24h, live poll every 30s
- [ ] **Canvas integration:** Happy navigates Canvas to `http://127.0.0.1:18789/mission-control` on demand or via a command from R
- [ ] **Tech stack:** Plain HTML + vanilla JS + CSS Grid (no build pipeline required for Phase 1). Fetch + setInterval for polling. Gateway serves it as a static route.

**Not in Phase 1:**
- Cron Jobs panel (needs gateway WS integration)
- Channels Health panel (needs gateway WS integration)
- Action buttons in the drawer (resolve/approve inline)
- Historical view

**Success criteria:** R opens Mission Control in the morning and it shows current state without asking Happy for a status update.

---

### Phase 2 — Enhancements (Target: 4 weeks post-MVP)

**Goal:** Mission Control becomes the real-time nerve center with live WS data, inline actions, and multi-view support.

**Scope:**
- [ ] **React migration** — replace polling with WebSocket connections to gateway for real-time updates (no more 30s lag)
- [ ] **Cron Jobs panel** — wire up `cron.*` WS API
- [ ] **Channels Health panel** — wire up `channels.status` WS API
- [ ] **Inline actions in Attention Bar** — Approve / Reject / Snooze buttons that call back to gateway to trigger agent actions
- [ ] **Agent detail drawer** — clicking an agent card shows last 10 activity log entries inline
- [ ] **Project detail drawer** — clicking a project renders its `summary.md` as markdown inline
- [ ] **Cost Meter panel** — show token/$ spent today per agent from session data
- [ ] **Historical toggle** — switch Activity Feed from "last 24h" to "last 7 days"
- [ ] **Mobile-accessible** — gateway exposed via Tailscale so R can check status from phone (auth required)
- [ ] **Subagent visibility** — surface running subagents via `subagents list` WS command if API is available

---

## 7. Open Questions

**Decisions R needs to make before or during Phase 1:**

1. **📋 DECISION: When should Happy start writing the data files?**
   The MVP UI is useless without `blocker.json` and `activity-log.jsonl` being populated. Happy can start writing these TODAY, before any UI is built. This is a behavioral change — it means every blocker Happy surfaces in chat should also be written to `blocker.json`. Recommend: approve this immediately, ship the data contract today. The dashboard will have real data when it's ready.

2. **📋 DECISION: Build it yourself or review first?**
   Phase 1 requires `npm install` for the gateway route setup (or can be done with zero dependencies as a pure static HTML file served from the workspace). If R wants Happy to avoid any npm install for the dashboard itself, Pure HTML/vanilla JS is the safe path — no security review needed. Recommend: pure HTML for Phase 1, React for Phase 2 after security review. Confirm?

3. **📋 DECISION: Where does the dashboard file live?**
   Two options:
   - **Option A (clean):** Gateway serves it from a built-in route — Happy writes the HTML file to a specific gateway directory and the gateway picks it up. No canvas file pollution.
   - **Option B (simpler):** Happy writes `index.html` to the Canvas directory and opens it as a `file://` URL. Works but no WebSocket access to gateway data from file:// context.
   Recommend: Option A (gateway route). But needs R to confirm the gateway's static file serving capability — research report infers this is possible but didn't confirm the exact directory path. Happy will investigate before building.

4. **📋 DECISION: What's the refresh/update trigger?**
   Phase 1 uses polling (every 30s). Real-time would need WebSocket. For an ops dashboard, 30s lag is probably fine. But if R expects "real-time" (e.g., to monitor a live agent run), polling may feel slow. Confirm: 30s polling is acceptable for MVP?

5. **📋 DECISION: Should `projects-index.json` live inside `mission-control/` or at `memory/` root?**
   Currently spec'd at `memory/projects/mission-control/projects-index.json` for simplicity. If other tools (future agents, cron jobs) need to read the project index, it should move to `memory/projects-index.json`. This is a low-stakes naming decision but worth aligning on now before the habit forms. Recommend: `memory/projects-index.json` (top-level) for reusability.

---

## Appendix: Key Technical Decisions (Already Made by Research)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Delivery mechanism | Gateway HTTP route `/mission-control` | Live WS access; no file:// restrictions; Canvas can navigate there |
| Phase 1 stack | Pure HTML + vanilla JS | No build pipeline; no npm install; fastest path to working dashboard |
| Phase 2 stack | React (bundled) | Real-time WS; better component model for growing panels |
| Data update model | Happy writes JSON files; dashboard polls | Decoupled; Happy already has file write access; no new permissions needed |
| Auth | Gateway token auth (existing) | Already in place; no new auth surface |
| Canvas integration | `canvas navigate` to gateway URL | One command from Happy; R gets the panel instantly |

---

*PRD complete. Waiting for R's decisions on the 5 open questions above before Phase 1 build begins.*

---

## R's Clarification Answers — 2026-03-04 14:31 EET

**Q1 — Control level:**
**(c) Full agent control** — Mission Control is a project management tool; sending tasks back to agents is crucial for efficiency. Not just a viewer — it's an operator.

**Q2 — Access/deployment:**
**(b) Remote via Tailscale** — accessible on R's personal devices anywhere. Not limited to local Mac/Canvas. Must be served over Tailscale and work on mobile.

**Q3 — Product types being built:**
**Mix** — will build a range of products including **agent-native products**. Mission Control must be designed to serve this broader context, not just one product type.

**Q4 — Permanence:**
**Permanent (for now)** — Mission Control is not a temporary/phase-scoped tool. Design for longevity.

**Q5 — Scale:**
**Multi-agent from day one** — multiple agents running simultaneously is a near-term reality. Account for this in data model, UI layout, and activity feed capacity. Don't optimize only for Happy.

---

*Answers provided by R on 2026-03-04 at 14:31 EET via webchat.*
