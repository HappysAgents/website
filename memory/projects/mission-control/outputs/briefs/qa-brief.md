# QA Task Brief: Mission Control Dashboard

**PRD Reference:** `memory/projects/mission-control/outputs/PRD-MissionControl-v1.md`
**Date:** 2026-03-03
**Status:** Ready for Engineering

---

## Your Mission

Write the test checklist from acceptance criteria now (Phase 1), then execute it against the live dashboard once DevOps deploys it. Sign off only when all P0 ACs pass and load time is confirmed under 1 second.

---

## Your Sections in the PRD

- **Section 5:** Acceptance criteria per feature — your primary test source
- **Section 12:** Full QA & Test Plan — test type mapping, data requirements, definition of done

---

## What to Do in Phase 1 (Before Dashboard Is Built)

1. Read Section 5 and Section 12 of the PRD
2. Prepare test data files:
   - `blocker.json` with: 0 items, 1 item, 3 items (at least one of each type)
   - `activity-log.jsonl` with: entries from 2+ agents, all 4 `level` values, entries older than 24h mixed in
   - `projects-index.json` with: all 5 status types including "done"
3. Document test scenarios for each AC in `docs/test-plan.md`

You can begin Phase 1 work immediately — real data files are being written by Happy.

---

## Acceptance Criteria You Own

**Attention Bar**
- [ ] AC-1.1: `blocker.json` has 2 open items → red banner shows count "2" + 2 chips
- [ ] AC-1.2: `blocker.json` has 0 open items → green "All clear" bar
- [ ] AC-1.3: Click a chip → drawer shows `title`, `description`, `recommendation`
- [ ] AC-1.4: Update `blocker.json` externally → banner reflects change within 30s, no reload

**Agent Status**
- [ ] AC-2.1: 2 agents in activity log → 2 cards render with correct names and last actions
- [ ] AC-2.2: Agent's last log entry is `blocker_raised` → card shows 🔴 Blocked
- [ ] AC-2.3: Agent logged event <5 min ago → timestamp shows "X min ago"
- [ ] AC-2.4: Click agent card → slide-out shows last 10 entries for that agent only, newest first
- [ ] AC-2.5: Agent has no log entries → card shows "No activity recorded"

**Projects Panel**
- [ ] AC-3.1: `projects-index.json` has 3 projects → 3 cards render
- [ ] AC-3.2: Project with `status: "blocked"` → badge shows 🔴 Blocked
- [ ] AC-3.3: Update `projects-index.json` externally → panel refreshes within 60s, no reload
- [ ] AC-3.4: Click project card → drawer renders summary.md as formatted markdown (not raw text)
- [ ] AC-3.5: Project with `status: "done"` → NOT shown in panel

**Activity Feed**
- [ ] AC-4.1: Log has entries from 48h ago → only last 24h entries shown
- [ ] AC-4.2: Append new entry to log → appears at top of feed within 30s, no reload
- [ ] AC-4.3: Entry with `level: "error"` → renders with red colour indicator
- [ ] AC-4.4: 25 entries in last 24h → list is scrollable, no overflow
- [ ] AC-4.5: Log has no entries in last 24h → shows "No activity in the last 24 hours"

**Error States (P1)**
- [ ] Rename `blocker.json` temporarily → Attention Bar shows amber warning, other panels unaffected
- [ ] Rename `activity-log.jsonl` temporarily → Agent Status + Feed show warnings, Projects unaffected
- [ ] Rename `projects-index.json` temporarily → Projects shows warning, other panels unaffected

**Performance (P1)**
- [ ] Dashboard load time < 1 second (measure in browser DevTools Network tab, throttle to "No throttling")

---

## Dependencies

### What you need before you can start (full test execution):
| Item | From | Status |
|------|------|--------|
| Dashboard deployed at `/mission-control` | DevOps | Pending — Phase 3 |
| `index.html` complete | Frontend | Pending — Phase 2 |

### What you can start without waiting:
- Test data file preparation
- `docs/test-plan.md` checklist documentation
- AC mapping table

### What others need from you:
| Item | To | Expected by |
|------|----|-------------|
| QA sign-off | R (to open dashboard in confidence) | Phase 4 |

---

## Test Execution Procedure

For each AC:
1. Set up the required test data state
2. Open (or refresh) `/mission-control` in browser
3. Observe actual behaviour
4. Record Pass/Fail in `docs/test-plan.md`
5. For failures: note exact observed behaviour and add to BUILD_STATUS.md as a bug

For auto-refresh tests (AC-1.4, AC-3.3, AC-4.2):
1. Open dashboard
2. Modify the relevant data file externally
3. Start a timer
4. Observe — panel must update within the specified interval without manual reload

---

## Definition of Done

- [ ] All P0 acceptance criteria: Pass
- [ ] All P1 acceptance criteria: Pass
- [ ] All 3 error state tests: Pass (panels fail independently, not together)
- [ ] Dashboard load time: confirmed < 1 second
- [ ] `docs/test-plan.md` complete with Pass/Fail recorded for every AC
- [ ] `outputs/BUILD_STATUS.md` updated with `complete` and QA sign-off note

---

## Questions / Blockers

Raise blockers by updating `outputs/BUILD_STATUS.md` and noting in your completion summary.
