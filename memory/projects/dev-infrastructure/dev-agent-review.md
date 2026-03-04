# Dev Agent Technical Review — Secure Build Environment Plan
*Reviewed: 2026-03-04 by Dev Agent (subagent)*
*Plans reviewed: secure-build-environment-plan.md + secure-build-environment-review.md + mission-control/PRD.md*

---

## TL;DR — Key Recommendations

1. **Architecture is sound.** Two-layer isolation + GitHub Actions chokepoint is the right call. Security review caught the critical gaps. Proceed after fixes.
2. **Data access: Use the Export Layer (file-based).** Don't expose the gateway to containers. Files are safer, auditable, and sufficient for current scale.
3. **Dev environment: OrbStack local only for now.** Hetzner adds real operational value only when you have production services that need to run while the MacBook sleeps. Don't add it until you have that need.
4. **The plan has four significant gaps** that need addressing before build starts — developer experience, secret injection, Mission Control data flow, and container lifecycle.
5. **If building from scratch:** Start with the data contracts, not the infrastructure. The PRD's JSONL approach is the right primitive. Everything else builds on top.

---

## 1. Verdict on the Overall Architecture

**It's the right approach. Ship it with the security agent's mandatory fixes.**

Two-layer isolation (local OrbStack + Hetzner for prod) with GitHub Actions as the sole deploy chokepoint is a solid architecture for a solo operator building products with AI agents. The threat model is real — a malicious npm package on a bare Mac with OpenClaw running is a legitimate risk.

