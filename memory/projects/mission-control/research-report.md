# Mission Control — Research Report
*Completed: 2026-03-02*

---

## TL;DR

- **Canvas can run a full interactive HTML/JS/React app** — it's a WKWebView that serves local files or navigates to any HTTP URL, including the gateway's own server. No iframe sandbox escape needed; we own the whole surface.
- **Agent observability tools are built for debugging LLM internals** (traces, token cost, latency) — 80% of what they show is noise for R. What's actually useful: current status per agent, last action, errors, and cost. Mission Control needs a *management* view, not a debug view.
- **Linear is the closest design inspiration** — it shows work status across humans AND agents in one board, with initiatives, cycles, and an "agents command panel." Steal this structure wholesale and replace "team members" with "agents."

---

## 1. OpenClaw Canvas Capabilities & Constraints

**Source:** `https://docs.openclaw.ai/platforms/mac/canvas.md` (fetched successfully)

### What Canvas Is
The macOS app embeds a **Canvas panel using WKWebView** — Apple's browser engine. It's a borderless, resizable panel anchored near the menu bar that serves local HTML/CSS/JS files from a custom URL scheme.

### File Storage
- Canvas files live at: `~/Library/Application Support/OpenClaw/canvas/<session>/`
- Served via custom scheme: `openclaw-canvas://<session>/<path>`
- `openclaw-canvas://main/` → resolves to `<canvasRoot>/main/index.html`
- Writing files here (from the agent) → auto-reloads in the panel

### What the Agent Can Do (via Gateway WebSocket)
- **present/hide** the panel
- **navigate** to a local canvas path, `http(s)://` URL, or `file://` URL
- **eval JavaScript** — inject any JS into the running page
- **snapshot** — capture a screenshot of the panel

### Key Constraints
1. **macOS app only** — Canvas is NOT part of the web Control UI. The web Control UI is a Vite+Lit SPA. Canvas is a separate macOS-only panel.
2. **One panel at a time** — only one Canvas session visible at once (switching sessions re-navigates).
3. **No native React runtime** — but you CAN bundle React (e.g., with Vite) into static files and drop the build output into the canvas directory. The WKWebView will run it.
4. **A2UI v0.8 only** — the built-in A2UI component system supports `surfaceUpdate`, `beginRendering`, `dataModelUpdate`, `deleteSurface`. `createSurface` (v0.9) is NOT supported.
5. **Can navigate to the gateway's web server** — Canvas can load `http://127.0.0.1:18789/` or any custom route served by the gateway. This is the cleanest option for a dashboard that also needs live WebSocket data.
6. **Security:** directory traversal blocked; external URLs only when explicitly navigated; deep links (`openclaw://agent?message=...`) trigger confirmation prompts.
7. **Can be disabled** — if user turns off "Allow Canvas" in Settings, canvas commands return `CANVAS_DISABLED`.

### Build Recommendation (Inference)
The cleanest architecture: **serve Mission Control as a route on the Gateway HTTP server** (e.g., `http://127.0.0.1:18789/mission-control`), then have the agent navigate Canvas to that URL. This gives:
- Live WebSocket access to gateway data
- React/Next.js or plain HTML with no build-to-canvas-dir pipeline
- Works whether Canvas is macOS app or browser-opened Control UI

---

## 2. What Agent Observability Tools Show (and What's Useful)

### AgentOps (`https://agentops.ai`)
**Focus:** LLM developer debugging
**What it shows:**
- Visual traces of LLM calls, tool calls, multi-agent interactions
- "Time Travel Debugging" — rewind/replay agent runs
- Full audit log of errors + prompt injection attempts
- Token counts + cost per agent (400+ LLMs)
- Replay analytics

**Useful for Mission Control:** error/blocker state, cost tracking per agent
**Noise for Mission Control:** replay debugging, token-level traces, fine-tuning data

### Lunary (`https://lunary.ai`)
**Focus:** Production AI observability + prompt management
**What it shows:**
- Traces + error stack traces per session
- Model usage + costs
- User satisfaction metrics
- Topic clustering (what are agents talking about?)
- Alerts when agents underperform
- Human review queues
- Prompt versioning + A/B testing

