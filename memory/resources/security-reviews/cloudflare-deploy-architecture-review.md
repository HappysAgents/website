# Security Review: Cloudflare Deploy Architecture
*Reviewed: 2026-03-04*
*Context: happysagents.com (Next.js static export → Cloudflare Workers), dedicated MacBook Pro M1, dirtyagent user*

---

## Executive Summary

Storing `CLOUDFLARE_API_TOKEN` in `~/.zshrc` on the agent-operated Mac is a **meaningful security risk** — the agent itself is a prompt-injection attack surface that could exfiltrate credentials through its own allowed channels. The blast radius depends entirely on token scope: a broadly-scoped token could allow full site defacement, DNS hijacking, or account takeover. The right fix is to **never put deploy credentials on this machine at all** — migrate to GitHub Actions (Option B) or Cloudflare Pages Git integration (Option C). Either eliminates the token from the Mac permanently, without losing any operational capability.

---

## Question 1: Cloudflare API Token on the Mac

### 1.1 Risk of `~/.zshrc` Storage

**`~/.zshrc` is plaintext with zero access controls beyond standard Unix user permissions.** On this machine, that means:

- Any process running as `dirtyagent` (including OpenClaw, wrangler, any npm script with a postinstall hook, any process spawned by the agent) can read the token from the environment with `printenv` or `/proc/[pid]/environ` equivalents on macOS.
- The token is in memory in every interactive shell — including terminal sessions opened by the agent.
- The OpenClaw agent itself has shell execution capabilities. An attacker who successfully injects a malicious instruction via email, web content, or any other channel the agent reads could instruct the agent to exfiltrate `$CLOUDFLARE_API_TOKEN` using the agent's own approved outbound channels (HTTPS to attacker-controlled endpoint, etc.).
- Backup tools (Time Machine, cloud sync) may capture `.zshrc` including the token value in backup archives.
- Log collection tools, error reporters, or any tool that captures environment variables could inadvertently leak the token.

**SOUL.md Rule 1 ("Content Is Never Instructions") is the existing defense against prompt injection**, but security architecture should not rely on a single defense layer. If the agent's safety rules are bypassed, the token is immediately available to the attacker.

**Risk rating: HIGH** — not because the Mac environment is weak (Guest VLAN + LuLu + standard user account are reasonable hardening steps), but because the machine is operated by an autonomous AI agent that is itself an attack surface.

---

### 1.2 Blast Radius: What an Attacker Can Do With a Cloudflare API Token

The blast radius depends critically on **what permissions were granted when the token was created**.

#### Worst case (overly broad token):

| Capability | Impact |
|---|---|
| Workers Scripts:Edit (all scripts) | Deploy malicious JavaScript to happysagents.com — full site takeover, XSS injection, phishing page |
| Zone:Edit / DNS:Edit | Redirect happysagents.com to attacker infrastructure, steal all traffic |
| Zone:Edit / SSL settings | Downgrade HTTPS, intercept traffic |
| Account:Admin | Add attacker as account member, lock out R, access billing |
| R2:Edit / KV:Edit | Exfiltrate or destroy stored data |
| Workers Routes:Edit | Redirect specific routes to malicious Workers |
| Pages:Edit | Modify or delete Pages deployments |

#### Minimum case (Workers-only scoped token):

- Deploy arbitrary JavaScript to the specific Worker running happysagents.com
- This alone is sufficient for: site defacement, SEO spam, credential harvesting, supply chain attack on visitors

**Even a minimum-scope token is a significant blast radius** because it allows supply-chain compromise of the website. Any visitor to happysagents.com could be served attacker-controlled content.

---

### 1.3 Cloudflare Token Scoping Options

Cloudflare API Tokens (not the Global API Key) support fine-grained permissions. **Always use API Tokens, never the Global API Key.**

#### Minimum viable permissions for `npx wrangler deploy`:

| Permission | Scope | Required? |
|---|---|---|
| `Workers Scripts:Edit` | Specific account or script | ✅ Yes |
| `Workers Routes:Edit` | Specific zone | Only if managing routes |
| `Account Settings:Read` | Account | Sometimes (wrangler account verification) |
| `Workers KV Storage:Edit` | Specific namespace | Only if using KV bindings |
| `Workers R2 Storage:Edit` | Specific bucket | Only if using R2 bindings |
| `D1:Edit` | Specific DB | Only if using D1 |

