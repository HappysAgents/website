# Security Architecture Plan — Narrative

**Status:** Draft v1 — awaiting R's review
**Date:** 2026-03-06
**Author:** Happy

---

## TL;DR

Two separate worlds. **Internal tools** (dashboards, automations for us) live on GitHub private repos, built and tested on VPS instances, with outputs delivered to R via Syncthing bridge (outbound only). **External products** (things we sell) each get their own VPS, fully isolated from the dedicated Mac. The dedicated Mac stays lean — it's Happy's brain, not a development machine. No code repos, no running services, no cloud provider credentials. R provisions VPS instances manually until the pattern is proven. Recommended cloud provider: **Hetzner** (cheapest, good API, EU-based). VPS agents report back via Discord webhooks to project-specific channels.

---

## Part A: Internal Tools

Internal tools = things built for us. Mission Control dashboard, data pipelines, automation scripts, internal APIs.

### Data Flow

```
Dedicated Mac (Happy) → generates outputs → bridge-outbox/ (Syncthing, one-way)
                                              ↓
                                    R's personal Mac (reads outputs)
```

Bridge-inbox stays empty. Steering happens via Discord/Telegram — already working, already auditable, no second command surface to secure.

### Where Internal Tool Code Lives

**Recommendation: GitHub private repos. Not the dedicated Mac.**

R said internal tool code could live locally. I'm challenging this — here's why:

1. **Git repos are attack surface.** Git hooks (pre-commit, post-checkout, post-merge) execute automatically. A compromised dependency that modifies `.git/hooks/` runs code inside Ring 2. This is not theoretical — it's a known supply-chain attack vector.

2. **Dependencies expand the blast radius.** Even `npm install` for a local project pulls hundreds of packages into Ring 2. One malicious package = code execution on the dedicated Mac. On a VPS, that same compromise is contained.

3. **The dedicated Mac's value is its cleanliness.** Every repo, every `node_modules/`, every build artifact is another thing that could go wrong. The fewer things on this machine, the harder it is to compromise.

4. **GitHub private repos are already more secure for this use case.** They're isolated from the runtime, have audit logs, access controls, and branch protection. We already use GitHub. No new tooling needed.

**What I'm proposing instead:**

