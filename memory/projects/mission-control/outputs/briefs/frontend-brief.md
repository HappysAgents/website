# Frontend Task Brief: Mission Control Dashboard

**PRD Reference:** `memory/projects/mission-control/outputs/PRD-MissionControl-v1.md`
**Date:** 2026-03-03
**Status:** Ready for Engineering

---

## Your Mission

Build a single-page static HTML dashboard (`index.html`) with 4 panels: Attention Bar, Agent Status, Projects, and Activity Feed. Pure HTML + vanilla JS + CSS Grid. No build pipeline, no npm, no framework. One file. Served at `/mission-control` via the OpenClaw gateway.

---

## Your Sections in the PRD

- **Section 5:** Feature specs for all 4 panels — exact acceptance criteria per feature
- **Section 7:** User flows — primary morning review, investigate blocker, drill into project, error recovery
- **Section 9:** Frontend Specification — layout, components, state model, data endpoints, constraints

---

## Before You Start

**Hard dependency:** DevOps must confirm two things before you write any fetch() call:
1. The exact gateway file API URL pattern for reading workspace files
2. Confirmation that `/mission-control` is the live serving route

Check `outputs/BUILD_STATUS.md` — DevOps will document both there. Do not hardcode URLs until confirmed.

**You can start immediately on:**
- HTML structure and CSS layout (no network calls needed)
- Component logic with hardcoded mock data
- Relative timestamp utility function
- Markdown rendering setup (marked.js from CDN)

---

## Acceptance Criteria You Own

**Attention Bar (P0)**
- [ ] AC-1.1: Shows red banner + count when blocker.json has open items
- [ ] AC-1.2: Shows green "All clear" when 0 open items
- [ ] AC-1.3: Chip click opens drawer with title, description, recommendation
- [ ] AC-1.4: Auto-refreshes every 30s without page reload

**Agent Status (P0)**
- [ ] AC-2.1: Card per agent from activity-log.jsonl
- [ ] AC-2.2: 🔴 status for agents with `blocker_raised` as last event
- [ ] AC-2.3: Relative timestamps ("X min ago")
- [ ] AC-2.4: Slide-out shows last 10 entries for clicked agent, newest first
- [ ] AC-2.5: Empty state: "No activity recorded"

**Projects Panel (P0/P1)**
- [ ] AC-3.1: Card per project from projects-index.json
- [ ] AC-3.2: Correct status badge per status value
- [ ] AC-3.3: Auto-refreshes every 60s
- [ ] AC-3.4: Drawer renders summary.md as formatted markdown (marked.js)
- [ ] AC-3.5: Projects with `status: "done"` are NOT shown

**Activity Feed (P0/P1)**
- [ ] AC-4.1: Only last 24h events shown
- [ ] AC-4.2: New events appear within 30s without page reload
- [ ] AC-4.3: `level: "error"` events render with red colour indicator
- [ ] AC-4.4: List is scrollable with 20+ events
- [ ] AC-4.5: Empty state: "No activity in the last 24 hours"

---

## Dependencies

### What you need before you can start (full build):
| Item | From | Status |
|------|------|--------|
| Gateway file API URL pattern | DevOps | Pending — check BUILD_STATUS.md |
| Confirmation `/mission-control` serves static files | DevOps | Pending |

### What you can start without waiting for:
- HTML/CSS structure, layout, all component logic with mocked data

### What others need from you:
| Item | To | Expected by |
|------|----|-------------|
| Completed `index.html` | DevOps (to deploy) | Phase 3 |

---

## Technical Notes

**Data fetching:** Each panel manages its own `fetch()` + `setInterval()` independently. A failure in one panel must not affect others. Wrap each panel's fetch in its own try/catch with its own error state rendering.

**Polling intervals:**
- Attention Bar: 30s
- Agent Status: 30s
- Activity Feed: 30s
- Projects Panel: 60s

**Markdown:** Load `marked.js` from CDN with a single `<script>` tag. Use `marked.parse(rawMarkdown)` to render summary.md content in project drawers.

**Timestamps:** Implement a `timeAgo(isoString)` utility. No library. Buckets: "just now" (<60s), "X min ago" (<60m), "Xh ago" (<24h), "yesterday", "X days ago".

**Status emoji map:**
```
active       → 🟢
needs_decision → 🟡
blocked      → 🔴
paused       → 🟡
done         → ✅
Running      → 🟢
Idle         → 🟡
Blocked      → 🔴
Error        → ❌
```

**Agent status derivation logic:**
1. Check `blocker.json` — if agent appears in any open item, status = 🔴 Blocked
2. Otherwise: read last log entry for agent from `activity-log.jsonl`
3. If last entry type is `blocker_raised` → 🔴; `task_complete`/`research_complete` → 🟡 Idle; `task_started` → 🟢 Running; default → 🟡 Idle

---

## Definition of Done

- [ ] All 4 panels render correctly with real data from gateway
- [ ] All P0 acceptance criteria passing (verified by QA)
- [ ] All panels handle their own loading, error, and empty states
- [ ] No panel crash causes another panel to fail
- [ ] Auto-refresh working at specified intervals (verified by QA)
- [ ] Markdown renders formatted (not raw) in project drawer
- [ ] `outputs/BUILD_STATUS.md` updated with `complete` and output file path

---

## Questions / Blockers

Raise blockers by updating `outputs/BUILD_STATUS.md` and noting in your completion summary.
