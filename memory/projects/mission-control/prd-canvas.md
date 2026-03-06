# Mission Control — Canvas PRD (v1)

**Date:** 2026-03-06
**Status:** Draft — R approved concept, pending GitHub repo approval
**Supersedes:** Original PRD's implementation section only. Problem statement, user stories, and panels are unchanged.
**Reference:** prd.md (original), research-report.md

---

## TL;DR

Mission Control is a static HTML dashboard served via OpenClaw Canvas. Happy generates three JSON data files on the dedicated Mac; Canvas loads the HTML file and reads the data locally. No server, no VPS, no network calls. R opens it with one click.

---

## Architecture (Canvas MVP)

```
Dedicated Mac (Happy)
    │
    │ Generates data files on demand or cron
    ↓
~/openclaw-workspace/memory/projects/mission-control/data/
    ├── projects-index.json   ← project status + health
    ├── blocker.json          ← current blockers + waiting-on
    └── activity-log.jsonl    ← recent agent activity (rolling 7 days)
    │
    │ Canvas navigates to file or Gateway route
    ↓
Canvas (WKWebView) → loads dashboard.html → reads JSON → renders UI
```

**No server required.** Happy writes files, Canvas reads them.

**Future upgrade path:** If R needs remote access, serve `dashboard.html` + JSON via a Hetzner VPS over Tailscale. Same data contract, different delivery.

---

## Data Contract (Locked)

### projects-index.json
```json
{
  "generated": "ISO timestamp",
  "projects": [{
    "id": "string",
    "name": "string",
    "status": "active | paused | complete",
    "health": "green | yellow | red",
    "owner": "string",
    "summary": "1-2 sentences",
    "blockers": ["string"],
    "path": "relative path to project folder"
  }]
}
```

### blocker.json
```json
{
  "generated": "ISO timestamp",
  "blockers": [{
    "id": "string",
    "project": "string",
    "severity": "critical | high | medium | low",
    "title": "string",
    "description": "string",
    "waiting_on": "R | Happy | External",
    "since": "YYYY-MM-DD",
    "action_needed": "string"
  }]
}
```

### activity-log.jsonl
One JSON object per line:
```json
{"ts": "ISO", "agent": "string", "type": "string", "project": "string", "summary": "string"}
```
Types: `approval`, `decision`, `build`, `deploy`, `research`, `fix`, `docs`, `security`, `plan`, `complete`

---

## UI Panels (Canvas)

Unchanged from original PRD. See prd.md §4. Key panels:
1. **Attention bar** — items where waiting_on = "R", severity critical/high
2. **Agents panel** — active agents + last action
3. **Projects panel** — health grid, click to expand
4. **Activity feed** — rolling 24h from activity-log.jsonl
5. **Cron schedule** — upcoming scheduled jobs

---

## Build Plan

### Phase 1 — Static HTML MVP (build first)

1. `dashboard.html` — single-file HTML/CSS/JS, reads local JSON files
2. Canvas navigates to the file path or Gateway serves it at `/mission-control`
3. Happy refreshes data files on demand (or cron, once pattern is proven)
4. No framework, no build step, no dependencies — pure vanilla HTML

### Phase 2 — Auto-refresh (after MVP works)

- Cron runs every 15 min: Happy regenerates data files
- Canvas auto-reloads on file change (polling or WebSocket via Gateway)

### Phase 3 — Remote access (if needed)

- Move to Hetzner VPS, serve over Tailscale
- Same data contract, same HTML — just different delivery

---

## GitHub Repo

**Name:** `HappysAgents/mission-control` (private)
**Awaiting:** R approval per Rule 2

**What goes in the repo:**
- `dashboard.html` (the UI)
- `scripts/generate-data.sh` (Happy's data generation script)
- `data/` (gitignored — generated files stay local)
- `README.md`

---

## Happy's Data Generation Responsibility

Happy runs a script (or manually updates) the three data files in:
`~/openclaw-workspace/memory/projects/mission-control/data/`

This is **Happy's job**, not a VPS agent's job. Happy knows the full project state. The dashboard is only as good as Happy's data hygiene.

Starting frequency: on-demand (Happy updates before R is likely to open it).
Future: automated via cron once pattern is proven.

---

## Definition of Done (MVP)

- [ ] GitHub repo created and approved (Rule 2)
- [ ] `dashboard.html` renders all 5 panels from local JSON
- [ ] All three data files accurate and up to date
- [ ] Canvas loads the dashboard with one click
- [ ] R confirms it's useful after 3 days of use
