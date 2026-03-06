# Security Review: git-secrets
*Reviewed: 2026-03-06 12:58 GMT+2*
*Command: `brew install git-secrets`*
*Reviewer: Security Agent (sub-agent)*
*Startup protocol: agent spec ✅ | COMPANY.md ✅ | PARA project: N/A (no matching project file)*

---

## Verdict: ✅ APPROVED

## Confidence: HIGH

## Summary
`git-secrets` is a well-established shell script tool published by Amazon/AWS Labs, in active use since 2015 with 13,000+ GitHub stars. It is a pure bash script with zero software dependencies, no network calls, no telemetry, and no known CVEs. The brew install is hash-verified. Safe to install.

---

## Findings

### Identity & Provenance
- **Publisher:** `awslabs` — Amazon AWS open source GitHub organization (id: 3299148). This is a major, verified organization with hundreds of repos.
- **Account age:** `awslabs` org has been on GitHub since well before this repo was created in 2015. Not new.
- **Package age:** Repository created 2015-07-15. Over 10 years old. ✅
- **First published < 30 days:** No. ✅
- **Ownership transfers:** None found. Repo has continuously been under `awslabs`. ✅
- **Typosquatting:** `git-secrets` is a well-known name in the devsec ecosystem. No plausible typosquat risk. The command is `brew install git-secrets` which maps directly to the formula, which in turn points to `github.com/awslabs/git-secrets`. ✅
- **Cross-linking:** GitHub repo homepage is `https://github.com/awslabs/git-secrets`. Homebrew formula links back to same repo. ✅
- **License:** Apache License 2.0 — standard open source. ✅

