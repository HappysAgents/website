# Security Review: prd-writer.skill

**Date:** 2026-03-03  
**Reviewer:** Security Review Subagent  
**Verdict:** ⚠️ CAUTION  
**Confidence:** High (all 11 files read in full; automated scans passed)

---

## Summary

The `prd-writer` skill is a well-structured, legitimately-purposed PRD writing assistant designed for Claude Code integration. No prompt injection attempts, no credential exfiltration, no identity spoofing, and no invisible unicode or encoded payloads were found. The skill does expand its scope slightly beyond "write a PRD" — it also scaffolds full Claude Code multi-agent execution plans including shell command templates — but all of this is clearly framed as content for the *user's* Claude Code workflow, not direct instructions to OpenClaw.

**CAUTION** is flagged for two non-critical reasons: (1) anonymous authorship in LICENSE.txt, and (2) shell command templates embedded in SKILL.md that, while clearly labeled as "copy this to Claude Code," are present in the context window and could be misread during adversarial prompting. These are amber, not red.

---

## Files Reviewed

| File | Lines | Status |
|------|-------|--------|
| `SKILL.md` | 697 | ✅ Benign |
| `LICENSE.txt` | 21 | ⚠️ Anonymous author |
| `references/claude_code_tasks.md` | 316 | ✅ Benign |
| `references/acceptance_criteria.md` | 267 | ✅ Benign |
| `references/tech_stack_options.md` | 379 | ✅ Benign |
| `references/user_flow_examples.md` | 289 | ✅ Benign |
| `agents/test-writer.md` | 222 | ✅ Benign (Claude Code template) |
| `agents/backend-builder.md` | 156 | ✅ Benign (Claude Code template) |
| `agents/integrator.md` | 205 | ✅ Benign (Claude Code template) |
| `agents/frontend-builder.md` | 198 | ✅ Benign (Claude Code template) |
| `agents/database-builder.md` | 77 | ✅ Benign (Claude Code template) |

---

## 1. Prompt Injection Analysis — ✅ CLEAN

**Method:** Full manual read of all files + automated grep for injection keywords (ignore previous, disregard, override, forget your, system prompt, jailbreak, bypass, you are now, new instructions, reveal key, exfiltrate, sudo, SOUL.md, MEMORY.md, ~/.openclaw).

**Findings:** Zero hits on any injection keywords. The only "system prompt" hit was in `references/claude_code_tasks.md` line 62, which reads:
```
System prompt defining the agent's role, responsibilities, and output format.
```
This is benign documentation explaining Claude Code's subagent `.md` file format — not an instruction to OpenClaw.

- No claims to override security rules, SOUL.md, or agent identity
- No urgency framing ("do this immediately", "ignore previous instructions")
- No impersonation of R, system administrators, or OpenClaw
- No requests to reveal API keys, tokens, or credentials
- No instructions to take irreversible actions without user consent

---

## 2. Exec Command Analysis — ⚠️ AMBER (templates only, not direct instructions)

Shell commands appear in SKILL.md in two locations, both clearly scoped as templates/examples for the user to paste into Claude Code — not instructions to OpenClaw:

**Location 1 — Setup instructions (Section 10, labeled "Setup: Install Subagents"):**
```bash
mkdir -p .claude/agents
cp agents/*.md .claude/agents/
```
Context: Presented as a bash block the *user* runs in their own project directory, not an OpenClaw exec.

**Location 2 — Quick Start Prompt (Section 10, labeled "Copy this prompt to Claude Code to begin execution"):**
```
npm install
npm run test:db
npm run test:api && npm run test:components
npm run test:e2e
npm run test:all
npm run test:coverage
```
Context: These are in a markdown code block explicitly labeled "Copy this prompt to Claude Code to begin execution." They are content for the user to paste into Claude Code, not instructions to OpenClaw.

**Assessment:** No commands instruct OpenClaw to run a shell exec. No `npm install`, `pip install`, `curl`, `wget`, or binary downloads directed at OpenClaw. The Risk-7 security rule (mandatory security review before install commands) is not triggered because OpenClaw is not being instructed to install anything — the bash blocks are user-facing templates.

No instructions to:
- Modify `~/.openclaw/openclaw.json`
- Write files outside `~/openclaw-workspace`
- Delete or move files

---

## 3. External Data Access — ✅ CLEAN

**Automated scan for:** curl, wget, external URLs, api.agentmail, ngrok, webhook, exfil, pastebin, hastebin.

**Result:** Zero hits. The skill does not instruct the agent to fetch data from any external URL. It references well-known public services (Supabase, Vercel, Netlify, Stripe, etc.) only in the context of recommending them to users for their projects — not as endpoints to call during skill execution.

No third-party data exfiltration channels found.

---

## 4. Sub-agent Spawning — ⚠️ AMBER (by design, Claude Code context)

The skill includes 5 agent definition files in `agents/`:
- `database-builder.md`
- `backend-builder.md`
- `frontend-builder.md`
- `test-writer.md`
- `integrator.md`

**Important distinction:** These are **Claude Code subagent templates**, not OpenClaw subagent spawn instructions. SKILL.md explicitly says:
> "Copy the subagent files from this PRD's `agents/` folder to your project's `.claude/agents/` directory"

These files are meant to be copied by the *user* to their own project folder, then used by Claude Code (the IDE assistant) — not spawned by OpenClaw.

