# Mission Control Dashboard — PRD
*Author: Happy | Date: 2026-03-03 | Status: Ready to Build*

---

## 1. Overview + Goals

Mission Control is a real-time operator dashboard served from the OpenClaw Gateway at `/mission-control` and displayed in the Canvas panel (WKWebView). It gives R a single pane of glass to answer three questions at any moment: **What's running?** **What's blocked?** **What needs me right now?** The dashboard is not a debugger — no token traces, no LLM internals. It is a management surface: project status in Kanban columns, agent status cards, a live activity feed, and a top-priority attention bar for blockers and pending decisions. Happy is responsible for keeping three structured data files current (`projects-index.json`, `blocker.json`, `activity-log.jsonl`); the dashboard reads them on a 15-second polling loop with no external API calls, no authentication beyond the local gateway, and no dependencies on internet connectivity.

---

## 2. Data Contracts

All three files live at: `~/openclaw-workspace/projects/mission-control/data/`

Happy writes these files. The dashboard reads them. No other process touches them.

---

### 2.1 `projects-index.json`

One entry per active or recently-completed project. Happy regenerates this file on every heartbeat by scanning `memory/projects/*/summary.md`.

```json
{
  "$schema": "projects-index/v1",
  "generated_at": "2026-03-03T12:00:00Z",
  "projects": [
    {
      "id": "mission-control",
      "name": "Mission Control Dashboard",
      "status": "in_progress",
      "owner_agent": "happy",
      "priority": "p0",
      "phase": "build",
      "last_updated": "2026-03-03T11:45:00Z",
      "summary": "Real-time ops dashboard for R. Research done, building today.",
      "tags": ["infra", "tooling"],
      "next_action": "Build the React bundle and gateway route",
      "blocker_ids": [],
      "links": {
        "memory": "memory/projects/mission-control/summary.md",
        "prd": "projects/mission-control/PRD.md"
      }
    }
  ]
}
```

**Field rules:**
- `id`: kebab-case, unique, stable across updates
- `status`: one of `"backlog"` | `"in_progress"` | `"blocked"` | `"needs_decision"` | `"done"` | `"archived"`
- `owner_agent`: `"happy"` | `"dev-agent"` | `"content-agent"` | `"unassigned"`
- `priority`: `"p0"` | `"p1"` | `"p2"` | `"none"`
- `phase`: free-form short string — e.g. `"research"`, `"build"`, `"review"`, `"shipped"`
- `last_updated`: ISO 8601 UTC
- `summary`: max 160 chars, no markdown
- `next_action`: max 120 chars, imperative sentence — what happens next
- `blocker_ids`: array of `id` strings from `blocker.json`; empty array if none
- `links`: optional dict of label → workspace-relative path or URL

---

### 2.2 `blocker.json`

All active blockers and pending decisions. Happy writes a new entry any time a gate action is queued, a subagent is stalled, or a decision is needed. Happy marks items resolved when cleared.

```json
{
  "$schema": "blockers/v1",
  "generated_at": "2026-03-03T12:00:00Z",
  "items": [
    {
      "id": "blk-001",
      "type": "pending_decision",
      "severity": "high",
      "title": "Approve npm install for Vite build toolchain",
      "detail": "Building the React bundle requires Vite + React. Security review passed (see /tmp/sec-review-vite.md). Awaiting R approval to proceed.",
      "project_id": "mission-control",
      "agent": "happy",
      "raised_at": "2026-03-03T11:50:00Z",
      "resolved_at": null,
      "resolved": false,
      "action_required": "R must approve: yes/no in Telegram",
      "context_path": "memory/projects/mission-control/research-report.md"
    }
  ]
}
```

**Field rules:**
- `id`: `blk-NNN` format, monotonically incrementing, never reused
- `type`: one of `"pending_decision"` | `"approval_gate"` | `"agent_blocked"` | `"external_dependency"` | `"error"`
- `severity`: `"critical"` | `"high"` | `"medium"` | `"low"`
- `title`: max 80 chars — the one-liner R sees in the attention bar
- `detail`: max 500 chars — enough context for R to decide without opening another file
- `project_id`: must match an `id` in `projects-index.json`, or `null` for cross-project blockers
- `agent`: which agent raised it
- `raised_at` / `resolved_at`: ISO 8601 UTC; `resolved_at` is `null` until cleared
- `resolved`: boolean — `false` = active, `true` = archived (keep in file for 24h, then remove)
- `action_required`: max 120 chars — exactly what R needs to do
- `context_path`: workspace-relative path to file with more context, or `null`

