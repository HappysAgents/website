# Credential Management Landscape Research
Date: 2026-03-06
Researcher: Technical Research Agent (subagent)

---

## Executive Summary

- **The OpenClaw community has surprisingly mature coverage** of credential management — formal docs, a SecretRef system, third-party tutorials, and multiple open GitHub issues/discussions all exist. This is not a gap no one has noticed.
- **However**, the *default* onboarding path doesn't enforce SecretRef usage — most users end up with plaintext tokens in config files and never configure the native secrets system. The gap is in adoption, not awareness.
- **Agent-specific threat vectors** (prompt injection → credential exfiltration, MEMORY.md poisoning, sub-agent trust boundary) are discussed in the community but remain **underdeveloped** relative to traditional secrets management hygiene. This is the genuine gap.
- **An "Agent-Blind Credential Architecture"** proposal (Discussion #9676) represents the most forward-thinking treatment — credentials should never flow through the agent's context at all. This is a minority position, not mainstream practice.
- **For the blog post:** "The Credentials We Almost Shipped" has strong potential — not because the community is unaware of basics (they're not), but because the *agent-specific threat surface* (prompt injection → credential exfiltration, workspace memory poisoning) is undercovered. The LangGrinch CVE from Dec 2025 (CVSS 9.3 in LangChain) shows this is an active real-world risk, not theoretical. A first-person story using actual near-miss examples from this infrastructure would stand out.

---

## Source 1: OpenClaw Docs (docs.openclaw.ai)

**URL:** https://docs.openclaw.ai/gateway/security and https://docs.openclaw.ai/gateway/secrets

### Security Page Findings

The security page is comprehensive and well-structured. Key relevant content:

**Credential/secrets guidance (verbatim from docs):**
> "Keeping secrets out of prompts; pass them via env/config on the gateway host instead."

**openclaw security audit command** is documented:
```bash
openclaw security audit
openclaw security audit --deep
openclaw security audit --fix
```
"It flags common footguns (Gateway auth exposure, browser control exposure, elevated allowlists, filesystem permissions)."

**Trust boundary model**: The docs are explicit that OpenClaw assumes a personal assistant security model — one trusted operator boundary per gateway. This is important context: the threat model is NOT multi-tenant. The main risks are:
1. What processes running as the user can access (sub-agent trust boundary)
2. Prompt/content injection from untrusted channels
3. Tool authority delegation

**Agent-specific threat acknowledged (verbatim):**
> "if one shared agent has sensitive credentials/files, any allowed sender can potentially drive exfiltration via tool usage."

**Sophistication level:** Medium-high for traditional security hygiene. Explicit about trust boundaries and attack surface. Less specific on credential rotation or audit trails.

### Secrets Management Page Findings (docs.openclaw.ai/gateway/secrets)

This is a dedicated, technical secrets management page. Key findings:

**SecretRef system is native to OpenClaw.** Credentials can be stored as references rather than values. The contract:
```json
{ "source": "env" | "file" | "exec", "provider": "default", "id": "..." }
```

**Three built-in provider types:**
1. `env` — reads from environment variables, supports allowlist wildcards
2. `file` — reads from a JSON file or single-value file at a specified path
3. `exec` — runs an external command and uses stdout as the secret value (enables Vault, 1Password, AWS SSM, etc.)

**Startup behavior:** Secrets are resolved eagerly at startup, fail-fast if a referenced secret can't be resolved. Atomic swap on reload (keeps last-known-good if resolution fails). This is a solid production-ready design.

**Onboarding preflight:** When running onboarding in interactive mode with SecretRef storage chosen, OpenClaw validates env var names and confirms non-empty values exist before saving config.

**Critical gap acknowledged by docs:** "Plaintext still works. SecretRefs are opt-in per credential." — The system exists but isn't the default. Most users never configure it.

**Sophistication level:** High for the SecretRef system itself. The architecture is well-designed. But the onboarding path doesn't enforce it, meaning most users are on the plaintext default.

---

## Source 2: OpenClaw Community Forum

**community.openclaw.ai** — DNS does not resolve (getaddrinfo ENOTFOUND community.openclaw.ai)
**forum.openclaw.ai** — DNS does not resolve (getaddrinfo ENOTFOUND forum.openclaw.ai)

**Assessment: Data thin.** No community forum found at the expected URLs. Community discussion appears to happen primarily on Discord (discord.gg/clawd) and GitHub Discussions. Cannot assess forum-level sophistication. The Discord server appears to be the primary async community channel but was not directly accessible for this research.

---

## Source 3: OpenClaw GitHub (github.com/openclaw/openclaw)

Multiple relevant issues and discussions found:

### Issue #7916: "Support for encrypted API keys / secrets management"
**URL:** https://github.com/openclaw/openclaw/issues/7916
**Opened:** ~1 month ago (as of March 2026)

**Problem stated:**
> "Currently, API keys and secrets are stored in plain text in configuration files:
> - ~/.openclaw/agents/*/auth-profiles.json (provider API keys)
> - ~/.openclaw/openclaw.json (custom provider keys, skill API keys)"

**Three proposed solutions in the issue:**
1. Environment variable references (`${MOONSHOT_API_KEY}`)
2. External encrypted secrets file (age/sops)
3. System Keychain integration (macOS Keychain / Linux libsecret)

**Use cases driving the issue:** Users backing up home directories, dotfile repos, compliance requirements.

**Critical admission in issue:**
> "Current Workaround: None that preserves full functionality. Keys must be in plain text for OpenClaw to operate."
(This may be outdated — the SecretRef system appears to address this, but the issue predates or wasn't updated to reflect it.)

### Issue #28306: "Secrets: expand SecretRef scope to channel credentials"
**URL:** https://github.com/openclaw/openclaw/issues/28306
**Opened:** ~1 week ago (as of March 2026)

**Key quote:**
> "Channel bot tokens are arguably the most sensitive credentials in openclaw.json. A malicious process reading the config file gets full control of the bot. Being able to store these as SecretRefs (resolved at runtime via env, file, or exec provider) would close the biggest plaintext exposure."

**Notable:** Explicitly mentions the sub-agent threat vector and macOS Keychain integration as a solution path. Shows the community is actively thinking about agent-specific attack surfaces.

### Discussion #9676: "RFC: Agent-Blind Credential Architecture"
**URL:** https://github.com/openclaw/openclaw/discussions/9676
**Status:** Open for Discussion (AI-generated/human-assisted, per disclosure)

This is the most architecturally sophisticated treatment found in the research.

**Core principle:**
> "Credentials should be stored and used without the AI agent ever seeing their values. The agent knows credentials exist (metadata) but only references them by name. A separate Credential Broker resolves and injects credentials at execution time."

**Problem identified:**
> "Secrets leak to transcripts via config.get, env, shell commands. Any compromise of the agent = credential compromise."

**Why encryption alone isn't enough (quoted):**
> "On disk: credentials encrypted ✓
> At runtime: Agent decrypts credential → Agent has credential in context → Credential can leak"

**Proposed architecture:** Three security modes (yolo/balanced/strict), Vault Backend Abstraction interface, Action-Based 2FA, tool schema changes so tools accept credential references rather than values.

**Tool schema comparison (verbatim):**
```
// Current (credential flows through agent)
{ url: "...", apiKey: "sk-live-xxx" }

// Proposed (agent never sees value)
{ url: "...", credentialRef: "stripe_api", credentialPlacement: { type: "header", key: "Authorization" } }
```

**Sophistication level:** Very high. This is the state-of-the-art for agent-specific credential architecture. The discussion explicitly connects prompt injection resistance to credential architecture — a concept most users haven't thought through.

**Related issues referenced:** #7139, #7604, #5995, #9627 — suggests this is a multi-issue, multi-contributor area of active concern.

---

## Source 4: ClaWHub (clawhub.com → clawhub.ai)

**URL:** https://clawhub.ai

**Assessment: Data thin.** The site resolved but returned minimal content — appears to be a placeholder or landing page without skills/tools indexed. No searchable catalog accessible. Cannot determine if secrets management skills exist.

---

## Source 5: Web Search Results

### LumaDock Tutorial: "Keep your API keys safe in OpenClaw: A guide to secrets"
**URL:** https://lumadock.com/tutorials/openclaw-secrets-management

This is the most complete community-authored guide found. Highly relevant, covering:

**Attack surface enumeration (verbatim — remarkably specific):**
- Git commits (openclaw.json under version control)
- Backup archives (unencrypted tar with plaintext tokens)
- Debug logs (Gateway debug mode logging can capture API keys)
- **MEMORY.md** — this one is directly relevant: "If an agent is prompted (intentionally or via injection) to write its configuration context into memory files, tokens from its auth profile can end up in MEMORY.md. This is a prompt injection risk more than a config risk, but the consequence is the same: plaintext tokens in a file that might get backed up, synced, or indexed somewhere."
- World-readable files (Linux fresh installs)

**Practical guidance:**
- Use `~/.openclaw/.env` with `chmod 600` as first step above plaintext
- Reference via `${VAR}` in config
- For systemd: use `EnvironmentFile` directive (not shell env export)
- Pre-commit hooks: truffleHog or gitleaks

**SecretRef system with all external integrations documented:**
- HashiCorp Vault via exec provider
- AWS Secrets Manager (recommends IAM role, not static keys)
- 1Password CLI (`op read`)
- Bitwarden / BWS
- Docker/Kubernetes secrets (file provider at `/run/secrets/`)

**Notable warning:**
> "The allowSymlinkCommand: true and trustedDirs settings are security constraints that prevent the exec provider from being redirected to arbitrary commands. Only commands in trusted directories can be executed as providers, which matters because an exec provider with a tampered command path is a code execution vulnerability."

This is genuinely advanced — they're noting that the secrets system itself can be a vector if an attacker can tamper with the command path.

**Sophistication level:** High. This is the most complete practical guide found. Covers mechanics, gotchas, and some agent-specific risks (MEMORY.md). Doesn't go as deep as Discussion #9676 on agent-blind architecture.

### Contabo Blog: "OpenClaw Security Guide 2026"
**URL:** https://contabo.com/blog/openclaw-security-guide-2026/ (published ~1 week ago)

**Key quote:**
> "Stop storing keys in plain text. Use proper OpenClaw API key security by loading credentials from environment variables or secret managers."
> "AI agent secret management should use encrypted stores, secret managers, or at minimum, file permissions that prevent casual access."

**Sophistication level:** Medium. General security hygiene, less OpenClaw-specific. Standard advice that most developers already know.

### Auth0 Blog: "Securing OpenClaw: A Developer's Guide to AI Agent Security"
**URL:** https://auth0.com/blog/five-step-guide-securing-moltbot-ai-agent/

Referenced sandboxing and prompt injection as security concerns. Not fetched in full but suggests credential management is covered as part of broader agent security framing.

### API Stronghold: "How to Give Your AI Agent Only the API Keys It Needs"
**URL:** https://www.apistronghold.com/blog/securing-openclaw-ai-agent-with-scoped-secrets
**Published:** January 31, 2026

Discusses scoped secrets and exposing a CLI as an OpenClaw skill for agent-managed credential lifecycle. Suggests some practitioners are thinking about agents having intentional, scoped access to secrets management tooling — not just keeping secrets away from agents.

---

## Source 6: Adjacent Communities — LangChain / Other AI Agent Frameworks

### LangGrinch (CVE-2025-68664, CVSS 9.3) — Active Real-World Incident
**Source:** Cyata security research, reported December 26, 2025
**Coverage:** SC Media, The Hacker News, Silicon Angle, multiple outlets

This is directly relevant as a comparator. A critical vulnerability in LangChain Core allowed secret theft via serialization injection — prompt injection could steer an agent into generating crafted structured outputs that triggered unsafe deserialization, leaking secrets.

**Key quote from researcher Yarden Porat (Cyata):**
> "In agent frameworks, structured data produced downstream of a prompt is often persisted, streamed, and reconstructed later. That creates a surprisingly large attack surface reachable from a single prompt."

**Recommended mitigations from disclosure:**
- Treat LLM outputs as untrusted
- Audit deserialization in streaming/logs
- Disable secret resolution unless inputs are verified
- Upgrade langchain-core immediately

A parallel flaw hit LangChainJS (CVE-2025-68665) simultaneously.

**Relevance to OpenClaw:** This is exactly the threat Discussion #9676 describes — credentials in context + prompt injection = credential exfiltration. LangChain had a CVE. OpenClaw has a formal proposal to prevent this architecturally. The proposal is open (not implemented). This is a concrete, recent, widely-covered incident that validates the agent-blind credential argument.

**Sophistication level in adjacent communities:** Very high post-LangGrinch. The CVE moved this from theoretical to demonstrated. Enterprise AI teams are actively patching.

---

## Gap Analysis

### What the community DOES cover well:
- **Plaintext storage is a known issue** — multiple issues, community guides, and official docs acknowledge it
- **SecretRef system** — OpenClaw has a native solution that's documented and works; env/file/exec providers cover most use cases
- **External secret manager integration** — Vault, 1Password, AWS SSM, Bitwarden all documented with working configs
- **File permissions and .gitignore hygiene** — well-covered in community tutorials
- **Pre-commit hooks** (gitleaks, truffleHog) — mentioned in at least one tutorial
- **VPS deployment hardening** — covered (linux file permissions, systemd EnvironmentFile)
- **`openclaw security audit` command** — exists and flags common footguns

### What appears MISSING or underdeveloped:

1. **Default-off SecretRef** — The biggest gap is adoption, not tooling. The onboarding path doesn't enforce SecretRef. Most users have plaintext tokens and never know the system exists.

2. **Agent-blind architecture** (Discussion #9676) — Proposed but not implemented. The current system still passes credentials through the agent context at some point. The LangGrinch CVE demonstrates this is exploitable.

3. **Sub-agent trust boundary for credential access** — Multiple GitHub issues note this. A sub-agent running as the same OS user can read `~/.openclaw/openclaw.json` and all credential files. No sandboxing exists at the sub-agent level. SOUL.md-style behavioral rules are the only control.

4. **MEMORY.md / workspace file poisoning** — The LumaDock tutorial mentions this specifically, but it's underemphasized relative to its risk. If a prompt-injected sub-agent writes credentials to MEMORY.md (or daily notes), those files can then be synced, backed up, committed, or transmitted. This is an OpenClaw-specific vector not covered in most security literature.

5. **Rotation lifecycle** — No community tooling or runbook patterns found for credential rotation. "Rotate quarterly" is the advice; no automation or reminders infrastructure exists.

6. **Backup encryption** — Mentioned in passing in one tutorial. No standard community practice documented.

7. **Audit logging** — No community discussion of audit trails for which agents accessed which credentials, or when. This is a compliance/detection gap.

### Agent-specific threat surface coverage:

| Threat | Community Coverage | Depth |
|--------|-------------------|-------|
| Credentials in plaintext config | ✅ Well-covered | High |
| Git commit accidents | ✅ Well-covered | High |
| Debug log leakage | ✅ Covered | Medium |
| Prompt injection → credential exfiltration | ⚠️ Acknowledged (Discussion #9676, security page) | Low-Medium |
| Sub-agent reads credential files directly | ⚠️ Mentioned in issues, no solution | Low |
| MEMORY.md / workspace file poisoning via injection | ⚠️ LumaDock tutorial only | Low |
| Transcript leakage (agent sees credential in context) | ⚠️ Discussion #9676 only | Low |
| Credential in backup archive | ✅ Mentioned | Medium |
| Rotation lifecycle / audit trails | ❌ Not covered | None |

---

## Recommendation for Blog Post

**"The Credentials We Almost Shipped" — Strong YES, but the angle matters.**

**Don't pitch it as "basic mistake the community doesn't know about"** — that's inaccurate. The community does have coverage of basic credential hygiene. The docs are decent. Tutorials exist. Issues are open.

**DO pitch it as:** a first-person account of a near-miss that illuminates the *specific gap* the community under-covers: **agent-specific threat vectors that traditional secrets management doesn't address**.

The genuinely novel angles for this audience:
1. **MEMORY.md poisoning** — this is OpenClaw-specific and basically undiscussed. If a sub-agent is prompt-injected into writing config context to memory files, credentials end up in git-tracked workspace files. Traditional secrets management doesn't protect against this.
2. **Sub-agent trust boundary** — no sandbox exists at the sub-agent level. Any spawned sub-agent runs as the same OS user and can read all credential files. Behavioral rules (SOUL.md) are the only control. This is a structural risk, not a hygiene failure.
3. **The "agent-blind" gap** — Discussion #9676 describes the right solution (agent never sees credential values) but it's a proposal, not reality. The LangGrinch CVE (Dec 2025, CVSS 9.3 in LangChain) proves this vector is actively exploited. OpenClaw users have the same exposure.
4. **The audit in this workspace** (credential-exposure-audit-2026-03-05.md) found 2 CRITICAL findings (Discord credentials in git-tracked workspace, no .gitignore) — these are real, specific, named findings, not abstract risk. That's blog-worthy.

**Competitive positioning:** Most security writing on AI agents is either (a) generic "don't hardcode API keys" beginner content or (b) theoretical CVE analysis. A first-person story of "here's exactly what we found in our own infrastructure, here's what would have happened, here's what we fixed" with the OpenClaw-specific vectors (MEMORY.md, sub-agent trust, workspace file poisoning) is differentiated content. The LangGrinch CVE timing makes it topical.

**The honest assessment:** This blog post adds genuine insight if it focuses on *agent-specific* threat surface. If it just covers "use env vars not plaintext," it's redundant with existing content. The unique angle is the intersection of prompt injection + credential architecture + real-world near-miss in production infrastructure.

---

*Research completed: 2026-03-06*
*Sources checked: OpenClaw Docs (security + secrets pages), GitHub Issues #7916 and #28306, GitHub Discussion #9676, LumaDock tutorial, Contabo blog, API Stronghold blog, LangGrinch CVE coverage (Dec 2025)*
*Community forum: DNS not resolving — likely Discord-based community*
*ClaWHub: Data thin — site appears to be placeholder/early stage*
