# Security Architecture Plan — Narrative

**Status:** v2 — updated with R's architecture corrections
**Date:** 2026-03-06 (v2)
**Author:** Happy
**Changelog:** v2 removes Syncthing → R's Mac. R's Mac is fully separated. Syncthing scoped to Dedicated Mac ↔ VPS only. Mission Control data via SCP over Tailscale.

---

## TL;DR

Two separate worlds. **Internal tools** (dashboards, automations for us) live on GitHub private repos, built and tested on VPS instances, with outputs delivered to R's Mac via **SCP over Tailscale** (on demand or scheduled). **External products** (things we sell) each get their own VPS, fully isolated from the dedicated Mac. The dedicated Mac stays lean — it's Happy's brain, not a development machine. No code repos, no running services, no cloud provider credentials. R provisions VPS instances manually until the pattern is proven. Cloud provider: **Hetzner** (cheapest, good API, EU-based). VPS agents report back via Discord webhooks to project-specific channels.

**Key architecture constraint:** R's Mac is completely air-gapped from the build system. The only file exchange method between R's Mac and the dedicated Mac is SCP over Tailscale, used explicitly and on-demand — not a routine data channel.

---

## Part A: Internal Tools

Internal tools = things built for us. Mission Control dashboard, data pipelines, automation scripts, internal APIs.

### Data Flow

```
Dedicated Mac (Happy) → generates outputs → SCP over Tailscale → R's Mac (reads outputs)
                                                                     ↓
                                                              Mission Control (local)
```

No Syncthing to R's Mac. No bridge folders. SCP is explicit, auditable, and only runs when Happy pushes or R requests. Steering happens via Discord/Telegram — already working, already auditable, no second command surface to secure.

### Where Internal Tool Code Lives

**GitHub private repos. Not the dedicated Mac.**

Rationale (unchanged from v1):

1. **Git repos are attack surface.** Git hooks execute automatically. A compromised dependency that modifies `.git/hooks/` runs code inside Ring 2.
2. **Dependencies expand blast radius.** `npm install` pulls hundreds of packages into Ring 2. On a VPS, that compromise is contained.
3. **The dedicated Mac's value is its cleanliness.** Fewer things = harder to compromise.
4. **GitHub private repos are already more secure.** Isolated from runtime, audit logs, access controls, branch protection.

**What lives where:**

- Internal tool source code → GitHub private repos
- Development + testing → on a VPS (can be a shared "dev VPS" for internal tools)
- Deployment → Cloudflare Workers, or the dev VPS itself
- The dedicated Mac → only workspace files (PARA, agent specs, configs). No code repos.

**The one exception:** Small scripts that are part of the OpenClaw workspace itself (agent specs, skills, automation scripts under 100 lines that Happy runs directly). These are operational config, not "products."

### Autonomy Boundaries for Internal Tools

| Action | Happy can do freely | Needs R approval |
|--------|-------------------|-----------------|
| Research + design | ✅ | |
| Write code (on VPS) | ✅ | |
| Push to GitHub private repo | | ✅ (per Rule 2) |
| Deploy to Cloudflare | | ✅ |
| Install dependencies (on VPS) | ✅ (with security review) | |
| Install anything on dedicated Mac | | ✅ (per Rule 7) |
| Spin up new VPS | | ✅ (R provisions) |
| SCP files to R's Mac | ✅ (pre-agreed outputs only) | ✅ (new file types/paths) |

### Mission Control — Migration Path

**Phase 1 (Now): Local on R's Mac**
- Happy generates dashboard data on dedicated Mac
- Happy pushes output files to R's Mac via SCP over Tailscale (on demand or scheduled)
- R views it locally (simple HTML file, or a local web app)
- Simplest possible. No servers to maintain.

**Phase 2 (When R travels): VPS-hosted**
- Same dashboard, deployed on a VPS behind Tailscale
- R accesses it via Tailscale IP from any device
- Migration steps:
  1. R provisions a small VPS (€4/mo Hetzner)
  2. Install Tailscale on VPS, join R's tailnet
  3. Deploy Mission Control as a simple web app on the VPS
  4. Happy pushes dashboard data to VPS via SSH (over Tailscale) instead of SCP to R's Mac
  5. SCP to R's Mac becomes backup/archive only
- **No public internet exposure.** Tailscale only. No ports open to the world.

The migration is additive — Phase 1 keeps working while Phase 2 is set up.

---

## Part B: External Products

External products = things we build to sell. Each one gets full isolation.

### The VPS Model

```
Dedicated Mac (Happy)
    ↓ (steers via Discord / SSH over Tailscale)
    ↓
[VPS: Project Alpha]  ←→  GitHub (private repo)
[VPS: Project Beta]   ←→  GitHub (private repo)  
[VPS: Project Gamma]  ←→  GitHub (private repo)
```