**Useful for Mission Control:** alert/blocker state, agent health signal (errors), cost
**Noise for Mission Control:** prompt management, A/B testing, user satisfaction analytics

### LangSmith (`https://langsmith.com` → `langchain.com/langsmith/observability`)
**Focus:** Full-stack agent observability
**What it shows:**
- Step-by-step agent traces ("See exactly what your agent is doing step by step")
- Cost tracking (token, latency P50/P99, error rates)
- Tool + agent trajectory monitoring
- Unsupervised topic clustering + failure mode detection
- Webhook/PagerDuty alerts
- Online LLM-as-judge quality evals

**Useful for Mission Control:** trajectory summary ("last tool called"), error alerts, latency signal
**Noise for Mission Control:** everything at the LLM call level

### Helicone (`https://helicone.ai`)
**Status:** Minimal content extracted — only tagline: "Route, debug, and analyze AI applications." No useful feature detail surfaced.

### Pattern Summary: What's Actually Useful vs. Noise

| Signal | Useful for Mission Control? |
|--------|----------------------------|
| Agent current status (running / idle / error) | ✅ P0 |
| Last action taken | ✅ P0 |
| Active blocker / pending decision | ✅ P0 |
| Cost per agent (today / this week) | ✅ P1 |
| Error count / last error | ✅ P1 |
| Individual LLM call traces | ❌ Noise |
| Token-level debug logs | ❌ Noise |
| Prompt A/B testing UI | ❌ Out of scope |
| User satisfaction scores | ❌ Out of scope |

**Key insight:** Existing tools are built for engineers debugging AI pipelines. Mission Control is for an operator managing a portfolio of running agents. Completely different view — think "ops dashboard" not "debugger."

---

## 3. Dashboard Design Patterns Worth Stealing

### Linear (`https://linear.app`)
**Status:** Fetched successfully. Linear is the most directly relevant product.

**What Linear Does:**
- **Swim-lane board** (Backlog → Todo → In Progress → Done) — immediate status at a glance
- **Initiatives** — strategic groupings of projects with progress indicators
- **Cycles** (sprints) — time-boxed work containers
- **Roadmap / timeline view** — Gantt-style across initiatives
- **AI agent integration** — Linear now has an "Agents Command Menu" that shows running agents (Codex, GitHub Copilot, Cursor) alongside humans, with live streaming status

**Steal for Mission Control:**
- The swim-lane metaphor maps perfectly to agent states: Queued → Running → Blocked → Done
- The "Agents Command Menu" is literally what we're building — live status per named agent
- Initiatives → Projects mapping (each project is a bucket with multiple tasks)
- Linear shows "In Progress: 3" with names/cards — use this as the "running agents" panel

### Notion (`https://notion.com`)
**Status:** Minimal content — just tagline and feature names. "Custom Agents (Coming soon)", "Flexible workflows", "AI Meeting Notes." Not much to learn from the homepage.
**Pattern worth stealing:** Database views (list, board, calendar, gallery) — users should be able to choose how they view project status.

### HN Trending (Signal from today's front page)
- "Parallel coding agents with tmux and Markdown specs" (schipper.ai, 79pts) — shows people are managing agents with simple text files and terminal splits. Mission Control is the visual layer this crowd doesn't have yet.
- Strong community signal: the pain of multi-agent coordination is real and unsolved.

---

## 4. Prior Art — Agent Dashboards

### ClawHub (`https://clawhub.ai`)
**Status:** Page returned essentially empty — just "ClawHub" with no content. Dead end for research.

### ProductHunt (`https://producthunt.com`)
**Status:** 403 Forbidden. Could not access.

### HN Front Page (searched for agent dashboard prior art)
No dedicated "agent command center" product surfaced on front page. The parallel agents post (schipper.ai) is about tmux + markdown — indicating the state of the art for hobbyists is still terminal-based. No polished dashboard exists in the wild.

