# Security Review: Secure Build & Ship Environment
*Reviewed: 2026-03-04*
*Plan reviewed: memory/projects/dev-infrastructure/secure-build-environment-plan.md*

## Verdict: ⚠️ CAUTION — changes needed

## Summary

The architecture is **fundamentally sound** — two-layer isolation (local containers + remote VPS) with GitHub Actions as the only deploy path is a strong design for this threat model. However, the plan underspecifies container hardening flags, has a gap in the Tailscale/VPN reverse-path threat, and the GitHub Actions supply chain risk needs explicit mitigations. With the required changes below, this is approved for implementation.

---

## Finding by Finding

### 1. OrbStack Security Posture — 🟢 LOW RISK

**What it installs:**
- OrbStack uses Apple's **Virtualization.framework** (the same hypervisor Apple uses internally). It does NOT install kernel extensions (kexts) and does NOT require SIP bypass. This is a critical advantage over older Docker solutions.
- It runs a lightweight Linux VM with a shared kernel. Components are written in Swift, Go, Rust, and C — purpose-built, not cobbled from off-the-shelf tools.
- Internal services are protected by a firewall within the VM to prevent untrusted container code from tampering with OrbStack itself.
- On Apple Silicon, it augments KASLR without the overhead of KPTI mitigations.

