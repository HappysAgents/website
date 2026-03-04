# Secure Build & Ship Environment — Architecture Plan
*Written: 2026-03-04. Pending R approval and security review before implementation.*

---

## The Problem

Right now, if Happy or a Dev Agent needs to `npm install` something to build Mission Control or any other product, it runs directly on the MacBook M1. If a malicious package is installed — even by accident — it has access to:
- The OpenClaw workspace (MEMORY.md, all agent files)
- The Telegram bot token
- Any API keys in environment variables
- The filesystem of the whole machine

This is the blast radius we need to eliminate before we start building products.

---

## The Goal

Any code building, dependency installation, or product execution happens in an **isolated environment** that is:
1. Separated from the MacBook filesystem
2. Destroyable and recreatable in minutes
3. Unable to reach OpenClaw's config, memory, or API keys even if compromised
4. Cheap enough to run continuously (target: <€20/mo total)

---

## Recommended Architecture: Two-Layer Isolation

### Layer 1 — Local Dev Sandbox: OrbStack (Docker on MacBook)

**What it is:** OrbStack is a lightweight Docker runtime for macOS M1/M2. Drop-in replacement for Docker Desktop — faster, lighter, uses ~3x less RAM and CPU.

**How we use it:**
- Every product/project gets its own Docker container
- Dev Agent works **inside the container** — all `npm install`, `pip install`, builds, etc. happen in there
- Container has NO access to: OpenClaw workspace, `~/.openclaw/`, API keys
- Container mounts ONLY the specific project folder (e.g., `projects/mission-control/`)
- Container is ephemeral — destroy and recreate cleanly after any suspicious install

**Cost:** Free (OrbStack is free for personal use; $8/mo for commercial — we likely qualify as commercial)

**Security boundary:**
```
MacBook (OpenClaw, memory, API keys)
    ↕ one-way volume mount (project code only)
Docker container (npm install, builds, test execution)
    ↕ NO ROUTE to OpenClaw config
```

---

### Layer 2 — Remote Execution: Hetzner VPS

**What it is:** A cheap ARM-based cloud server — completely separate machine from the MacBook. Products run here in production.

**Why Hetzner:**
- €3.49-4.50/mo for entry ARM VPS (CAX11: 2 vCPU ARM, 4GB RAM, 40GB SSD)
- 20TB bandwidth included
- Can be destroyed and recreated in minutes via API
- Located in EU (Frankfurt/Helsinki) — GDPR-friendly
- Better performance-per-euro than AWS/GCP/DigitalOcean

**How we use it:**
- Each product in production gets its own VPS (or Docker container on a shared VPS)
- VPS has NO access to the MacBook or OpenClaw
- If compromised: `hcloud server delete mission-control` + redeploy from GitHub. Done.
- Hetzner API key stored only in GitHub Actions secrets — not on the MacBook

---

### Layer 3 — CI/CD: GitHub Actions

**The only exit from container → production is git commit + GitHub Actions.**

Flow:
```
Dev Agent writes code inside Docker container
        ↓
git commit + push to GitHub (the only exit)
        ↓
GitHub Actions: build + test + security lint
        ↓
Deploy to Cloudflare Workers (websites) or Hetzner VPS (services)
```

No one — not Happy, not Dev Agent — can deploy directly from the MacBook to production. Git is the chokepoint.

---

## Implementation Steps

### Step 1 — Install OrbStack (MacBook)
```bash
brew install orbstack
# or: download from orbstack.dev
```
Requires: LuLu network approval for orbstack.dev + Docker Hub

### Step 2 — Create project container template
A standard `Dockerfile` for each project type:
```dockerfile
FROM node:22-alpine
WORKDIR /app
# Only /app is mounted from host — nothing else
```

### Step 3 — Set up Hetzner account
- Sign up with happy-agent@agentmail.to
- Create project: "HappysAgents"
- Store Hetzner API token in GitHub Actions secrets (NOT on MacBook)

### Step 4 — Dev Agent workflow spec update
Update `agents/dev-agent.md` with mandatory rule:
> All dependency installs and builds run inside Docker containers only. Never install packages directly on the MacBook.

### Step 5 — Per-product isolation rule
- Each product (Mission Control, etc.) gets its own Docker image
- Container mounts: project source code only
- Container explicitly denied: `~/.openclaw/`, `~/openclaw-workspace/`, all env vars not explicitly passed

---

## What This Solves

| Threat | Without isolation | With this architecture |
|--------|-------------------|------------------------|
| Malicious npm package | Reads OpenClaw memory, exfiltrates API keys | Sees only the project folder, no exit route |
| Compromised Hetzner VPS | N/A — nothing runs remotely | MacBook unaffected; nuke and redeploy |
| Dev Agent mistake | Installs bad package on bare Mac | Container is sandboxed; destroy and recreate |
| Supply chain attack | Full system access | Container-scoped blast radius |

---

## Cost Estimate

| Item | Cost |
|------|------|
| OrbStack | Free (personal) or $8/mo (commercial) |
| Hetzner CAX11 (per product) | €3.49-4.50/mo each |
| GitHub Actions | Free (2,000 min/mo on free tier) |
| **Total for first product** | **~$12-13/mo** |

---

## What Needs R Approval

1. **OrbStack install** — new software on MacBook (install via Homebrew, requires security review)
2. **Hetzner account** — new external service, €3.49+/mo ongoing cost
3. **Hetzner API token** added to GitHub Actions secrets
4. **Dev Agent spec update** — mandatory container rule

---

## Security Audit Scope (for Security Agent)

1. OrbStack: what does it install on macOS? Any kernel extensions? Does it require elevated privileges? Any phone-home behaviour?
2. Container isolation: is a standard Docker volume mount sufficient? Should we use `--read-only` flag + explicit mounts?
3. Hetzner: any concerns with EU-based VPS for our use case? Recommended hardening for a fresh VPS?
4. GitHub Actions: are secrets in GitHub Actions properly isolated? Any supply chain risks in the CI workflow?
5. Alternative considered: macOS Virtualization.framework (Apple's native VM) vs Docker — is one more secure than the other on M1?
6. Is there a risk that OrbStack or Docker itself could be used as an attack surface?