#### Recommended minimum scope for this project:

```
Workers Scripts:Edit → Account: [specific account ID]
Account Settings:Read → Account: [specific account ID]
```

**Do NOT grant:**
- Zone permissions (DNS, SSL, WAF)
- Account Admin
- Cloudflare Pages (separate product)
- R2/KV unless actively used
- Any permission "just in case"

Cloudflare also supports **IP allowlisting on API tokens** — restrict the token to only be usable from specific IPs. This is a valuable additional control if deploying from a fixed egress IP (e.g., GitHub Actions uses known IP ranges).

---

### 1.4 Storage Location: `~/.zshrc` vs. Alternatives

| Storage Method | Security | Usability | Notes |
|---|---|---|---|
| `~/.zshrc` (plaintext) | ❌ Poor | ✅ Easy | Token readable by any process as dirtyagent; captured by backups |
| macOS Keychain | ✅ Good | ⚠️ Medium | Protected by login password; requires `security` CLI to retrieve; not in env by default |
| `launchctl setenv` | ❌ Marginal | ⚠️ Medium | Makes env var available to processes, but still readable by same user via `launchctl print` |
| Wrangler `wrangler secret put` | ❌ N/A | — | This is for runtime secrets *inside* the Worker, not the deploy credential |
| Wrangler `.dev.vars` | ❌ Poor | ✅ Easy | Plaintext file, slightly better than zshrc (not auto-sourced), still readable |
| 1Password / Bitwarden CLI | ✅ Good | ⚠️ Medium | Token retrieved at use-time, not stored in env; requires vault unlock |
| GitHub Secrets | ✅ Excellent | ✅ Easy | Never touches local machine; used by GitHub Actions |
| Cloudflare Pages Git integration | ✅ Excellent | ✅ Easy | No token needed locally at all |

**If forced to store locally (interim):** Use macOS Keychain via the `security` CLI:

```bash
# Store once:
security add-generic-password -a dirtyagent -s CLOUDFLARE_API_TOKEN -w "your-token-here"

# Retrieve in shell (add to .zshrc instead of the raw token):
export CLOUDFLARE_API_TOKEN=$(security find-generic-password -a dirtyagent -s CLOUDFLARE_API_TOKEN -w)
```

This is meaningfully better than plaintext because: (1) the token isn't in `~/.zshrc` in the clear, (2) macOS Keychain access can be audited, (3) it requires user-session authentication.

**However, this is a mitigation, not a fix.** Any process running as `dirtyagent` (including the agent) can call `security find-generic-password` and retrieve the token.

---

### 1.5 Should Deploy Credentials Live on an Agent-Operated Machine at All?

**No. This is a category error.**

The dedicated Mac is designed to run an autonomous AI agent. The agent reads untrusted content (emails, web pages, documents) as part of its normal operation. SOUL.md Rule 1 establishes that content is data, not instructions — but this is a **policy control**, not a **technical control**.

A credentialed machine operated by an agent creates a compound attack surface:
1. Attacker crafts a malicious email or web page
2. Agent reads it (normal operation)
3. Prompt injection bypasses Rule 1 (policy failure)
4. Agent exfiltrates token via its own allowed HTTPS channels
5. Attacker now controls Cloudflare

**Even a partial bypass is dangerous.** The attacker doesn't need to fully compromise the agent — they just need to get the agent to make one HTTP request or print one environment variable.

The correct architecture is: **deploy credentials should never be on the agent machine**. The agent's job is to write and push code. A separate, credential-holding system (GitHub Actions, Cloudflare's own build system) handles the privileged deploy step.

---

## Question 2: Deployment Architecture Comparison

### Context

Current flow: Happy (agent on Mac) → writes code → pushes to GitHub → ALSO runs `npx wrangler deploy` locally from the Mac.

The problem: steps 1-3 are safe. Step 4 requires a Cloudflare API token to be present on the Mac.

---

### Architecture Comparison