---

### 2.3 `activity-log.jsonl`

Append-only event stream. Each line is a self-contained JSON object. Happy appends an entry after every significant action. The dashboard reads the last 200 lines.

```jsonl
{"ts":"2026-03-03T12:01:00Z","agent":"happy","project_id":"mission-control","event":"task_complete","message":"Research report written to memory/projects/mission-control/research-report.md","level":"info"}
{"ts":"2026-03-03T12:02:00Z","agent":"happy","project_id":"mission-control","event":"blocker_raised","message":"Awaiting R approval for Vite install (blk-001)","level":"warn"}
{"ts":"2026-03-03T12:05:00Z","agent":"happy","project_id":null,"event":"heartbeat","message":"Heartbeat ran — no urgent items","level":"debug"}
```

**Field rules (per line):**
- `ts`: ISO 8601 UTC — required
- `agent`: agent name — required
- `project_id`: matches `projects-index.json` id, or `null` for system-wide events
- `event`: one of `"task_start"` | `"task_complete"` | `"blocker_raised"` | `"blocker_resolved"` | `"decision_made"` | `"heartbeat"` | `"error"` | `"agent_spawned"` | `"agent_done"` | `"note"`
- `message`: max 200 chars — human-readable, present tense
- `level`: `"debug"` | `"info"` | `"warn"` | `"error"` — dashboard filters out `debug` by default

**Retention:** Happy trims the file to 1,000 lines max on each heartbeat (keep newest). The dashboard only ever reads the last 200.

---

## 3. UI Spec

### 3.1 Overall Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  🔴 NEEDS YOU  [2]  blk-001: Approve Vite install · blk-002: ... │  ← Attention Bar
├──────────────────────────────────────────────────────────────────┤
│  Mission Control                          🟢 Live  03 Mar 12:01  │  ← Header
├───────────────────────┬──────────────────────────────────────────┤
│  PROJECTS             │  ACTIVITY FEED                           │
│  (Kanban columns)     │  (scrollable, newest-first)              │
│                       │                                          │
│  [col] [col] [col]    │  12:05 happy › heartbeat ran             │
│                       │  12:02 happy › blocker raised blk-001    │
│                       │  12:01 happy › research report written   │
└───────────────────────┴──────────────────────────────────────────┘
```

**Proportions (desktop, ~1200px wide):**
- Left panel (Projects): 65% width
- Right panel (Activity Feed): 35% width
- Attention Bar: full width, collapsible

---

### 3.2 Attention Bar

- **Location:** Top of page, full width, always visible
- **Background:** `#3d1a1a` (dark red) if any active blockers; `#1a2a1a` (dark green) if zero
- **Content when active:**
  - Left: 🔴 **NEEDS YOU** `[N]` — bold, white text
  - Right: scrolling ticker of blocker titles — clicking any stops scroll and highlights that item
  - Each blocker shown as: `blk-NNN · [title] · [action_required]`
- **Content when clear:**
  - Left: ✅ **All clear** — subdued green text
- **Clicking a blocker item:**
  - Opens a modal overlay with full `detail`, `action_required`, and `context_path` (rendered as a clickable workspace link)
- **Data source:** `blocker.json` → items where `resolved === false`

---

### 3.3 Projects Panel (Kanban)

**Columns** — fixed order, always rendered even if empty:

| Column Header | Status Values | Accent Color |
|---|---|---|
| BACKLOG | `backlog` | `#444` |
| IN PROGRESS | `in_progress` | `#1a6bb5` |
| BLOCKED | `blocked`, `needs_decision` | `#b54a1a` |
| DONE | `done` | `#1a7a3a` |

**Project Card** (one per project):
```
┌──────────────────────────────┐
│  Mission Control    [P0] 🔵  │  ← name + priority badge + status dot
│  happy · build               │  ← owner_agent · phase
│  Build the React bundle...   │  ← next_action (truncated to 1 line)
│  ⚠ 1 blocker                 │  ← shown only if blocker_ids.length > 0
│  Updated 11m ago             │  ← relative time from last_updated
└──────────────────────────────┘
```