- Internal tool source code → GitHub private repos
- Development + testing → on a VPS (can be a shared "dev VPS" for internal tools, doesn't need one-per-project)
- Deployment → Cloudflare Workers, or the dev VPS itself if it's a backend service
- The dedicated Mac → only workspace files (PARA, agent specs, configs, bridge-outbox). No code repos.

**The one exception:** Small scripts that are part of the OpenClaw workspace itself (agent specs, skills, automation scripts under 100 lines that Happy runs directly). These already live here and that's fine — they're part of the operational config, not "products."

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

### Mission Control — Migration Path

**Phase 1 (Now): Local on R's Mac**
- Happy generates dashboard data → bridge-outbox → Syncthing → R's Mac
- R views it locally (simple HTML file, or a local web app)
- Simplest possible. No servers to maintain.

**Phase 2 (When R travels): VPS-hosted**
- Same dashboard, deployed on a VPS behind Tailscale
- R accesses it via Tailscale IP from any device
- Migration steps:
  1. R provisions a small VPS (€4/mo Hetzner)
  2. Install Tailscale on VPS, join R's tailnet
  3. Deploy Mission Control as a simple web app on the VPS
  4. Happy pushes dashboard data to VPS via SSH (over Tailscale) instead of bridge-outbox
  5. Bridge-outbox becomes backup/archive only
- **No public internet exposure.** Tailscale only. No ports open to the world.

The migration is additive — Phase 1 keeps working while Phase 2 is set up. No big-bang cutover.

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

### VPS Agent Tooling

Each VPS gets a standard base image:

- **Claude Code** (or equivalent coding agent) — needs its own Anthropic API key
- **Node.js + Python** — standard runtimes
- **Git + GitHub CLI** — for code management
- **Discord webhook** — for reporting back to Happy
- **Tailscale** — for secure access from Happy's Mac and R's devices
- **No OpenClaw instance** — VPS agents are task-focused, not general-purpose. Happy steers them via SSH + Discord.

### How VPS Agents Report Back

This was R's open question. Here's the design:

**Primary channel: Discord project channels**
- Each project gets a Discord channel (e.g., #project-alpha-dev)
- VPS agent posts status updates via webhook: what it built, what it's stuck on, what it needs
- Happy monitors the channel, steers as needed
- R can observe passively or jump in

**Secondary channel: GitHub**
- VPS agent pushes code to GitHub, opens PRs
- Happy reviews PRs (or spawns a review sub-agent)
- This creates a natural audit trail

**Emergency/direct: SSH over Tailscale**
- Happy can SSH into any VPS to inspect, debug, or course-correct
- This is the fallback, not the default

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

The two tracks are **deliberately separate**. Here's where they touch — and where they don't:

### They share:
- **GitHub** — both use private repos (different repos, same org)
- **Discord** — both report to Discord (different channels)
- **Happy** — Happy oversees both, but from the dedicated Mac (never from a VPS)
- **Security review process** — same vetting agent, same standards

### They do NOT share:
- **Runtime** — internal tools never run on external product VPS, and vice versa
- **Credentials** — internal tool API keys ≠ external product API keys
- **VPS instances** — internal dev VPS is separate from external product VPS
- **Data** — customer data from external products never touches the dedicated Mac or internal tools

### The handoff point:
When Happy decides to build something (with R's approval), the flow is:
1. Happy writes the spec + materials on the dedicated Mac
2. Happy pushes spec to a GitHub repo
3. R provisions a VPS
4. Happy SSHs in, sets up the VPS agent with the spec
5. VPS agent builds, reports via Discord
6. Happy steers, reviews, course-corrects
7. Product ships from the VPS (or deploys to Cloudflare/Vercel/etc.)

At no point does product code or customer data flow back to the dedicated Mac.

---

## Appendix A: VPS Provisioning — API Access vs Manual (Q2 Analysis)

R asked me to break this down. Here are the three options in plain language:

### Option 1: Happy gets cloud API credentials

**What it means:** R gives Happy login credentials for Hetzner/DO that let Happy create, destroy, and manage servers programmatically. Happy stores these credentials on the dedicated Mac.

**Pros:**
- ⚡ Fast — Happy can spin up a new project VPS in minutes, no waiting for R
- 🔄 Reproducible — Happy can script the exact setup, same every time
- 📈 Scales — when we're running 5+ projects, manual provisioning becomes a bottleneck

**Cons:**
- 🔐 New credential class on the dedicated Mac — cloud API keys can create servers, which cost money
- 💸 Runaway spend risk — a bug or compromise could spin up expensive servers
- 🎯 Expands attack surface — if the dedicated Mac is compromised, attacker can provision infrastructure

**Risk mitigation if we choose this:**
- Spend alerts + hard monthly cap at the provider level
- API key with minimal permissions (create/destroy servers only, no billing changes)
- Approval gate: Happy proposes the VPS spec, R approves, then Happy provisions

### Option 2: R provisions manually

**What it means:** R logs into Hetzner/DO, creates the server, gives Happy the SSH key. Cloud credentials never touch the dedicated Mac.

**Pros:**
- 🔒 Cleanest security — no cloud credentials on the dedicated Mac at all
- 💰 Full spend control — R sees every dollar before it's committed
- 🧱 Smallest attack surface

**Cons:**
- 🐌 Slower — every new project waits for R to provision
- 🔄 Manual repetition — R does the same steps each time
- ⏰ Blocks Happy when R is sleeping/traveling/busy

### Option 3: Hybrid (recommended)

**What it means:** R provisions manually for the first 3-5 projects. Once the pattern is stable and predictable, R sets up a restricted API key with spend limits if/when the manual process becomes a bottleneck.

**Pros:**
- Gets the security benefits of Option 2 during the learning phase
- Gets the speed benefits of Option 1 once trust is established
- Natural evaluation point — if we never hit the bottleneck, we never need the API key

**Cons:**
- Requires a deliberate decision point later (which R might forget — Happy will remind)

**My recommendation: Option 3.** Start manual. We're not running 10 projects yet. The bottleneck is theoretical. When it becomes real, we'll have enough pattern data to set up the API key safely.

**⚠️ DECISION NEEDED:** R picks Option 1, 2, or 3.

---

## Appendix B: Cloud Provider Comparison (Q3 Analysis)

Evaluated for: agent-friendliness (API quality, CLI, automation), cost, and suitability for isolated project VPS instances.

### Hetzner Cloud ⭐ Recommended

| Factor | Detail |
|--------|--------|
| **Cost** | CX22 (2 vCPU, 4GB RAM): **€4.35/mo**. CX32 (4 vCPU, 8GB): €7.69/mo. Cheapest serious provider. |
| **API** | Full REST API. Official CLI (`hcloud`). Terraform provider. All operations scriptable. |
| **Agent-friendliness** | Excellent. API is simple, well-documented, no surprises. Server creation takes ~30 seconds. |
| **Location** | EU (Germany, Finland, US). Good for GDPR compliance. |
| **Drawbacks** | Smaller ecosystem than AWS/DO. No managed databases (but we don't need them yet). |
| **Verdict** | Best price-to-performance. Perfectly adequate API. EU-based = good default for privacy. |

### DigitalOcean

| Factor | Detail |
|--------|--------|
| **Cost** | Basic droplet (2 vCPU, 2GB RAM): **$12/mo**. 4GB RAM: $24/mo. ~2-3x Hetzner. |
| **API** | Excellent REST API. `doctl` CLI is polished. Great documentation. |
| **Agent-friendliness** | Best-in-class docs + API. Slightly easier than Hetzner for first-time automation. |
| **Location** | US, EU, Asia-Pacific. Broad coverage. |
| **Drawbacks** | Significantly more expensive for equivalent specs. |
| **Verdict** | Best developer experience, but the price premium doesn't justify it when Hetzner works fine. |

### Vultr

| Factor | Detail |
|--------|--------|
| **Cost** | Cloud Compute (2 vCPU, 4GB RAM): **$24/mo**. Cheaper "Cloud GPU" tier exists for ML. |
| **API** | Decent REST API. CLI exists but less polished. |
| **Agent-friendliness** | Adequate but not as smooth as Hetzner or DO. |
| **Verdict** | No clear advantage over Hetzner. Skip. |

### AWS / GCP / Azure

| Factor | Detail |
|--------|--------|
| **Cost** | Comparable specs: **$20-40/mo** + data transfer + hidden costs. |
| **Agent-friendliness** | Powerful but complex. 100+ services, IAM policies, billing surprises. |
| **Verdict** | Massive overkill for isolated project VPS. Complexity is a liability, not an asset, at our stage. |

### Recommendation

**Hetzner Cloud.** €4-8/mo per project VPS. Simple API. EU-based. When we need managed databases or CDN, we can layer in Cloudflare (already using it) or upgrade specific projects. No need to start with a complex provider.

**Budget estimate:**
- 1-3 active projects: €12-24/mo total
- 5 active projects: €20-40/mo total
- Dev VPS for internal tools: €4-8/mo

**⚠️ DECISION NEEDED:** R confirms Hetzner (or picks alternative).

---

## Appendix C: Blockers and Conflicts

### Blocker 1: GitHub push requires R approval (Rule 2)
Every push to GitHub needs R's explicit approval. For active development on VPS, the VPS agent pushes to GitHub directly — this is fine (VPS agents aren't bound by Rule 2 the same way, since they're operating in their isolated environment). Happy pushing specs/materials to GitHub from the dedicated Mac still needs approval. **No conflict — just flagging the workflow.**

### Blocker 2: Credential exposure audit findings
The 2026-03-05 audit found 2 CRITICAL + 2 HIGH findings with remediations pending. These should be resolved before expanding the infrastructure. **This is a prerequisite for the checklist.**

### Blocker 3: VPS SSH keys
When R provisions a VPS manually, Happy needs the SSH private key on the dedicated Mac to connect. This is a new credential class, but it's lower risk than cloud API keys (SSH key = access to one server, cloud API key = access to create unlimited servers). **Acceptable risk, but worth noting.**