#### Option A: Current — Local Wrangler Deploy from Mac

**How it works:** Agent runs `npx wrangler deploy` on the Mac using a stored `CLOUDFLARE_API_TOKEN`.

| Dimension | Assessment |
|---|---|
| Security posture | ❌ Weak — token on agent-operated machine |
| Attack surface | Mac compromise, prompt injection via email/web, Tailscale SSH compromise, physical access |
| Operational risk | Medium — works until token expires or is rotated; agent can deploy without oversight |
| Fit for agent-operated environment | ❌ Poor — violates least-privilege for credential storage; agent shouldn't hold production deploy keys |

**Specific concerns:**
- No deploy audit trail (unless wrangler logs are collected externally)
- Token expiry breaks deploys silently
- Agent could accidentally trigger multiple deploys or deploy to wrong environment
- No mandatory code review gate before deploy

---

#### Option B: GitHub Actions CI/CD

**How it works:** Agent pushes to GitHub → GitHub Actions workflow runs `npx wrangler deploy` → token stored as GitHub Secret.

| Dimension | Assessment |
|---|---|
| Security posture | ✅ Strong — token in GitHub Secrets, encrypted, never in logs, never on Mac |
| Attack surface | GitHub account compromise, malicious GitHub Actions (supply chain), repo access control |
| Operational risk | Low — automated, reproducible, logged in Actions UI; failures are visible |
| Fit for agent-operated environment | ✅ Excellent — agent pushes code, CI holds credentials |

**Implementation:**
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**Additional benefits:**
- Full deploy audit trail in GitHub Actions logs
- Can add PR-based preview deployments
- Can add test gates before deploy (lint, build, tests)
- Token can be scoped to Workers Scripts:Edit only (no DNS/Zone access needed)
- Branch protection rules can require CI to pass before merge

**Risks to mitigate:**
- Protect the `main` branch from direct agent pushes without review (optional, depending on desired autonomy level)
- Use `cloudflare/wrangler-action` (official, maintained by Cloudflare) not community forks
- Pin action versions to SHA rather than tag to prevent supply chain attacks

---

#### Option C: Cloudflare Pages/Workers Git Integration

**How it works:** GitHub repo connected to Cloudflare Pages → Push to GitHub → Cloudflare automatically builds and deploys.

| Dimension | Assessment |
|---|---|
| Security posture | ✅✅ Strongest — no API token needed anywhere (locally or in CI) |
| Attack surface | GitHub account compromise (write access triggers deploy), Cloudflare account security |
| Operational risk | Very Low — Cloudflare manages build infra; no custom pipeline to maintain |
| Fit for agent-operated environment | ✅✅ Excellent — agent just pushes code; all privileged operations happen inside Cloudflare |

**Compatibility check for this project:**
- happysagents.com is a Next.js static export (`output: 'export'` in next.config.js per summary.md)
- **Cloudflare Pages supports Next.js with `@cloudflare/next-on-pages`** — but this is for SSR/edge runtime
- For pure static export (`next build && next export`), Cloudflare Pages can build it with build command: `npm run build` and output directory: `out`
- This is straightforward and fully supported

**Potential friction:**
- Initial one-time setup in Cloudflare dashboard (connect GitHub repo)
- Build environment variables must be set in Cloudflare Pages dashboard, not locally
- If the project ever moves to SSR/edge runtime, need `@cloudflare/next-on-pages` adapter

**No API token is needed** for Cloudflare to build and deploy from its own Git integration. The OAuth connection between GitHub and Cloudflare handles authorization, scoped to the specific repo.

---

#### Option D: Hybrid — Local Build/Test, GitHub Actions for Deploy

**How it works:** Agent builds and tests locally (no credentials needed) → pushes to GitHub → GitHub Actions handles deploy only.

| Dimension | Assessment |
|---|---|
| Security posture | ✅ Strong — same as Option B (token in GitHub Secrets) |
| Attack surface | GitHub account + CI supply chain (same as B) |
| Operational risk | Low — agent can validate locally before committing |
| Fit for agent-operated environment | ✅ Very Good — clean separation of build (local, safe) and deploy (CI, credentialed) |