- **Status dot colors:** `in_progress` = blue, `blocked`/`needs_decision` = orange, `done` = green, `backlog` = grey, `archived` = hidden
- **Priority badge:** P0 = red pill, P1 = orange pill, P2 = grey pill, none = hidden
- **Card click:** expands an inline detail drawer below the card showing: full `summary`, all `links`, `tags`, and all active blockers from `blocker.json` matching this project's `id`
- **Sort within column:** P0 first, then by `last_updated` descending

---

### 3.4 Activity Feed

- **Location:** Right panel, full height, scrollable
- **Header:** "ACTIVITY FEED" + item count in last 24h
- **Default filter:** `level !== "debug"` (hides heartbeats and noise)
- **Toggle:** small button to show/hide debug entries
- **Entry format (one line per event):**
  ```
  [HH:MM]  [agent]  ›  [message]
  ```
  - Timestamp: local time, HH:MM only (hover shows full ISO timestamp)
  - Agent name: colored — happy=teal, dev-agent=purple, content-agent=amber, system=grey
  - Message: truncated to single line; hover or click shows full text
  - Event-type icons: ✅ task_complete, 🚧 task_start, 🔴 blocker_raised, ✅ blocker_resolved, ⚡ agent_spawned, ❌ error
- **Auto-scroll:** follows newest entry unless user has manually scrolled up (standard behavior)
- **Data source:** Last 200 lines of `activity-log.jsonl`, newest-first

---

### 3.5 Header Bar

```
  Mission Control                    🟢 Live   03 Mar 12:01   [↻ Refresh]
```

- **Left:** "Mission Control" wordmark (no logo needed)
- **Right:** live indicator dot (green = last poll <30s ago, yellow = 30-60s, red = >60s) + last-polled timestamp + manual refresh button
- **Height:** 48px

---

### 3.6 Visual Design System

**Color Palette:**
```
Background:      #0f0f0f
Surface:         #1a1a1a
Surface raised:  #242424
Border:          #2e2e2e
Text primary:    #f0f0f0
Text secondary:  #888888
Text muted:      #555555
Accent blue:     #1a6bb5
Accent orange:   #b54a1a
Accent green:    #1a7a3a
Accent red:      #b51a1a
Teal (happy):    #1ab5a0
Purple (dev):    #7b1ab5
Amber (content): #b5851a
```

**Typography:**
- Font stack: `'SF Mono', 'JetBrains Mono', 'Fira Code', monospace`
- Base size: 13px (dashboard-density, not reading-comfort)
- Headers: 11px uppercase letter-spaced labels
- Timestamps: 11px, muted

**Spacing:** 8px base unit. Cards: 12px padding. Columns: 16px gap.

**No animations except:** activity feed new-entry highlight fades from `#242424` to transparent over 2s.

---

## 4. Tech Spec

### 4.1 Architecture

```
┌──────────────────────────────────────────────────────┐
│  OpenClaw Canvas (WKWebView)                         │
│  navigates to → http://127.0.0.1:18789/mission-control│
└──────────────────────┬───────────────────────────────┘
                       │ HTTP GET
┌──────────────────────▼───────────────────────────────┐
│  OpenClaw Gateway (http://127.0.0.1:18789)           │
│  Static route: GET /mission-control → index.html     │
│  Data routes:  GET /mission-control/data/*.json      │
│                GET /mission-control/data/*.jsonl     │
└──────────────────────┬───────────────────────────────┘
                       │ reads files
┌──────────────────────▼───────────────────────────────┐
│  ~/openclaw-workspace/projects/mission-control/      │
│  ├── data/                                           │
│  │   ├── projects-index.json     (Happy writes)      │
│  │   ├── blocker.json            (Happy writes)      │
│  │   └── activity-log.jsonl     (Happy appends)      │
│  └── dist/                                           │
│      └── index.html              (build output)      │
└──────────────────────────────────────────────────────┘
```

**Key decision:** No WebSocket. The dashboard polls the three data files via HTTP GET every 15 seconds. This keeps the build simple and avoids any gateway WebSocket complexity. The "live" indicator shows staleness.

---

### 4.2 Gateway Static Route Registration

The Gateway must serve:

| Route | File Served | Method |
|---|---|---|
| `GET /mission-control` | `dist/index.html` | Static |
| `GET /mission-control/assets/*` | `dist/assets/*` | Static |
| `GET /mission-control/data/projects-index.json` | `data/projects-index.json` | Proxied read |
| `GET /mission-control/data/blocker.json` | `data/blocker.json` | Proxied read |
| `GET /mission-control/data/activity-log.jsonl` | `data/activity-log.jsonl` | Proxied read (last 200 lines) |

All routes are **local-only** — the Gateway only binds to `127.0.0.1:18789`. No external exposure.

The Gateway static plugin config (or equivalent) should point the root at:
`~/openclaw-workspace/projects/mission-control/dist/`

Data files are read directly from disk at request time — no caching layer needed at this scale.

---

### 4.3 Build Process

**Step 1 — Scaffold:**
```bash
cd ~/openclaw-workspace/projects/mission-control
npm create vite@latest dashboard -- --template react
cd dashboard
npm install
```

**Step 2 — Build output target:**
Edit `vite.config.js`:
```js
export default {
  base: '/mission-control/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
}
```

**Step 3 — Source structure:**
```
dashboard/
├── src/
│   ├── App.jsx               ← root layout
│   ├── components/
│   │   ├── AttentionBar.jsx
│   │   ├── ProjectsPanel.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── ActivityFeed.jsx
│   │   ├── ActivityEntry.jsx
│   │   ├── HeaderBar.jsx
│   │   └── BlockerModal.jsx
│   ├── hooks/
│   │   └── useDataPolling.js ← polls /mission-control/data/*.json every 15s
│   ├── utils/
│   │   └── time.js           ← relative timestamps, local formatting
│   └── styles.css            ← all CSS, no external stylesheets
└── index.html
```

**Step 4 — Build:**
```bash
cd dashboard && npm run build
# output → ../dist/index.html + ../dist/assets/*
```

**Step 5 — Register Gateway route** (Happy does this via gateway config or by placing files in the right location — see Build Plan task 6).

**Step 6 — Navigate Canvas:**
```
canvas action=navigate url=http://127.0.0.1:18789/mission-control
```

---

### 4.4 Data Polling Hook

`useDataPolling.js` — runs three concurrent fetches every 15 seconds:

```js
const DATA_BASE = '/mission-control/data';
const POLL_INTERVAL = 15_000;

export function useDataPolling() {
  const [projects, setProjects] = useState(null);
  const [blockers, setBlockers] = useState(null);
  const [activity, setActivity] = useState([]);
  const [lastPolled, setLastPolled] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function poll() {
      try {
        const [projRes, blkRes, actRes] = await Promise.all([
          fetch(`${DATA_BASE}/projects-index.json`),
          fetch(`${DATA_BASE}/blocker.json`),
          fetch(`${DATA_BASE}/activity-log.jsonl`),
        ]);
        const proj = await projRes.json();
        const blk = await blkRes.json();
        const actText = await actRes.text();
        const actLines = actText.trim().split('\n')
          .filter(Boolean)
          .map(l => JSON.parse(l))
          .slice(-200)
          .reverse(); // newest first

        setProjects(proj);
        setBlockers(blk);
        setActivity(actLines);
        setLastPolled(new Date());
        setError(null);
      } catch (e) {
        setError(e.message);
      }
    }

    poll(); // immediate on mount
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { projects, blockers, activity, lastPolled, error };
}
```

---

### 4.5 File Locations (Absolute Paths)

| Purpose | Path |
|---|---|
| Data directory | `~/openclaw-workspace/projects/mission-control/data/` |
| projects-index.json | `~/openclaw-workspace/projects/mission-control/data/projects-index.json` |
| blocker.json | `~/openclaw-workspace/projects/mission-control/data/blocker.json` |
| activity-log.jsonl | `~/openclaw-workspace/projects/mission-control/data/activity-log.jsonl` |
| Vite project source | `~/openclaw-workspace/projects/mission-control/dashboard/` |
| Build output | `~/openclaw-workspace/projects/mission-control/dist/` |
| PRD | `~/openclaw-workspace/projects/mission-control/PRD.md` |

---

### 4.6 Empty State Files (Initial Seeds)

Before the build, Happy creates these seed files so the dashboard renders on first load:

**`data/projects-index.json`** — minimal valid seed:
```json
{"$schema":"projects-index/v1","generated_at":"2026-03-03T12:00:00Z","projects":[]}
```

**`data/blocker.json`** — minimal valid seed:
```json
{"$schema":"blockers/v1","generated_at":"2026-03-03T12:00:00Z","items":[]}
```

**`data/activity-log.jsonl`** — first entry:
```jsonl
{"ts":"2026-03-03T12:00:00Z","agent":"happy","project_id":null,"event":"note","message":"Mission Control data files initialized","level":"info"}
```

---

## 5. Security Considerations

### 5.1 Local-Only Access
- The Gateway binds exclusively to `127.0.0.1:18789` — not `0.0.0.0`. The dashboard is never exposed to the network unless the user explicitly tunnels (e.g. Tailscale). No firewall rules needed; loopback-only is the default.
- No CORS headers needed — the dashboard and API are same-origin (`127.0.0.1:18789`).

### 5.2 No External Calls
- The dashboard HTML/JS bundle contains zero external fetches, CDN links, or remote font loads.
- Vite must be configured to **not** inject any CDN references. All React/ReactDOM code is bundled locally.
- `vite.config.js` must not include any `external` CDN config.
- Content-Security-Policy header (set by Gateway if configurable): `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';` — blocks any accidental external calls at the browser level.

### 5.3 XSS Prevention
- **All data from JSON files is treated as untrusted content.** Never use `dangerouslySetInnerHTML` anywhere in the codebase.
- All string fields (project names, blocker titles, activity messages) are rendered via React's text nodes only — React escapes these automatically.
- `message` fields in activity-log entries: render as plain text. No markdown parsing, no link detection, no HTML interpretation.
- `context_path` in blockers: rendered as a plain text label, never as an `href` without validation. Only paths matching `^[\w\-/\.]+$` and starting with a known prefix (`memory/`, `projects/`) are rendered as links.
- `detail` field in blockers: plain text, `<pre>` tag for whitespace preservation, no HTML.

### 5.4 Data Integrity
- If any fetch fails or returns invalid JSON, the dashboard shows the last-good data with a staleness indicator — it does not crash or render partial state.
- JSONL parse errors on individual lines: skip that line, log a console warning, continue rendering the rest.
- If `blocker.json` or `projects-index.json` is missing on first load: dashboard renders empty state (not an error screen).

### 5.5 No Auth
The gateway does not require authentication for local loopback access. This is acceptable because: (1) only processes on the same machine can reach `127.0.0.1`, (2) any local process can already read the workspace files directly, (3) adding auth would require Happy to store tokens somewhere, increasing attack surface. **If R ever wants remote access, this must be revisited before enabling any external routing.**

---

## 6. Build Plan

Ordered task list — Happy executes these sequentially today. Each task is completable in one agent turn.

**Task 1: Create data directory and seed files**
- Create `~/openclaw-workspace/projects/mission-control/data/`
- Write seed `projects-index.json`, `blocker.json`, `activity-log.jsonl`
- Validate JSON parses correctly
- ✅ Done when: `cat data/projects-index.json` outputs valid JSON

**Task 2: Security review for Vite + React install**
- Spawn security-review sub-agent per SOUL.md Rule 7
- Command to review: `npm create vite@latest dashboard -- --template react && cd dashboard && npm install`
- Wait for verdict
- ✅ Done when: security verdict received (APPROVED / CAUTION / BLOCK)
- 🚨 If BLOCK or CAUTION: surface to R before proceeding

**Task 3: Scaffold Vite + React project**
- Run `npm create vite@latest dashboard -- --template react` in `projects/mission-control/`
- Edit `vite.config.js`: set `base: '/mission-control/'` and `outDir: '../dist'`
- ✅ Done when: `dashboard/src/App.jsx` exists and `npm run dev` starts without error

**Task 4: Build React components**
- Write all components per Section 3 UI spec in the order listed:
  1. `styles.css` — full design system (colors, typography, layout)
  2. `useDataPolling.js` — the polling hook
  3. `HeaderBar.jsx`
  4. `AttentionBar.jsx`
  5. `KanbanColumn.jsx` + `ProjectCard.jsx`
  6. `ProjectsPanel.jsx`
  7. `ActivityEntry.jsx` + `ActivityFeed.jsx`
  8. `BlockerModal.jsx`
  9. `App.jsx` — root layout wiring all panels