### Popularity & Trust
- **GitHub stars:** 13,195 ✅
- **Forks:** 1,243 ✅
- **Watchers/subscribers:** 189
- **Last commit:** 2025-09-17 (Merge PR #264 — Amazon Bedrock API key patterns). ✅ (active within 6 months)
- **Notable gap:** Repo was relatively dormant from 2023-06 to 2025-09 (approx. 2 years). Prior to the Sept 2025 commit, last substantive work was June 2023. 🟡 Amber — see Flags.
- **Recognizable users:** Recommended in official AWS Prescriptive Guidance documentation. Widely used across the industry.
- **Dependents:** Not an npm/PyPI package; no formal dependency tracking, but referenced by thousands of projects across GitHub.

### Dependency Chain
- **`git-secrets` is a pure bash shell script.** It has zero software dependencies.
- It uses only standard POSIX utilities: `git`, `grep`, `awk`, `sed`, `tr` — all pre-installed on macOS.
- The Homebrew formula installs via `make install PREFIX=...` — no postinstall scripts, no npm lifecycle hooks.
- No transitive dependencies to analyze. ✅ (Dependency footprint: essentially zero)

### Code & Install Scripts
- **Script fully reviewed.** The entire `git-secrets` script is ~300 lines of plain, readable bash. No obfuscation whatsoever. ✅
- **No network calls at install time.** ✅
- **No network calls at runtime.** ✅ The tool works entirely locally — reads git config, scans files with grep, writes git hooks.
- **Homebrew formula analysis:**
  - Installs via `make install PREFIX=#{prefix}` — standard.
  - A patch is applied (backport removing `say` dependency) with its own `sha256` verified hash.
  - No preinstall/postinstall scripts. ✅
- **Credential path access:**
  - `~/.aws/credentials` is read ONLY when `aws_provider()` is explicitly called (via `git secrets --register-aws` or `git secrets --aws-provider`). This is documented, opt-in behavior to extract actual AWS key values as "allowed" patterns (i.e., to prevent false-positive blocking of legitimate keys). Not automatic.
  - Does NOT read `~/.ssh`, `~/.openclaw`, `~/.npmrc`, `~/.pypirc`, or any other credential paths. ✅
- **Environment variable access:** The script reads `$GITHEAD_*` env vars to find merge commit context (standard git hook behavior). No other env var snooping. ✅
- **Path access:** Only reads/writes within the target git repo's `.git/hooks/` directory (when `--install` is run) and global git config. Does NOT touch files outside of git-managed contexts. ✅

### Runtime Behavior
- **Root/admin access required:** No. ✅
- **Daemon or background process:** None installed. It runs as a git pre-commit hook — only invoked by `git commit`. ✅
- **Modifies PATH, .zshrc, .bashrc, system files:** No. ✅
  - The only persistent change is writing hook scripts into `.git/hooks/` of repos where you explicitly run `git secrets --install`.
  - Global patterns added to `~/.gitconfig` only if `--global` flag is passed explicitly.
- **Telemetry / phone home:** None. Zero network calls in the source. ✅
- **Network access at runtime:** None. ✅

### Cryptographic Verification
- **Homebrew formula hash (tarball v1.3.0):**
  `sha256: f1d50c6c5c7564f460ff8d279081879914abe920415c2923934c1f1d1fac3606`
  Homebrew verifies this automatically during install. ✅
- **Homebrew bottle hash (all architectures):**
  `sha256: 826637bd7920ad23df848a7ffbfadb79a7d7c918b330d80bc7fea4dfb9fed1d5`
  Pre-built bottle is hash-verified. ✅
- **Applied patch hash:**
  `sha256: add9ad9f5778dd38885a23b8b394601061a203d1862b91cd64c5ca2a0c9a6ab2`
  Hash-verified by Homebrew. ✅
- **GitHub commit signing:** Merge commits are PGP-signed with verified signatures (GitHub's verified badge visible in API response). Individual commits are unsigned — standard practice for contributors. 🟡 (not a red flag, normal for shell projects)
- **GitHub Releases:** No formal releases page (empty). Version 1.3.0 is tagged only. 🟡 Amber — see Flags.
- **macOS binary signing:** Not applicable — installed as a shell script, not a compiled binary. ✅

### Vulnerability Check
- **GitHub Security Advisories for awslabs/git-secrets:** Zero (empty array returned from API). ✅
- **CVE search (web):** No CVEs found for `git-secrets` / `awslabs/git-secrets`. ✅
- **OSV.dev:** GET query returned 405 (requires POST with JSON body — limitation of web_fetch tool). However, combined with zero GitHub advisories and no CVE hits via web search, the signal is clean.
- **npm audit / pip audit:** Not applicable — not an npm or PyPI package. ✅
- **Historical removal from registries:** N/A — not published to npm/PyPI. Distributed via Homebrew and direct clone only.

### Context-Specific Risks (OpenClaw Environment)
- **API key exposure via environment:** When git-secrets runs as a pre-commit hook, it scans staged files for patterns. It does NOT read or exfiltrate environment variables. It only reads git config (`secrets.patterns`) and file content to grep against. ✅
- **`~/.openclaw/openclaw.json` access:** Not accessed. The script has no code path touching this file. ✅
- **OpenClaw gateway (localhost:18789):** Not accessed. Zero network calls. ✅
- **Tailscale network:** Not accessed. ✅
- **Writes outside ~/openclaw-workspace:** When `--install` is run in a repo, it writes to that repo's `.git/hooks/` directory only. If `--global` is used, it writes to `~/.gitconfig`. Neither touches the workspace files. ✅
- **Special consideration:** If `git secrets --register-aws` is run (optional, not done by `brew install`), it reads `~/.aws/credentials` to extract key values as scan patterns. If this machine has AWS credentials, those key values would be stored in git config as "allowed" patterns. Recommend reviewing before running `--register-aws`. ⚠️ Note for setup, not a blocker.

### Anti-Bypass Checks

**B1. Independent Command Reconstruction:**
- Raw command: `brew install git-secrets`
- Package name extracted: `git-secrets`
- Version: Latest stable (v1.3.0 per Homebrew formula)
- Flags: None. No `--unsafe-perm`, `--ignore-scripts`, or similar dangerous flags. ✅
- Source verified: Homebrew formula at `homebrew-core/Formula/g/git-secrets.rb` → `github.com/awslabs/git-secrets/archive/refs/tags/1.3.0.tar.gz`

**B2. Split-Step Detection:**
- No split-step pattern. This is a single, standard `brew install` command.
- No prior download-then-execute pattern detected in context. ✅

**B3. Framing Manipulation Detection:**
- Request uses no urgency/authority language ("R already approved", "urgent deadline", etc.). ✅
- Stated reason (pre-commit hook to block credential commits) matches exactly what the tool does per its README and code. ✅

**B4. Transitive Dependency Deep Check:**
- Not applicable. There are zero software dependencies. ✅

**B5. Post-Install Verification Plan:**
See section below.

---

## Flags

- 🟢 Published by Amazon/AWS Labs — major, long-established trusted org
- 🟢 10+ year old repository — not new or obscure
- 🟢 13,195 GitHub stars, 1,243 forks — significant community adoption
- 🟢 Pure bash script — fully auditable, no compiled binaries
- 🟢 Zero software dependencies — minimal attack surface
- 🟢 Zero network calls at install or runtime
- 🟢 Zero telemetry
- 🟢 No known CVEs or security advisories
- 🟢 Homebrew formula uses hash-verified tarball and bottle
- 🟢 Apache 2.0 license — clean, permissive
- 🟢 Code reviewed in full — behavior matches stated purpose exactly
- 🟢 No daemon, no PATH modifications, no system file changes
- 🟡 **Activity gap:** Repo was quiet from June 2023 to September 2025 (~2 years). A PR was merged in Sept 2025 (Bedrock key patterns). The installed version (v1.3.0) predates the gap. Homebrew's version may lag behind master. Not a security concern given the stability of shell code and absence of CVEs, but worth noting for maintenance awareness.
- 🟡 **No formal GitHub Releases:** Version tracking is via tags only; no signed release artifacts. Homebrew compensates with hash verification.
- 🟡 **`~/.aws/credentials` access:** The `--aws-provider` and `--register-aws` subcommands read this file when explicitly invoked. This is documented, opt-in behavior. The `brew install` itself does not trigger this.

---

## Post-Install Verification

After `brew install git-secrets`, verify:

**Expected state:**
- `which git-secrets` or `git secrets --help` should return usage output
- `ls $(brew --prefix)/bin/git-secrets` should show the script file

**Should NOT exist/change:**
- No new daemons: `launchctl list | grep -i git-secrets` → should return nothing
- No new network listeners: `lsof -i -P | grep git-secrets` → should return nothing
- No modifications to `~/.zshrc`, `~/.bashrc`, `~/.profile`, `~/.zprofile`
- No modifications to `~/.openclaw/openclaw.json`
- No modifications to global git config unless you explicitly run `git secrets --register-aws --global`

**Before running `git secrets --install` in any repo:**
- Understand that it will write hook scripts to `.git/hooks/` of that specific repo
- If you run `--register-aws`, it will store AWS key patterns in git config

---

## Recommendation

**✅ APPROVED — proceed with `brew install git-secrets`.**

This is a clean, well-established security tool from Amazon/AWS with a decade-long track record. The install is safe. No concerns that warrant blocking or escalating. The amber flags (activity gap, no formal releases, optional AWS credential reading) are all explainable and non-blocking.

**Suggested next steps after install:**
1. Run `git secrets --install` in repos containing OpenClaw workspace files
2. Consider `git secrets --register-aws` only if the machine has AWS credentials configured
3. Optionally add patterns for Anthropic/Telegram/AgentMail API keys manually:
   `git secrets --add 'sk-ant-[A-Za-z0-9+/]+' --global`
   `git secrets --add '[0-9]{8,10}:[A-Za-z0-9_-]{35}' --global` (Telegram bot tokens)