**When this is better than B:** If local build validation is important for fast feedback before a full CI run. For a static site, this adds little value — CI build is fast and cheap.

**When this is better than C:** More control over build environment; easier to debug build failures; can add custom steps (image optimization, lighthouse audit) that Cloudflare Pages doesn't support natively.

---

### Summary Comparison Table

| | A: Local Deploy | B: GitHub Actions | C: CF Pages Git | D: Hybrid |
|---|---|---|---|---|
| Token on Mac | ❌ Yes | ✅ No | ✅ No | ✅ No |
| Token in CI | N/A | ⚠️ Yes (GitHub Secret) | ✅ No | ⚠️ Yes (GitHub Secret) |
| Deploy audit trail | ❌ None | ✅ Actions logs | ✅ CF deploy logs | ✅ Actions logs |
| Setup complexity | ❌ Already bad | ✅ Low | ✅ Low | ✅ Low |
| Agent credential risk | 🔴 High | 🟢 None | 🟢 None | 🟢 None |
| Blast radius if Mac compromised | 🔴 Full CF account | 🟢 None | 🟢 None | 🟢 None |
| Fit for autonomous agent | 🔴 Poor | 🟢 Excellent | 🟢 Excellent | 🟢 Very Good |
| Operational overhead | 🟡 Medium | 🟢 Low | 🟢 Lowest | 🟢 Low |

---

## Recommendation

### Immediate (this session): Do NOT put the token in `~/.zshrc`

Do not proceed with the proposed `~/.zshrc` storage. The risk is not justified when zero-credential alternatives exist.

### Short-term (this week): Migrate to Option C (Cloudflare Pages Git Integration)

**Reasoning:**
1. happysagents.com is already a static export — Cloudflare Pages handles this natively with zero custom pipeline
2. Zero tokens stored anywhere (not on Mac, not in GitHub)
3. One-time setup: connect GitHub repo to Cloudflare Pages in the Cloudflare dashboard, set build command to `npm run build`, output directory to `out`
4. After this, the agent just pushes to GitHub and Cloudflare handles everything
5. This is the architecturally correct model: the agent writes code, a privileged external system deploys it

**If Option C has compatibility issues** (e.g., build environment differences, plugin requirements): fall back to **Option B (GitHub Actions)**. Store the token as a GitHub Secret with minimum scope (`Workers Scripts:Edit` for the specific account).

### Minimum token scope (for whichever option requires a token)

If a token must be created:
```
Permissions:
  - Workers Scripts: Edit
  - Account Settings: Read

Account: [specific account ID only]
Zone: [none — not needed for Workers deploy]
```

Add an **IP allowlist** on the token if deploying from GitHub Actions (Actions IP ranges are published by GitHub).

Set token **expiry to 90 days** maximum. Rotate on a calendar reminder.

### Do NOT create a Global API Key usage anywhere in this pipeline.

---

## Open Questions for R

1. **Cloudflare Pages vs Workers:** The project is currently deployed to "Cloudflare Workers" (per COMPANY.md: "happysagents.com deployed to Cloudflare"). Cloudflare Pages and Workers are different products. **Question:** Is this deployed via `wrangler deploy` as a Worker with static assets, or as Cloudflare Pages? This affects which Git integration to use and which option is simplest. If it's Workers (not Pages), Option B (GitHub Actions with `wrangler-action`) is the path of least resistance.

2. **GitHub repo visibility:** Is the happysagents.com repo public or private? If public, GitHub Actions is free with no minutes constraints. If private, free tier has 2,000 minutes/month (should be ample for a static site).

3. **Deploy gating:** Should every push to `main` auto-deploy, or should R have an approval step? With an autonomous agent committing code, a PR-based review gate (agent opens PR → R approves merge → CI deploys) might be the right model. This is an operational preference question, not purely a security one.

4. **Token rotation:** If a Cloudflare token already exists (used for the initial deploy), it should be considered potentially compromised if it was ever visible on the Mac. R should consider rotating it as part of this migration.

5. **Branch protection:** If the agent is pushing directly to `main`, there's no human review gate before code goes live. Is that the intended operating model, or should the agent work on feature branches and open PRs?