The security review (finding #5 — tj-actions supply chain attack, GitHub Actions secrets) is the most important output of the whole exercise. That class of attack has taken down well-funded teams. Pinning Actions to commit SHAs is non-negotiable and needs to become a permanent rule in `agents/dev-agent.md`.

**What I'd change at the architectural level:**
- The current plan treats Hetzner as "always there" for production. It should be "add when needed." Right now there's nothing that needs to run 24/7 independent of the MacBook. Don't pay for and manage infrastructure you don't need yet.
- The security review's recommended container flags need to be the DEFAULT template — not optional hardening. Make them the baseline before a single line of code runs in a container.
- The plan needs an explicit answer to: "Who starts and monitors the containers?" (Addressed in section 4.)

---

## 2. Decision 1 — Data Access: Export Layer vs Local API Bridge

**Recommendation: Export Layer. Decisively.**

### What these mean in practice

**Export layer (what the PRD describes):**
- Happy writes structured JSON/JSONL files to disk: `blocker.json`, `activity-log.jsonl`, `projects-index.json`
- Mission Control dashboard reads these files via the gateway's static file serving or filesystem access
- Agent data flows: agent action → Happy writes event → file on disk → dashboard reads file → R sees it

**Local API bridge:**
- Mission Control (running in a container or served from one) makes direct calls to the OpenClaw gateway at `127.0.0.1:18789`
- Dashboard gets real-time session data, cron state, etc. directly from the gateway
- Richer data, lower latency, but the gateway is now in the container's reachable network

### Why Export Layer wins

**Security:** The gateway at `:18789` has access to everything — the token auth, session history, all connected channels, potentially credentials. If Mission Control (or anything it serves) is compromised, a Local API Bridge gives an attacker a direct line to the agent's command center. The export layer means a compromised dashboard sees only the JSON files Happy chose to write. Blast radius is scoped.

**Simplicity:** File writes and reads are trivially auditable. You can `cat activity-log.jsonl` and see exactly what the dashboard sees. No network debugging, no token management, no CORS configuration.

**Sufficient for current scale:** At 1 human operator + 3-4 agents, 30-second polling on JSON files is fine. The PRD's 30s poll interval is correct for MVP.

**The real-time gap is solvable:** For Phase 2 when you want live WS data (cron status, agent session state), the right answer is to expose ONLY those specific gateway APIs — not open a general bridge. You'd build explicit, narrow gateway routes for what the dashboard needs. Not a general-purpose bridge.

### Trade-offs to acknowledge

Export layer has latency: actions surface in Mission Control 0-30s after they happen. If R is watching a live agent run and expects instant updates, this feels slow. But for an ops dashboard checked periodically, it's fine. Real-time is a Phase 2 problem.

Export layer requires Happy to maintain the data writing discipline — if Happy forgets to append to `activity-log.jsonl`, the dashboard goes stale. This is a process dependency, not a technical one. Mitigate by adding `activity-log.jsonl` writes to the heartbeat routine as a check.

---

## 3. Decision 2 — Dev Environment: OrbStack Local Only vs OrbStack + Hetzner

**Recommendation: OrbStack local only. Add Hetzner when you have a concrete reason.**

### The case for local only right now

The trigger for adding a remote VPS should be: "I have a service that needs to be up when the MacBook is off/sleeping." Right now, there is no such service. Mission Control is served from the MacBook gateway. The website is on Cloudflare Workers (edge, always on, no VPS needed). Nothing currently needs a persistent remote server.

Adding Hetzner now means:
- Another machine to harden (non-trivial — see security review finding #4)
- SSH key management (what key? stored where? rotated when?)
- The Tailscale reverse path gap (security review finding #6, critical)
- Monthly cost for capacity you're not using
- Another thing that can break at 2am

This is premature infrastructure. The operations overhead is real.

### When Hetzner becomes the right call

Add Hetzner when one of these is true:
1. You're running a service (API, backend, webhook receiver) that needs uptime independent of the MacBook
2. Mission Control needs to be accessible from R's phone/laptop without the MacBook being on
3. You're doing compute-heavy builds that slow down the MacBook noticeably

None of these apply today. First product shipped → then evaluate.

### If Hetzner is added, one non-negotiable

Do NOT put Tailscale on the Hetzner VPS unless you configure ACLs to explicitly deny VPS→MacBook traffic. The security review is correct that this is a critical gap. The simplest solution: access Hetzner via SSH public key directly (no Tailscale on the VPS). Tailscale stays MacBook-only for the OpenClaw tunnel.

---

## 4. What the Plan Missed

These are gaps that could block the build or create real pain. Address before implementation.

### Gap 1 — Developer experience: How does R actually interact with containers?

The plan says Dev Agent works "inside the container." But Dev Agent is an LLM process running on the MacBook. In practice, it issues shell commands via `exec`. So the workflow is:
```
Dev Agent (MacBook) → exec("docker run ... npm install") → container runs → output back to Dev Agent
```
That's fine for build commands. But what about when R wants to inspect a running container? What if a build is failing and R wants to look inside? The plan doesn't address:
- How R gets a shell into a running container (likely `docker exec -it <name> sh`, but this isn't mentioned)
- How R views running containers at a glance (OrbStack has a decent UI for this — mention it)
- What happens when Dev Agent needs to iterate interactively on a build failure

**Recommendation:** Add a short "Dev workflow for R" section to `agents/dev-agent.md`. At minimum: how to list running containers, how to exec in, and how to destroy a suspicious one.

### Gap 2 — Secret injection: How do secrets get into containers that need them?

The plan says "Container explicitly denied: all env vars not explicitly passed." Good. But it doesn't say HOW secrets get explicitly passed when a container legitimately needs them.

Example: Mission Control Phase 2 might need an API key to query something. How does that key get in? Options:
- `--env VAR=value` on `docker run` (easiest, but the secret appears in shell history and `docker inspect`)
- `--env-file /path/to/.env` (better — file isn't in shell history, but what permissions does the file have?)
- Docker secrets (overengineered for current scale)
- Build-time secrets via `--secret` flag (correct for build steps, not runtime)

**Recommendation:** Define the secret injection pattern before Dev Agent writes a single Dockerfile. The recommendation for now: `--env-file` with a project-specific `.env` file stored OUTSIDE the project volume mount, with `chmod 600`. Document this in `agents/dev-agent.md` as the mandatory pattern.

### Gap 3 — How Mission Control actually gets agent data in practice

The PRD's data architecture (blocker.json, activity-log.jsonl, projects-index.json) is correct, but the plan doesn't address a key implementation detail: how does the dashboard read these files?

If Mission Control is served as a gateway route (`/mission-control`), then the gateway process needs to serve the JSON files too. This means either:
- The gateway has a static file serving route that points to `memory/projects/mission-control/`
- The gateway has explicit API routes that read and return the JSON (better: allows caching, auth, transformation)
- The dashboard makes XHR calls to the gateway's file serving endpoint

The PRD lists "Gateway HTTP route `/mission-control`" as the chosen approach but explicitly notes: "Happy will investigate before building." This needs to be investigated and confirmed BEFORE the build decision is made. If the gateway can't serve those JSON files over HTTP, the entire data contract needs to change.

**Recommendation:** Before committing to this architecture, Happy should confirm: (a) the exact gateway config for static file serving or custom routes, and (b) whether the gateway auth token is required for the dashboard's JSON poll requests (it should be, otherwise the blocker data is unauthenticated).

### Gap 4 — Container lifecycle management

The plan says containers are "ephemeral — destroy and recreate." But:
- What triggers destruction? Manual only? After every build? After every session?
- What happens to work-in-progress if a container is destroyed mid-edit?
- How does Dev Agent know a container is running vs stopped vs crashed?
- What if OrbStack crashes? Does the next exec session restart it?

For a solo operator this is manageable, but "ephemeral" needs an operational definition. Recommendation:
- Containers are destroyed after each build job (using `--rm` flag, already in the recommended template)
- For interactive dev sessions, container lives until explicitly killed or the session ends
- Dev Agent checks container status at the start of each session (`docker ps`)
- OrbStack auto-starts with macOS login (this is default behavior — confirm it's configured)

---

## 5. One Thing I'd Do Differently

**Start with the data contracts, not the infrastructure.**

If I were building this from scratch, I'd flip the order:

**Week 1:** Get Happy writing `blocker.json` and `activity-log.jsonl` TODAY. Zero infrastructure required. These are just file writes. The data discipline is harder to build than the tooling, so start there. By the time Mission Control's UI is ready, there'd be real data in those files.

**Week 2:** Build Mission Control Phase 1 as a pure HTML file with zero npm installs. No container needed. No security review. Just a file that reads the JSON files the gateway serves. This validates the data architecture before investing in build infrastructure.

**Week 3:** With a working dashboard confirmed, NOW install OrbStack for Mission Control Phase 2 and future product builds. By this point, you know what container you need to build.

**Week 4+:** Add Hetzner only if Mission Control Phase 2 needs a persistent server (likely not — it's a dashboard served from the MacBook gateway).

The current plan treats the infrastructure as the prerequisite. It isn't. The data contracts and behavioral changes to Happy are the prerequisite. Everything else is implementation detail.

The architecture I'd target looks like this:
```
MacBook (Always On)
├── OpenClaw gateway (serves /mission-control)
│   └── Static HTML + vanilla JS (no build step)
│       └── Polls JSON files every 30s
├── Happy (writes to JSON files on every significant action)
└── OrbStack (for Dev Agent builds only — not for serving Mission Control)
    └── Per-project containers (hardened template, --rm by default)

GitHub (Source of truth)
└── GitHub Actions (only deploy path to Cloudflare Workers / Hetzner)

Hetzner (added when needed, not before)
└── Production services that need 24/7 uptime
```

---

## Priority Order for Implementation

1. **Immediately (no infrastructure needed):** Happy starts writing `blocker.json` and `activity-log.jsonl`. Behavioral change, zero cost.
2. **Before OrbStack install:** Confirm gateway can serve Mission Control route + JSON files. Confirm exact path. This is a research task, not a build task.
3. **Install OrbStack** (after security review approval). Apply hardened container template. Never run bare `docker run`.
4. **Build Mission Control Phase 1** as pure HTML. Validate data flow end-to-end.
5. **Phase 2 (containers + React)** after Phase 1 is confirmed working.
6. **Hetzner** only when you have a service that needs it.

---

*Written by Dev Agent subagent, 2026-03-04. Ready for follow-up questions via Happy.*