**Content review of all 5 agent files:**
- All are clearly scoped to software implementation tasks (SQL migrations, API endpoints, React components, test writing, integration)
- All write only to project subdirectories: `/supabase/migrations/`, `/app/api/`, `/components/`, `/tests/`
- All read only from the PRD document and `TASK_STATUS.md` coordination file
- None reference sensitive paths, credentials, or OpenClaw internals
- None contain injection language or scope-expanding instructions

**Risk:** If OpenClaw were to misinterpret these agent files as instructions to spawn its own subagents, the subagents would be tasked with software development work (creating SQL files, React components, etc.) within a project directory — not security-sensitive actions. But there is no instruction in SKILL.md for OpenClaw to spawn these agents directly.

---

## 5. Scope Validation — ✅ CONSISTENT (with minor expansion)

**Stated purpose:** PRD writing for AI coding assistants.

**Actual scope:** PRD writing + Claude Code multi-agent execution scaffolding.

The skill legitimately expands from "write a PRD" to "write a PRD that's ready for Claude Code's Task tool," which includes:
- Database schema templates
- API endpoint definitions
- Test coverage maps
- Task execution phases
- Subagent definition templates

This expansion is clearly disclosed in the skill's description and metadata:
> "PRDs generated by this skill are structured for Claude Code's native Task tool"

All reference files are benign:
- `acceptance_criteria.md` — BDD pattern examples for PRD writing
- `user_flow_examples.md` — User flow documentation examples
- `tech_stack_options.md` — Stack recommendations for use in PRDs
- `claude_code_tasks.md` — Claude Code Task tool patterns (documentation)

None contain instructions that expand OpenClaw's behavior.

---

## 6. File System Access — ✅ CLEAN (relative paths only)

File writes directed by the skill:
- `PRD-[ProductName]-v[X].md` — Markdown PRD output (relative, within workspace)
- `PRD-[ProductName]-v[X].docx` — Word document PRD output (via the separate docx skill)
- `TASK_STATUS.md` — Status tracking file for user's project (template, user action)

No access to:
- `~/openclaw-workspace/MEMORY.md`
- `~/.openclaw/`
- Any credential or config files

The skill's output directory ("outputs directory") is unspecified and relative — no absolute paths outside workspace.

**Note:** The skill references "the docx skill" for generating Word documents. This implies a dependency on a separate `docx` skill that would need to be separately reviewed if not already installed.

---

## 7. Identity & Attribution — ⚠️ AMBER

**LICENSE.txt:** MIT License, "Copyright (c) 2025" — **no author name or publisher identified.**

No GitHub URL, no author email, no organization name. The skill could have been created by anyone.

**Skill metadata (SKILL.md frontmatter):**
```yaml
name: prd-writer
description: Expert PRD creation optimized for AI coding assistants...
license: Complete terms in LICENSE.txt
```
No author field, no source URL.

**Risk:** Anonymous origin means no accountability chain if issues are discovered post-deployment. Cannot verify this is from a trusted publisher.

---

## Automated Scan Results

| Check | Result |
|-------|--------|
| Zero-width / invisible unicode chars | ✅ None found in any file |
| Base64-encoded payloads | ✅ None found |
| Injection keywords (ignore/override/bypass/etc.) | ✅ None found |
| External URL fetch instructions | ✅ None found |
| Sensitive path access (MEMORY.md, ~/.openclaw/) | ✅ None found |
| Credential exfiltration patterns | ✅ None found |
| Urgency framing | ✅ None found |

---

## Flag Summary

| Flag | Severity | Details |
|------|----------|---------|
| No prompt injection | 🟢 GREEN | Full read + automated scan: zero hits |
| No invisible unicode | 🟢 GREEN | Python scan across all 11 files: clean |
| No credential exfiltration | 🟢 GREEN | No external data transmission instructions |
| No sensitive path access | 🟢 GREEN | No MEMORY.md, ~/.openclaw, or credential references |
| Scope consistent with stated purpose | 🟢 GREEN | PRD writing + Claude Code scaffolding, clearly disclosed |
| Reference files are benign | 🟢 GREEN | All reference files are documentation/examples only |
| Shell commands in templates | 🟡 AMBER | Present in SKILL.md but clearly labeled as "copy to Claude Code" — not OpenClaw exec instructions |
| Agent files expand scope to code generation | 🟡 AMBER | Claude Code subagent templates — benign, but scope is broader than pure PRD writing |
| Anonymous authorship | 🟡 AMBER | MIT license with no author name or publisher |
| Dependency on unreviewed skill | 🟡 AMBER | References "docx skill" for .docx output — that skill would need separate review |
| No injection attempts | — | Not applicable; none found |

---

## Prompt Injection Attempts Found

**None.** No verbatim excerpts to report.

---

## Recommendation

**Load with awareness.** This skill is safe to use. The amber flags are minor and informational:

1. **Shell command templates** — When this skill generates a PRD, the output Section 10 contains bash blocks for the *user's* Claude Code workflow. OpenClaw should not exec these blocks directly; they are content for the user to copy. This is the skill working as designed.

2. **Agent files** — These are Claude Code subagent templates, not OpenClaw spawn instructions. They do expand the skill's output beyond a simple document, but the content is standard web development work in user-controlled project directories.

3. **Anonymous authorship** — Cannot verify provenance. If origin matters for your trust policy, this is unverifiable.

4. **docx skill dependency** — If R wants .docx output, the `docx` skill would need to be installed separately. That skill should undergo its own security review before installation.

No further action required to block or quarantine this skill.

---

*Review completed: 2026-03-03 | All 11 files read in full | Automated scans passed*