- ✅ Done when: `npm run build` exits 0 and `dist/index.html` exists

**Task 5: Populate data files with real current state**
- Write actual current projects to `projects-index.json` (scan `memory/projects/`)
- Write any active blockers to `blocker.json`
- Append a few real recent events to `activity-log.jsonl`
- ✅ Done when: data files reflect actual state, not seed data

**Task 6: Register Gateway static route**
- Check if OpenClaw Gateway supports custom static routes (read gateway docs / check existing config)
- Register `dist/` as the static root for path prefix `/mission-control`
- If Gateway doesn't support custom static routes natively: serve files via a simple Node.js static server on a different port and navigate Canvas there
- ✅ Done when: `curl http://127.0.0.1:18789/mission-control` returns HTML

**Task 7: Open in Canvas**
- Run: `canvas action=navigate url=http://127.0.0.1:18789/mission-control`
- Take a Canvas snapshot and verify layout renders correctly
- ✅ Done when: snapshot shows all three panels with real data

**Task 8: Wire Happy's heartbeat to update data files**
- Update `HEARTBEAT.md` to include:
  - Regenerate `projects-index.json` from `memory/projects/`
  - Trim `activity-log.jsonl` to 1,000 lines
  - Append a heartbeat entry to `activity-log.jsonl`
- ✅ Done when: HEARTBEAT.md updated, one manual heartbeat run confirms file updates

**Task 9: Notify R and get sign-off**
- Send R a Telegram message: "Mission Control is live at `/mission-control` in Canvas. [screenshot attached]. Here's what you're seeing: [brief description of panels]. Any adjustments?"
- ✅ Done when: R sees it and responds

---

## 7. What R Sees When It's Done

**User story:**

> R opens their MacBook Pro. They tap the OpenClaw Canvas shortcut (or say "show mission control"). The dashboard opens in the Canvas panel — dark background, no chrome, just signal.
>
> At the top: a red banner reads **🔴 NEEDS YOU [1] · blk-001: Approve Vite install for Mission Control · tap to decide.** R clicks it. A modal shows the full context and what to type in Telegram. R sends the approval. The banner clears to green.
>
> Below that, the Kanban board shows four columns. "IN PROGRESS" has two cards: *Mission Control Dashboard (P0)* and *Content Ops Pipeline (P1)*. "BLOCKED" has one card: *Infra Hardening* with a ⚠️ badge. "DONE" has three. At a glance, R knows the state of everything.
>
> On the right, the activity feed scrolls: the last hour of work — Happy's heartbeats, a subagent that finished a PR, a blocker that was raised and resolved. R can see that work is happening without asking.
>
> R does not open a file. R does not ping Happy to ask "what's the status." R does not wonder what's blocked. They see it all in 5 seconds and get back to the decision they were making.

---

## Appendix A: Happy's Behavioral Contract

These are the behavioral changes required from Happy (not just the build):

1. **On every heartbeat:** Update `projects-index.json` from `memory/projects/` scan. Append a `heartbeat` entry to `activity-log.jsonl`. Trim log to 1,000 lines.

2. **Whenever a blocker or pending decision arises:** Write a new entry to `blocker.json` immediately — not just Telegram. The dashboard is the authoritative list of outstanding items.

3. **When a blocker is resolved:** Mark it `resolved: true` and set `resolved_at`. Never delete entries within 24h of resolution (the feed shows recent resolves as signal).

4. **On every significant task completion:** Append an `activity-log.jsonl` entry with `event: "task_complete"`. Minimum: once per agent run.

5. **When spawning a subagent:** Log `event: "agent_spawned"` with the subagent's task summary as `message`. When it completes, log `event: "agent_done"`.

---

## Appendix B: Out of Scope (v1)

These are deliberately excluded from the first build. Do not add them:

- Token/cost tracking per agent
- Cron job status panel
- Channel health indicators (Telegram/Discord connected)
- Mobile/remote access
- WebSocket real-time updates (polling is sufficient for v1)
- Historical view (yesterday's data)
- Multi-user auth
- Any form of data editing from the UI (read-only dashboard)
- Dark/light theme toggle

---

*PRD complete. Ready to build.*