### Linear's Agents Panel
Closest existing prior art. Linear's "Agents Command Menu" (shipped 2025-2026) shows:
- Agent name + type (Codex, Cursor, etc.)
- What it's currently working on
- Live streaming status updates

This is the commercial benchmark. Our Mission Control should match this level of polish but go deeper (blockers, decisions, project context).

### Inference: The Gap
Nobody has built "Happy's ops dashboard" — a single pane of glass for a human operator running multiple AI agents as a business. Linear is the closest but it's project-focused. AgentOps/LangSmith are dev-focused. The intersection (operator-focused agent management) is vacant.

---

## 5. Recommended Dashboard Structure for Mission Control

### Design Principle
Mission Control is R's morning review + live monitoring surface. It answers: *"What's running, what's blocked, what needs me right now?"*

It is NOT a debugger. No traces, no token logs. Operator-first.

### Layout (Desktop-First)
```
┌─────────────────────────────────────────────────────────────┐
│  🚨 NEEDS YOU NOW          [2 items]                        │  ← Top banner (attention bar)
├────────────────┬────────────────┬───────────────────────────┤
│  AGENTS        │  PROJECTS      │  ACTIVITY FEED            │
│  ─────────     │  ─────────     │  ─────────────────        │
│  Happy (CoS)   │  Mission Ctrl  │  14:22 Happy: researched  │
│  🟢 Running    │  ● In Progress │  14:18 Dev: PR opened     │
│  Content Agent │  Content Ops   │  14:05 Content: blocked   │
│  🟡 Idle       │  ● Needs R     │  13:55 Happy: cron ran    │
│  Dev Agent     │  Infra         │                           │
│  🔴 Blocked    │  ✓ Done        │                           │
└────────────────┴────────────────┴───────────────────────────┘
```

### P0 — Must-Have Panels

**1. Attention Bar (top)**
- What needs R RIGHT NOW: pending decisions, blocked agents, approvals required
- Zero items = green. Any items = red banner with count
- Clicking an item opens the context + action options
- *Data source:* MEMORY.md / daily notes parsed for DECISION flags + blocker entries; manually surfaced by Happy

**2. Agent Status Panel**
- One card per active agent (Happy, Content Agent, Dev Agent, etc.)
- Shows: name, status (Running 🟢 / Idle 🟡 / Blocked 🔴 / Error ❌), last action (1-line), last active timestamp
- Clicking opens agent's session transcript or most recent activity log
- *Data source:* OpenClaw `sessions.list` WS API + `system-presence` events; agent writes status updates to a structured JSON file in workspace

**3. Projects Panel**
- One card per active project from PARA `memory/projects/`
- Shows: name, status, owner agent, last updated
- Status: Active / Needs Decision / Blocked / Done
- *Data source:* `memory/projects/*/summary.md` — Happy parses these on each heartbeat and writes a `projects-index.json`

**4. Activity Feed**
- Chronological stream: what happened in the last 24h across all agents
- Format: `[time] [agent]: [1-line action]`
- *Data source:* Structured log file that each agent appends to (e.g., `memory/activity-log.jsonl`)

### P1 — Nice-to-Have Panels

**5. Cost Meter**
- Token/$ spent today per agent + total
- Simple bar charts, no detail
- *Data source:* OpenClaw `usage-tracking` (from `concepts/usage-tracking.md` — exists in docs); session token counts from `sessions.list`

**6. Cron / Scheduled Jobs**
- What's running on schedule, when last ran, when next runs
- *Data source:* OpenClaw `cron.*` WS API (already exists in Control UI)

**7. Channels Health**
- Which channels (Telegram, Discord, WhatsApp) are connected vs. disconnected
- *Data source:* `channels.status` WS API (already exists in Control UI)

**8. Quick Actions**
- Buttons: "Message Happy", "Approve all pending", "Run morning review"
- Deep link via `openclaw://agent?message=...`

### Data Sources Summary