**Phone home / telemetry:**
- OrbStack contacts `api.orbstack.dev` for license verification (required).
- `api-updates.orbstack.dev` for update checks (optional).
- `ingest.sentry.io` for anonymous crash reports (optional).
- The privacy policy reserves the right to add opt-out telemetry in the future, but it is **not currently implemented** (confirmed by OrbStack developer in GitHub Discussion #234).
- LuLu will catch and alert on all of these connections — manageable.

**Elevated privileges:**
- OrbStack does NOT require admin/root to run containers. It installs to user space. The VM runs under the user's UID via Virtualization.framework.
- The `dirtyagent` standard (non-admin) user should be able to run it, though initial install via Homebrew may need admin credentials for the cask.

**Verdict:** OrbStack is trustworthy for a security-conscious M1 Mac. No kernel extensions, no SIP bypass, uses Apple's own hypervisor, minimal telemetry. The Virtualization.framework boundary is a meaningful isolation layer.

---

### 2. Container Isolation Strength — 🟡 MEDIUM RISK (needs hardening flags)

**The plan as written is insufficient.** A bare `docker run` with a bind mount is the minimum viable isolation, but leaves significant attack surface:

**What a malicious package CAN do in an unhardened container:**
- Read/write anything in the mounted project folder
- Make outbound network connections (exfiltrate code, phone home to C2)
- Escalate privileges within the container (if capabilities aren't dropped)
- Exploit kernel vulnerabilities to escape to the VM (rare but real — see CVE-2025-9074 below)

**macOS + OrbStack escape risk:**
- On macOS, container escape goes: container → Linux VM → Virtualization.framework boundary → macOS. This is **two boundaries**, not one (unlike Linux Docker where escape = host access directly).
- CVE-2025-9074 (Aug 2025, CVSS 9.3) was a critical Docker Desktop container escape via unauthenticated Docker Engine API access from within containers. It affected Docker Desktop on Windows and Mac but was patched in Docker 4.44.3. **OrbStack uses its own Docker engine, not Docker Desktop's**, so this specific CVE didn't directly apply, but the class of attack (API access from container) is relevant.
- The realistic risk on macOS + OrbStack is LOW for a motivated attacker escaping to macOS, but the container itself can still do damage (network exfiltration, crypto mining, code theft) without escaping.

**Required:** See "Recommended Container Template" below for exact hardening flags.

---

### 3. Apple Containers (Virtualization.framework native) — 🟡 MONITOR, DON'T WAIT

**What Apple announced (WWDC 2025):**
- Native containerization framework shipping with **macOS 26 (Tahoe)** — likely fall 2026.
- **VM-per-container architecture** — each container gets its own lightweight VM. This is stronger isolation than Docker's shared-kernel model.
- Sub-second startup times despite VM overhead (optimized Linux kernel).
- Open source, Apple Silicon only.
- Full networking requires macOS 26; partial functionality on macOS 15 (Sequoia).

**Security comparison:**
- Apple Containers: **hypervisor-level isolation per container** — strictly superior to Docker's namespace isolation.
- OrbStack: all containers share one Linux VM kernel — a kernel escape compromises all containers.
- Apple Containers: no third-party trust required (Apple maintains the runtime).

**Why not wait:**
- macOS 26 Tahoe isn't GA yet. Current MacBook is likely on macOS 15 Sequoia.
- Apple Containers is very new — limited ecosystem tooling, no docker-compose equivalent, limited OCI image support testing.
- OrbStack works today and the Virtualization.framework boundary already provides meaningful isolation.

**Recommendation:** Proceed with OrbStack now. Plan migration to Apple Containers when macOS 26 is stable (likely late 2026). The container template flags below work with both. Add a 6-month review trigger.

---

### 4. Hetzner VPS Hardening — 🟡 MEDIUM RISK (needs explicit checklist)

The plan mentions Hetzner but provides zero hardening steps. A fresh Ubuntu VPS is internet-exposed by default.

**Minimum hardening checklist (must implement before any production traffic):**

```bash
# 1. Create non-root user with sudo
adduser deploy
usermod -aG sudo deploy

# 2. SSH hardening — /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers deploy
# Only ed25519 keys (consistent with Tailscale setup)

# 3. Firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH (restrict to Tailscale IP if possible)
ufw allow 80/tcp    # HTTP (if serving web)
ufw allow 443/tcp   # HTTPS
ufw enable

# 4. Fail2ban
apt install fail2ban
systemctl enable fail2ban
# Default config is usually sufficient for SSH

# 5. Automatic security updates
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 6. Disable unused services
systemctl disable --now snapd  # if present

# 7. Kernel hardening (sysctl)
echo "net.ipv4.conf.all.rp_filter = 1" >> /etc/sysctl.d/99-hardening.conf
echo "net.ipv4.conf.default.rp_filter = 1" >> /etc/sysctl.d/99-hardening.conf
echo "net.ipv4.icmp_echo_ignore_broadcasts = 1" >> /etc/sysctl.d/99-hardening.conf
echo "net.ipv4.conf.all.accept_redirects = 0" >> /etc/sysctl.d/99-hardening.conf
echo "net.ipv4.conf.all.send_redirects = 0" >> /etc/sysctl.d/99-hardening.conf
echo "kernel.randomize_va_space = 2" >> /etc/sysctl.d/99-hardening.conf
sysctl --system
```

**Additional considerations:**
- If Tailscale is installed on the VPS: restrict SSH to Tailscale interface only (`ufw allow in on tailscale0 to any port 22`)
- Hetzner API token: store ONLY in GitHub Actions secrets, never on MacBook. If compromised, attacker can create/destroy servers on your account.
- Consider Hetzner firewall rules (network-level, applied before packets reach the VPS) as an additional layer.
- EU location (Frankfurt/Helsinki) is fine for GDPR. No concerns.

---

### 5. GitHub Actions Secret Isolation — 🔴 HIGH RISK (supply chain is real)

**Are GitHub Actions secrets safe?** Conditionally, but the supply chain risk is severe and well-documented.

**How secrets work:**
- Secrets are encrypted at rest, masked in logs, and available only to workflows in the repo.
- Fork PRs do NOT get access to secrets (by default) — good.
- Secrets are exposed as environment variables during workflow runs.

**The real threat — supply chain attacks on Actions:**
- **tj-actions/changed-files (CVE-2025-30066, March 2025):** Attackers compromised a GitHub Action used by 23,000+ repos. They modified version tags to reference malicious code that dumped ALL workflow secrets (GitHub PATs, npm tokens, private keys) to attacker-controlled servers. CISA issued an alert.
- **GhostAction Campaign (Sept 2025):** 3,325 secrets stolen through compromised GitHub workflows.
- **The attack pattern:** Compromise a popular third-party Action → it runs in YOUR workflow with YOUR secrets → exfiltrate everything.

**Required mitigations:**
1. **Pin ALL third-party Actions to full commit SHA** — never use `@v3` or `@main` tags (tags can be moved to malicious commits):
   ```yaml
   # BAD:
   uses: actions/checkout@v4
   # GOOD:
   uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
   ```
2. **Minimize secrets scope:** Use environment-level secrets, not repo-level, where possible.
3. **Use `permissions` key** to restrict `GITHUB_TOKEN` scope per job:
   ```yaml
   permissions:
     contents: read
     # Only add what's needed
   ```
4. **Prefer first-party Actions** (actions/checkout, actions/setup-node, etc.) over third-party.
5. **Enable Dependabot alerts** for Actions in the repo.
6. **Consider using OpenID Connect (OIDC)** for cloud deployments instead of long-lived API tokens.

---

### 6. Threat Model Gap Analysis — 🔴 CRITICAL GAP IDENTIFIED

**Gap: Tailscale reverse path from compromised VPS to MacBook**

The plan states: "VPS has NO access to the MacBook or OpenClaw." But:
- If Tailscale is installed on both the MacBook and the VPS, they are on the **same Tailscale network**.
- A compromised VPS with Tailscale could potentially reach the MacBook's Tailscale IP.
- Tailscale ACLs can mitigate this, but the plan doesn't mention configuring them.

**Recommendation:** Either:
- (a) Do NOT install Tailscale on the Hetzner VPS. Access it only via public IP + SSH keys. OR
- (b) If Tailscale is needed, configure Tailscale ACLs to explicitly DENY VPS → MacBook traffic. Only allow MacBook → VPS.

**Gap: Docker socket exposure**

The plan doesn't address whether the Docker socket (`/var/run/docker.sock`) should be mounted into containers. This is a common misconfiguration that gives containers full control over the Docker engine (create other containers, mount host filesystem, etc.).

**Rule:** NEVER mount the Docker socket into project containers.

**Gap: Network egress from containers**

The plan doesn't restrict outbound network access from containers. A malicious package can freely exfiltrate data to any IP. Consider:
- Using `--network=none` for pure build steps (npm install with pre-fetched packages)
- Using a custom network with egress restrictions for steps that need registry access

**Gap: Image provenance**

The plan uses `node:22-alpine` but doesn't pin the digest. Container images can be compromised (Docker Hub account takeover). Pin images by SHA256 digest:
```dockerfile
FROM node:22-alpine@sha256:<specific-digest>
```

---

### 7. OrbStack vs Docker Desktop — 🟢 OrbStack Preferred

| Factor | OrbStack | Docker Desktop |
|--------|----------|----------------|
| Kernel extensions | None (Virtualization.framework) | None (Virtualization.framework on M1) |
| SIP bypass | Not required | Not required |
| Resource usage | ~3x less RAM/CPU | Heavier |
| Attack surface | Smaller (purpose-built) | Larger (more features = more surface) |
| CVE-2025-9074 | Not directly affected (own engine) | Affected (patched in 4.44.3) |
| Telemetry | Minimal, mostly optional | More extensive (Docker Scout, etc.) |
| Code | Proprietary (small company) | Proprietary (Docker Inc.) |
| Trust model | Single developer (Danny Lin) | Large company |

**Verdict:** OrbStack is preferable on M1 for this use case. Smaller attack surface, less resource usage, same hypervisor boundary. The one risk is trust in a smaller company — but the code uses Apple's Virtualization.framework for the critical isolation boundary, limiting how much damage a compromised OrbStack binary could do.

**Note:** OrbStack is proprietary and closed-source. If open-source is important, Apple Containers (when mature) will be the better choice.

---

### 8. Recommended Container Flags — See Template Below

---

## Required Changes Before Implementation

These are **must-fix** before proceeding:

1. **🔴 Pin GitHub Actions to commit SHAs** — no tag references. Document this as a permanent rule in `agents/dev-agent.md`.

2. **🔴 Address Tailscale VPS ↔ MacBook path** — either don't install Tailscale on VPS, or configure ACLs to deny VPS → MacBook.

3. **🔴 Use hardened container template** (below) — bare `docker run` with just a bind mount is insufficient.

4. **🔴 VPS hardening checklist** — must be scripted and applied on first boot. See Finding #4.

5. **🔴 Pin base Docker images by SHA256 digest** — not just tag.

6. **🟡 Never mount Docker socket** — add explicit rule to `agents/dev-agent.md`.

---

## Recommended Hardening

Good-to-have improvements:

1. **Network egress restriction** — Use `--network=none` for offline build steps. Create a custom Docker network with iptables rules for steps that need registry access:
   ```bash
   # Create restricted network allowing only npm/PyPI registries
   docker network create --driver bridge restricted-build
   # Add iptables rules on the host (inside OrbStack VM) to restrict egress
   ```

2. **Read-only `/tmp`** — Mount a tmpfs for `/tmp` instead of using the container's writable layer:
   ```bash
   --tmpfs /tmp:rw,noexec,nosuid,size=512m
   ```

3. **Container scanning** — Run `docker scout` or `trivy` on images before use:
   ```bash
   trivy image node:22-alpine
   ```

4. **Git signing** — Enable commit signing for the deploy workflow to prevent commit injection.

5. **Hetzner firewall** — Use Hetzner's cloud firewall (free, network-level) in addition to UFW on the VPS.

6. **Secrets rotation schedule** — Hetzner API token and GitHub tokens should be rotated every 90 days.

7. **6-month review trigger** — Reassess Apple Containers maturity in September 2026. If macOS 26 is stable, plan migration for stronger per-container VM isolation.

---

## Recommended Container Template

Standard `docker run` for maximum isolation of build/dev containers:

```bash
docker run \
  --rm \
  --name project-build \
  --read-only \
  --no-new-privileges \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --security-opt seccomp=default \
  --pids-limit 256 \
  --memory 2g \
  --memory-swap 2g \
  --cpus 2 \
  --tmpfs /tmp:rw,noexec,nosuid,size=512m \
  --tmpfs /app/node_modules:rw,exec,size=2g \
  -v /path/to/project:/app:rw \
  -w /app \
  node:22-alpine@sha256:<pinned-digest> \
  sh -c "npm ci && npm run build"
```

**Flag explanations:**
| Flag | Purpose |
|------|---------|
| `--rm` | Auto-remove container on exit (no stale containers) |
| `--read-only` | Root filesystem is read-only (prevents writes outside mounts) |
| `--no-new-privileges` | Prevents privilege escalation via setuid/setgid |
| `--cap-drop ALL` | Drops ALL Linux capabilities (no raw sockets, no mount, etc.) |
| `--security-opt seccomp=default` | Applies Docker's default seccomp profile (blocks ~44 dangerous syscalls) |
| `--pids-limit 256` | Prevents fork bombs |
| `--memory 2g --memory-swap 2g` | Prevents OOM impact on host (swap=memory means no swap) |
| `--cpus 2` | Prevents CPU starvation of host |
| `--tmpfs /tmp` | Writable tmp with noexec (can't execute downloaded binaries from /tmp) |
| `--tmpfs /app/node_modules` | Writable space for npm install (since root fs is read-only) |
| `-v /path/to/project:/app:rw` | ONLY the project folder is mounted |

**For interactive dev shells**, add:
```bash
  -it \
  --tmpfs /home/node:rw,size=256m \
```

**NEVER include these flags:**
- `--privileged` (disables ALL security features)
- `-v /var/run/docker.sock:/var/run/docker.sock` (full Docker engine access)
- `--cap-add SYS_ADMIN` (near-root capabilities)
- `--network host` (bypasses network isolation)
- `--pid host` (can see/signal host processes)

---

## Approved As-Is

These elements of the plan are sound and need no changes:

1. ✅ **Two-layer architecture** (local container + remote VPS) — excellent separation of dev and prod
2. ✅ **GitHub Actions as sole deploy path** — good chokepoint, auditable, no direct MacBook → prod
3. ✅ **OrbStack as Docker runtime** — good choice for M1, better than Docker Desktop for this use case
4. ✅ **Hetzner ARM VPS selection** — good price/performance, EU-based, easily destroyable
5. ✅ **Ephemeral container philosophy** — destroy and recreate on suspicion
6. ✅ **Cost model** — €12-13/mo is very reasonable for the isolation gained
7. ✅ **Per-project container isolation** — correct approach, each product gets its own image
8. ✅ **Dev Agent spec update** requiring container-only installs — critical policy control
