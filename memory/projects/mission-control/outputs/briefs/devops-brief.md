# DevOps Task Brief: Mission Control Dashboard

**PRD Reference:** `memory/projects/mission-control/outputs/PRD-MissionControl-v1.md`
**Date:** 2026-03-03
**Status:** Ready for Engineering

---

## Your Mission

You are the unblocking agent for this entire build. You have two jobs: (1) investigate and confirm how the OpenClaw gateway serves static files and workspace file reads, then document the exact paths; (2) deploy the completed `index.html` to the confirmed location when Frontend is done. Everything else blocks on you.

---

## Your Sections in the PRD

- **Section 11:** DevOps & Infrastructure Specification — full requirements

---

## Phase 1 Responsibilities (You Go First)

**Deliverable 1 — Gateway static file serve path**
The OpenClaw gateway must serve `index.html` at the route `/mission-control`. Find out:
- What directory must the HTML file live in for the gateway to serve it?
- Is this path configurable (e.g. via `wrangler.toml` equivalent, or `openclaw.json`)?
- Can you place a test file and confirm `/mission-control` returns it?

Document the confirmed path in `outputs/BUILD_STATUS.md`.

**Deliverable 2 — Gateway file API URL pattern**
The dashboard's frontend panels fetch JSON and JSONL data files directly from the workspace via the gateway. Find out:
- What is the exact URL pattern to read a workspace file via the gateway? (e.g. `http://127.0.0.1:18789/files/memory/...` or similar)
- Test it: fetch `memory/projects/mission-control/blocker.json` via the gateway and confirm it returns valid JSON
- Note any auth headers required

Document the confirmed URL pattern in `outputs/BUILD_STATUS.md`.

---

## Investigation Approach

1. Check OpenClaw gateway documentation or source for static file serving
2. Check `~/.openclaw/openclaw.json` for relevant gateway config keys
3. Try: `curl http://127.0.0.1:18789/` — inspect response for available routes
4. Try: `openclaw gateway --help` for clues on static route config
5. Check if the existing Control UI source reveals file-serving patterns

If the gateway does not support static file serving natively, identify the next-best alternative (e.g., a minimal HTTP server scoped to the gateway port, or canvas `file://` with a workaround for data fetching) and surface it as a decision to R.

---

## Deliverable 3 — Deploy index.html

Once Frontend completes `index.html`:
1. Copy the file to the confirmed static serve directory
2. Verify `/mission-control` returns HTTP 200 and renders the dashboard
3. Verify the gateway file API works from the browser (no CORS errors on fetch calls)
4. Update `outputs/BUILD_STATUS.md` with `complete`

---

## Dependencies

### What you need before you can start:
None — you go first.

### What others need from you before they can start:
| Item | To | Expected by |
|------|----|-------------|
| Gateway file API URL pattern confirmed | Frontend | Phase 1 (Day 1) |
| Static serve path confirmed | Frontend | Phase 1 (Day 1) |
| `index.html` deployed + /mission-control live | QA | Phase 3 |

---

## Definition of Done

- [ ] Gateway static serve path identified and documented in `outputs/BUILD_STATUS.md`
- [ ] Gateway file API URL pattern confirmed and documented (with test result)
- [ ] Any auth requirements for file API documented
- [ ] `index.html` deployed; `/mission-control` returns HTTP 200
- [ ] File API tested from browser — no CORS errors on fetching `blocker.json`
- [ ] `outputs/BUILD_STATUS.md` updated with `complete` and all findings

---

## Questions / Blockers

Raise blockers by updating `outputs/BUILD_STATUS.md` and noting in your completion summary.