| Panel | Source | Complexity |
|-------|--------|------------|
| Attention Bar | PARA files + structured flags Happy writes | Medium — needs Happy to write structured blocker.json |
| Agent Status | `sessions.list` + `system-presence` WS | Low — already in Control UI |
| Projects | `memory/projects/*/summary.md` → index JSON | Low — Happy writes this |
| Activity Feed | `memory/activity-log.jsonl` (new file) | Low — Happy appends to it |
| Cost Meter | Session token counts via WS | Low — gateway has this |
| Cron Jobs | `cron.*` WS API | Very Low — already exists |
| Channels Health | `channels.status` WS API | Very Low — already exists |

---

## 6. Open Questions for the PRD

1. **Delivery mechanism:** Serve Mission Control as a gateway route (`/mission-control`) vs. write files to Canvas dir? Gateway route is cleaner for live data. Needs scoping.

2. **Who writes the structured data?** Happy needs to write `blocker.json`, append to `activity-log.jsonl`, and keep `projects-index.json` current. When does this happen — every agent run? On heartbeat? This is a behavioral change for Happy, not just a UI change.

3. **Real-time vs. polling?** WS events from the gateway are real-time. PARA file parsing is polling. Decide on refresh interval (every 30s? on focus?).

4. **Mobile?** Canvas is macOS-only. If R wants mobile access, the dashboard would need to be served via Tailscale + gateway remote URL. Separate scope question.

5. **Auth?** If served via gateway, it's behind gateway auth (token/password). Confirm R is OK with this or wants simpler access.

6. **How does "Blocked" state get set?** Happy needs a clear convention for declaring a blocker vs. just pausing. Currently no structured blocker format exists. PRD must define this.

7. **Subagent visibility?** Subagents currently have no structured status surface. Can we query `subagents list` via the gateway and surface it? Needs API investigation.

8. **Historical view?** Should R be able to see "what happened yesterday"? Or is this a live-only dashboard? Affects data retention design.

---

## Sources

| URL | Status | Summary |
|-----|--------|---------|
| `https://docs.openclaw.ai` | ✅ 200 | OpenClaw overview — gateway architecture, key capabilities |
| `https://docs.openclaw.ai/canvas` | ❌ 404 | Wrong path |
| `https://docs.openclaw.ai/platforms/mac/canvas.md` | ✅ 200 | **Full Canvas API** — WKWebView, A2UI, agent commands, constraints |
| `https://docs.openclaw.ai/web/control-ui` | ✅ 200 | Control UI capabilities — WS API surface available to agents |
| `https://docs.openclaw.ai/llms.txt` | ✅ 200 | Full doc index — used to find correct Canvas path |
| `https://docs.openclaw.ai/concepts/multi-agent.md` | ✅ 200 | Multi-agent routing, session isolation, agent structure |
| `https://docs.openclaw.ai/concepts/session.md` | ✅ 200 | Session management, store structure, token data |
| `https://agentops.ai` | ✅ 200 | Agent observability — traces, cost, time-travel debug |
| `https://docs.agentops.ai/v1/examples/examples` | ✅ 200 | AgentOps integrations list (CrewAI, LangChain, etc.) |
| `https://lunary.ai` | ✅ 200 | LLM observability — analytics, alerts, human review |
| `https://helicone.ai` | ✅ 200 | Minimal content — "route, debug, analyze AI apps" |
| `https://www.langsmith.com` | ✅ 200 (redirected) | Full feature breakdown — most informative of the bunch |
| `https://linear.app` | ✅ 200 | **Best design reference** — AI+human workflow board, agent command panel |
| `https://www.notion.so` | ✅ 200 | Minimal — taglines only, custom agents "coming soon" |
| `https://clawhub.com` / `clawhub.ai` | ✅ 200 | Empty page — no content |
| `https://news.ycombinator.com` | ✅ 200 | Front page scan — parallel agents article confirms problem space |
| `https://www.producthunt.com` | ❌ 403 | Blocked |
| `https://docs.openclaw.ai/web/canvas` | ❌ 404 | Wrong path |
| `https://docs.openclaw.ai/tools/canvas` | ❌ 404 | Wrong path |
| `https://www.helicone.ai/features` | ❌ 404 | Page doesn't exist |
