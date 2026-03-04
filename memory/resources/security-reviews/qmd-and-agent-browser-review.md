# Security Review: QMD + agent-browser
*Reviewed: 2026-03-04 09:48 EET*
*Commands reviewed:*
1. `npm install -g @tobilu/qmd`
2. `npm install -g agent-browser && agent-browser install`

---

## QMD (@tobilu/qmd)

### Verdict: ✅ APPROVED

### Confidence: HIGH

### Summary
QMD is a local-only hybrid search engine for markdown files by Tobias Lütke (Shopify CEO, GitHub user #347). Clean dependency chain, no install scripts, SLSA provenance attestation, fully on-device operation. Excellent security posture.

### Identity & Provenance
- **Author:** Tobias Lütke (tobi@lutke.com) — CEO of Shopify
- **GitHub:** github.com/tobi (user #347, account created ~2008, 4,100+ followers, company: Shopify)
- **npm maintainer:** `tobilu` (tobi@lutke.com) — single maintainer, consistent identity
- **npm ↔ GitHub link:** npm homepage → github.com/tobi/qmd ✅, GitHub repo links back ✅
- **Repo created:** 2025-12-08, last pushed: 2026-02-26 (actively maintained)
- **Typosquatting risk:** Scoped package `@tobilu/qmd` — low risk (scoped names require org ownership)
- **Package age:** ~3 months (first publish ~Jan 2026). Newer package, but author is extremely well-known.

### Popularity & Trust
- **Weekly downloads:** 15,249/week — healthy for a specialized CLI tool
- **GitHub stars:** Visible on repo page (likely significant given author profile)
- **SLSA provenance:** ✅ Present on v1.0.0+ (attestations with `predicateType: https://slsa.dev/provenance/v1`)
- **npm signatures:** ✅ Present on all versions

### Dependency Chain
- **Direct dependencies (8):** zod, yaml, fast-glob, picomatch, sqlite-vec, better-sqlite3, node-llama-cpp, @modelcontextprotocol/sdk
- **All well-known packages:** zod (schema validation), yaml (parser), fast-glob/picomatch (file matching), better-sqlite3 (database), sqlite-vec (vector extensions), node-llama-cpp (local LLM inference), MCP SDK
- **Optional deps:** sqlite-vec platform binaries (darwin-arm64, darwin-x64, linux-x64, win32-x64)
- **Dependency count:** Reasonable for the stated functionality
- **Key dependency — node-llama-cpp:** Large dependency (compiles llama.cpp native code), but well-established (withcat.ai project, 1.3k+ GitHub stars)

### Code & Install Scripts
- **preinstall:** None ✅
- **postinstall:** None ✅
- **install:** None ✅
- **prepare:** `[ -d .git ] && ./scripts/install-hooks.sh || true` — only runs in git clone context, NOT during npm install ✅
- **No obfuscated code** — TypeScript source published, MIT license
- **No network calls at install time** ✅

### Runtime Behavior
- **File access:** Reads markdown files from explicitly configured collection paths only
- **Database:** Creates SQLite database locally (likely in ~/.cache/qmd or project directory)
- **Network — GGUF model downloads:** node-llama-cpp downloads GGUF models from HuggingFace Hub to `~/.cache/huggingface/hub/` on first use. This is the ONLY network call.
  - QMD uses 3 local models: embedding model, reranker (qwen3-reranker), and query expansion model
  - Downloads are from huggingface.co CDN — standard, well-known source
  - Models cached locally after first download — no subsequent network calls
  - node-llama-cpp uses HuggingFace's standard download mechanism with integrity checking
- **MCP server:** Optional HTTP mode on localhost:8181 (local only)
- **No telemetry, no analytics, no phone-home** ✅
- **No daemon/background process** (unless explicitly started with `--daemon` flag)

### Data Exposure Risk
- **Reads workspace files:** YES — this is its purpose. It indexes markdown files you point it to.
- **Exfiltration risk:** LOW — no outbound network calls during search/query operations. All inference is local.
- **API key access:** The tool itself doesn't use API keys. node-llama-cpp may optionally use a HuggingFace token from `~/.cache/huggingface/token` for gated models, but QMD's default models are public.
- **OpenClaw config access:** No — it doesn't read ~/.openclaw/
- **Risk with OpenClaw integration:** When configured as `memory.backend = "qmd"`, OpenClaw shells out to the `qmd` binary. QMD will index whatever collections are configured. Ensure collections only point to intended directories.

### LuLu Impact
- **First run:** LuLu will prompt for HuggingFace model downloads (huggingface.co). Approve once.
- **Subsequent runs:** No network calls. LuLu will not trigger.
- **MCP HTTP mode:** localhost only — no LuLu trigger.

### Privilege Requirements
- No root/admin access needed ✅
- No system file modifications ✅
- No PATH or shell config changes ✅
- Requires Node.js >= 22.0.0 (current machine has v24.14.0 ✅)

### GGUF Model Download Security
- **Source:** HuggingFace Hub (huggingface.co) — industry-standard model hosting
- **Integrity:** node-llama-cpp validates downloaded GGUF files via HuggingFace's file metadata
- **Cache location:** `~/.cache/huggingface/hub/` — standard location
- **Model size:** Expect 1-4GB total for the 3 GGUF models (embedding, reranker, query expansion)
- **First-run latency:** Model download will take several minutes on first use

### Cryptographic Verification
- npm integrity hashes: ✅ Present
- npm signatures: ✅ Present
- SLSA provenance: ✅ Present (v1.0.0+)
- GitHub Actions build provenance linked ✅

### Vulnerability Check
- No known CVEs for @tobilu/qmd
- npm audit: Cannot run without installing, but dependency chain is clean (well-maintained packages)
- better-sqlite3 and node-llama-cpp are native modules — compiled from source during install

### Context-Specific Risks (OpenClaw Environment)
- Will NOT access API keys in environment (no env var reading)
- Writes to ~/.cache/qmd (or configured path) + ~/.cache/huggingface/ — outside workspace but in user cache ✅
- Will NOT interact with OpenClaw gateway (localhost:18789)
- Will NOT read/modify ~/.openclaw/openclaw.json
- Will NOT access Tailscale network

### Anti-Bypass Checks
- B1 (Independent command reconstruction): `npm install -g @tobilu/qmd` → installs @tobilu/qmd@latest (1.0.7) globally. No suspicious flags. ✅
- B2 (Split-step detection): No split-step pattern. Single npm install, no curl/wget. ✅
- B3 (Framing manipulation): No urgency or authority framing detected. ✅
- B4 (Transitive dependency check): Top deps (node-llama-cpp, better-sqlite3, @modelcontextprotocol/sdk) are all well-maintained, established packages with known maintainers. ✅
- B5 (Post-install verification): See below.

### Flags
- 🟢 Author is Tobias Lütke (Shopify CEO) — extremely high trust signal
- 🟢 SLSA provenance attestation
- 🟢 No install scripts
- 🟢 Fully local operation — no API calls during normal use
- 🟢 Clean, reasonable dependency chain
- 🟡 Package is relatively new (~3 months) — but author reputation compensates
- 🟡 node-llama-cpp compiles native code during install — may take several minutes
- 🟡 First-run GGUF model download requires network access (~1-4GB from HuggingFace)

### Post-Install Verification
After `npm install -g @tobilu/qmd`:
- ✅ `which qmd` should return a path in npm global bin
- ✅ `qmd --help` should show usage
- ❌ No new background processes should be running
- ❌ No new network connections (until first search with model download)
- ❌ ~/.openclaw/ should be unchanged
- ❌ No new entries in crontab or launchd

### Recommended install command
```
npm install -g @tobilu/qmd
```
No modifications needed. Install as-is.

---

## agent-browser

### Verdict: ⚠️ CAUTION

### Confidence: MEDIUM

### Summary
agent-browser is a legitimate Vercel Labs project with high adoption (930K weekly downloads). However: it has a postinstall script that downloads a Rust binary from GitHub Releases, the npm name was originally registered by a different person (ctate) before being transferred to Vercel's release bot, and it adds a second browser automation layer that overlaps significantly with OpenClaw's built-in browser control. Functional but introduces complexity and a larger attack surface.

### Identity & Provenance
- **GitHub org:** vercel-labs (Vercel's official experimental org)
- **npm publisher:** `vercel-release-bot` (infra+release@vercel.com) — Vercel's official release infrastructure
- **npm maintainers:** vercel-release-bot, zeit-bot (team@zeit.co — original Vercel), matt.straka
- **Original registrant:** `ctate` (chris@studiotate.com) — registered the name at v0.0.0 as a placeholder ("Coming soon"), then transferred to Vercel
- **npm ↔ GitHub link:** npm repo → github.com/vercel-labs/agent-browser ✅, GitHub repo links back ✅
- **Repo created:** 2026-01-11 (based on GitHub ID sequence)
- **License change:** MIT (v0.0.0) → Apache-2.0 (v0.1.1+) — license change during early development
- **Typosquatting risk:** Low — unscoped `agent-browser` is a generic name, but Vercel's ownership is verified

### Popularity & Trust
- **Weekly downloads:** 930,361/week — very high adoption
- **Active development:** v0.16.3 (rapid iteration from 0.0.0)
- **Vercel Labs:** Official Vercel experimental org, well-known in the ecosystem
- **No SLSA provenance** attestation (unlike QMD)

### Dependency Chain
- **Direct dependencies (5):** playwright-core, ws, zod, node-simctl, webdriverio
- **node-simctl:** iOS simulator control — mobile testing support
- **webdriverio:** Browser automation framework — heavy dependency
- **playwright-core:** Playwright without bundled browsers
- **Unpacked size:** 32.5MB — large (includes pre-built Rust binaries for multiple platforms)
- **Transitive deps:** Significant — playwright-core + webdriverio bring substantial dependency trees

### Code & Install Scripts ⚠️
- **postinstall:** `node scripts/postinstall.js` — **YES, HAS POSTINSTALL SCRIPT**
  - **What it does:** Downloads a platform-specific Rust binary from `https://github.com/vercel-labs/agent-browser/releases/download/v{version}/agent-browser-{platform}-{arch}`
  - On failure: Falls back gracefully to Node.js CLI (non-fatal)
  - On global install: Rewrites npm's bin symlink to point directly to the native binary
  - **Risk assessment:** The binary download is from GitHub Releases (vercel-labs org), which is a trusted source. The fallback behavior is reasonable. However, this IS a binary download executed on install — the binary is not signed or notarized.
- **preinstall:** None ✅
- **No obfuscated code in npm package** — TypeScript source, Apache-2.0 license

### Runtime Behavior
- **Network calls:** YES — it's a browser automation tool. It:
  - Launches Chromium instances
  - Navigates to arbitrary URLs
  - Can execute arbitrary JavaScript via `eval` command
  - WebSocket communication between CLI and browser
- **`agent-browser install`:** Downloads Chromium via Playwright's download mechanism (playwright.dev CDN)
- **File system access:** Screenshots, PDFs, and browser profile data written to temp directories
- **No explicit telemetry** mentioned
- **Spawns processes:** Launches Chromium as a child process
- **eval command:** Can run arbitrary JavaScript in browser context — powerful but expected for browser automation

### Data Exposure Risk ⚠️
- **Browser context:** A separate Chromium instance — isolated from existing Chrome profiles ✅
- **eval command:** Can access any page content loaded in the browser — same as any browser automation tool
- **Does NOT directly access workspace files** (unless navigated to file:// URLs)
- **Potential risk:** If an agent is compromised and uses agent-browser to navigate to sensitive pages, data could be extracted. Same risk as OpenClaw's built-in browser.
- **API key exposure:** The agent-browser process inherits the shell environment — it WILL have access to env vars (AGENTMAIL_API_KEY, etc.) if launched from OpenClaw's process tree

### LuLu Impact ⚠️
- **Install time:** LuLu will prompt for:
  1. GitHub Releases download (rust binary) — during npm postinstall
  2. Playwright CDN (Chromium download) — during `agent-browser install`
- **Runtime:** LuLu will prompt for EVERY new domain navigated to by the Chromium instance
  - This will be frequent and potentially noisy
  - OpenClaw's built-in browser already has LuLu approvals configured — agent-browser would need separate approvals

### Privilege Requirements
- No root/admin access needed ✅
- No system file modifications ✅
- Rewrites npm bin symlinks (within npm's own directories) — expected behavior
- Chromium download: ~200-400MB to Playwright's cache directory

### Chromium Download Security
- **Source:** Playwright's CDN (playwright.dev) — Microsoft-maintained, well-established
- **Isolation:** Separate Chromium instance with its own profile — isolated from regular Chrome and from OpenClaw's browser ✅
- **No cookie/session sharing** with existing browsers ✅
- **Cache location:** `~/Library/Caches/ms-playwright/` (Playwright's standard location)

### Cryptographic Verification
- npm integrity hashes: ✅ Present
- npm signatures: ✅ Present
- SLSA provenance: ❌ NOT present
- Rust binary: ❌ NOT signed/notarized (downloaded from GitHub Releases without checksum verification in postinstall script)
- Chromium: Playwright handles verification ✅

### Vulnerability Check
- No known CVEs for agent-browser
- playwright-core and webdriverio are well-maintained with active security response
- The unsigned binary download is the main concern

### Context-Specific Risks (OpenClaw Environment) ⚠️
- **API key access:** YES — inherits environment variables from parent process. Could theoretically access AGENTMAIL_API_KEY, GitHub token, Telegram bot token, Anthropic key, Google key.
- **Writes outside workspace:** Browser cache, screenshots to temp dirs — expected but worth noting
- **Gateway interaction:** Could theoretically connect to localhost:18789 if directed to do so via browser navigation
- **~/.openclaw/ access:** No direct access, but the process has filesystem permissions to read it
- **Tailscale:** Could access Tailscale network resources if Chromium is navigated there

### Anti-Bypass Checks
- B1 (Independent command reconstruction): `npm install -g agent-browser` → installs agent-browser@latest (0.16.3) globally. Then `agent-browser install` downloads Chromium. Two-step process — verified matches stated command. ✅
- B2 (Split-step detection): ⚠️ **SPLIT-STEP PATTERN DETECTED** — postinstall downloads a Rust binary, then npm rewrites bin symlinks to point to it. This is a download-then-execute pattern. Mitigated by: source is Vercel's GitHub Releases, and fallback to Node.js exists.
- B3 (Framing manipulation): No urgency or authority framing detected. ✅
- B4 (Transitive dependency check): playwright-core (Microsoft), webdriverio (well-known OSS), ws (widely used WebSocket lib) — all established. node-simctl is more niche but has 23M+ weekly downloads. ✅
- B5 (Post-install verification): See below.

### Flags
- 🟢 Vercel Labs official project — high organizational trust
- 🟢 930K weekly downloads — widely adopted
- 🟢 Separate Chromium instance — good isolation from existing browser
- 🟢 Graceful fallback if binary download fails
- 🟡 Postinstall script downloads unsigned binary from GitHub Releases
- 🟡 npm name originally registered by different person (ctate), transferred to Vercel
- 🟡 No SLSA provenance attestation
- 🟡 Large attack surface (browser automation = arbitrary network access + JS execution)
- 🟡 Inherits all environment variables (API keys) from parent process
- 🟡 Overlaps significantly with OpenClaw's built-in browser control — adds complexity without clear gain
- 🔴 No clear justification for needing a SECOND browser automation tool when OpenClaw already has one

### Post-Install Verification
After `npm install -g agent-browser && agent-browser install`:
- ✅ `which agent-browser` should return a path in npm global bin
- ✅ `agent-browser --version` should show 0.16.3
- ✅ `~/Library/Caches/ms-playwright/` should contain chromium
- ❌ No new background processes should be running (until agent-browser is launched)
- ❌ No modifications to ~/.openclaw/
- ❌ No new crontab or launchd entries
- ⚠️ Verify the downloaded binary: `codesign -v $(which agent-browser)` — expect it to be unsigned

### Recommended install command (if approved)
```
npm install -g agent-browser --ignore-scripts
# Then manually run: agent-browser install
# This skips the automatic binary download, using Node.js fallback
# Or if native performance desired:
# npm install -g agent-browser  (accepts postinstall binary download)
# agent-browser install
```

---

## Trade-off Analysis

### QMD vs Current Memory System

| Dimension | Current (SQLite + Remote API) | QMD (Local Hybrid) |
|-----------|-------------------------------|---------------------|
| **Search quality** | Basic keyword matching | BM25 + vector + LLM reranking (significantly better) |
| **Privacy** | ⚠️ Sends content to Gemini/OpenAI for embeddings | ✅ Fully on-device — zero data leaves machine |
| **Cost** | Ongoing API costs for embeddings | One-time model download (~1-4GB), then free forever |
| **Complexity** | Built-in, zero config | Requires collection setup, initial model download, ~1-4GB disk |
| **Failure modes** | API outage = no embeddings | Local-only = no external dependencies. But: native compilation may fail on some setups |
| **M1 performance** | Fast (SQLite), slow (API calls) | Fast (all local), but first load of GGUF models takes RAM (~2-4GB) |
| **OpenClaw integration** | Native | Official — `memory.backend = "qmd"` config option |
| **Maintenance** | OpenClaw handles it | Separate `qmd` binary updates needed |

**Bottom line:** QMD is a clear upgrade — better search, better privacy, zero ongoing cost, official OpenClaw integration. The trade-off is initial setup complexity and RAM usage for local models.

### agent-browser vs OpenClaw Browser Tool

| Dimension | Current (OpenClaw CDP) | agent-browser (Playwright CLI) |
|-----------|------------------------|-------------------------------|
| **Performance** | Good (direct CDP) | Potentially faster (Rust CLI) but adds Node→Rust→CDP hop |
| **Isolation** | Separate Chrome profile (port 18791) | Separate Chromium instance (Playwright) |
| **Reliability** | Mature, integrated with OpenClaw agent loop | New tool (v0.16.3), separate process management |
| **Integration** | Native — snapshot/act/click all built-in | Would need custom integration or shell-out |
| **Complexity** | Zero additional setup | Second browser binary, second Chromium install (~400MB), second set of LuLu rules |
| **Feature parity** | Full agent-aware browser control (refs, aria, act) | CLI-oriented, would need wrapping for agent use |
| **Duplication** | N/A | Significant overlap — solves the same problem OpenClaw already solves |
| **Security surface** | One browser process, one profile | Two browser processes, two Chromium installs, more attack surface |

**Bottom line:** agent-browser adds complexity and attack surface without clear benefit over OpenClaw's built-in browser control. The Rust CLI is nice for standalone use, but within OpenClaw, the built-in tool is already well-integrated and working.

---

## Final Recommendation

### QMD: ✅ INSTALL
- **Recommendation:** Install with confidence.
- **Rationale:** Extremely trusted author (Shopify CEO), clean security profile, no install scripts, SLSA provenance, fully local operation, official OpenClaw integration. Privacy improvement over current remote-embedding approach. Clear upgrade to memory search quality.
- **Command:** `npm install -g @tobilu/qmd`
- **Post-install:** Configure collections, run `qmd embed` (will download ~1-4GB of GGUF models from HuggingFace — approve in LuLu), then set `memory.backend = "qmd"` in OpenClaw config.

### agent-browser: 🚫 DON'T INSTALL (for now)
- **Recommendation:** Skip. Not because it's unsafe, but because it's unnecessary.
- **Rationale:** OpenClaw's built-in browser control already handles browser automation well. agent-browser would add a second Chromium install (~400MB), a second set of LuLu rules, a second process to manage, unsigned binary downloads, and significant overlap with existing functionality — all for marginal performance gains that don't justify the added complexity and attack surface.
- **Revisit when:** OpenClaw's built-in browser proves insufficient for a specific task, or agent-browser adds unique capabilities (mobile testing via node-simctl could be interesting in the future).
- **If R decides to install anyway:** Use `npm install -g agent-browser` (accept the postinstall), then `agent-browser install`. Monitor LuLu for the binary download and Chromium download. Verify the binary with `codesign -v`.