Each VPS is:
- **Isolated** — compromise of one doesn't touch others or the dedicated Mac
- **Disposable** — can be destroyed and rebuilt from the GitHub repo + a setup script
- **Self-contained** — has its own runtime, dependencies, API keys for that project only

### File Exchange: Dedicated Mac ↔ VPS

- **Default method:** SCP over Tailscale (explicit, per-file transfers)
- **High-volume option (future):** Syncthing scoped to Dedicated Mac ↔ specific VPS only
  - Per-VPS Syncthing folders — VPS instances cannot see each other
  - Only used when SCP becomes too manual for the file volume
  - Syncthing is NEVER configured to touch R's Mac

### VPS Agent Tooling

Each VPS gets a standard base image:

- **Claude Code** (or equivalent coding agent) — needs its own Anthropic API key
- **Node.js + Python** — standard runtimes
- **Git + GitHub CLI** — for code management
- **Discord webhook** — for reporting back to Happy
- **Tailscale** — for secure access from Happy's Mac and R's devices
- **No OpenClaw instance** — VPS agents are task-focused, not general-purpose. Happy steers them via SSH + Discord.

### How VPS Agents Report Back

**Primary channel: Discord project channels**
- Each project gets a Discord channel (e.g., #project-alpha-dev)
- VPS agent posts status updates via webhook: what it built, what it's stuck on, what it needs
- Happy monitors the channel, steers as needed
- R can observe passively or jump in

**Secondary channel: GitHub**
- VPS agent pushes code to GitHub, opens PRs
- Happy reviews PRs (or spawns a review sub-agent)
- Natural audit trail

**Emergency/direct: SSH over Tailscale**
- Happy can SSH into any VPS to inspect, debug, or course-correct
- Fallback, not default

**What does NOT happen:**
- VPS agents do not connect to the dedicated Mac
- VPS agents do not have Tailscale access to the dedicated Mac's IP
- VPS agents do not share credentials across projects
- No inbound connections to the dedicated Mac from VPS

### Dependency Vetting on VPS

The threat model is lower (compromise is contained), but we still vet:
- Security review sub-agent runs on each `npm install` / `pip install` of new packages
- VPS agent reports its dependency list to the project Discord channel
- Happy spot-checks periodically
- If a VPS agent flags something suspicious, it stops and reports

### Isolation Rules

- **No shared databases** between projects
- **No shared API keys** between projects  
- **No shared VPS** between external products (one VPS per project)
- **Project API keys** (Stripe, external services) are provisioned per-project, stored only on that VPS
- **Anthropic API key** for the VPS coding agent — can be a separate key with spend limits per project

---

## Part C: Relationship Between Internal and External

The two tracks are **deliberately separate**.

### They share:
- **GitHub** — both use private repos (different repos, same org)
- **Discord** — both report to Discord (different channels)
- **Happy** — Happy oversees both from the dedicated Mac
- **Security review process** — same vetting agent, same standards

### They do NOT share:
- **Runtime** — internal tools never run on external product VPS, and vice versa
- **Credentials** — internal tool API keys ≠ external product API keys
- **VPS instances** — internal dev VPS is separate from external product VPS
- **Data** — customer data from external products never touches the dedicated Mac or internal tools

### The handoff point:
1. Happy writes the spec + materials on the dedicated Mac
2. Happy pushes spec to a GitHub repo (with R approval per Rule 2)
3. R provisions a VPS
4. Happy SSHs in, sets up the VPS agent with the spec
5. VPS agent builds, reports via Discord
6. Happy steers, reviews, course-corrects
7. Product ships from the VPS (or deploys to Cloudflare/Vercel/etc.)

At no point does product code or customer data flow back to the dedicated Mac.

---

## Appendix A: VPS Provisioning — Hybrid Model (Confirmed)

R confirmed **Option 3: Hybrid.** Manual provisioning first, API key later when/if it becomes a bottleneck.

- R logs into Hetzner, creates the server, gives Happy the SSH key
- Cloud credentials never touch the dedicated Mac
- When running 5+ concurrent projects, revisit API access with spend limits

---

## Appendix B: Cloud Provider — Hetzner (Confirmed)

**Hetzner Cloud.** €4-8/mo per project VPS. Simple API. EU-based.

**Budget estimate:**
- 1-3 active projects: €12-24/mo total
- 5 active projects: €20-40/mo total
- Dev VPS for internal tools: €4-8/mo

---

## Appendix C: Blockers and Conflicts

### Blocker 1: GitHub push requires R approval (Rule 2)
Internal tools: Rule 2 applies. External products: VPS agents push freely, Happy reviews PRs. **No conflict.**

### Blocker 2: Credential exposure audit findings
The 2026-03-05 audit found 2 CRITICAL + 2 HIGH findings with remediations pending. These should be resolved before expanding the infrastructure. **Phase 0 prerequisite.**

### Blocker 3: VPS SSH keys
When R provisions a VPS manually, Happy needs the SSH private key on the dedicated Mac. Lower risk than cloud API keys (one server vs unlimited). **Acceptable risk.**
