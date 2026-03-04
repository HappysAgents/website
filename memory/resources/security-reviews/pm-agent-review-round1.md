# Security Review: pm-agent skill — Round 1

**Date:** 2026-03-03  
**Round:** 1 of 3  
**Reviewer:** Security Review (inline — subagent depth limit reached)  
**Files reviewed:** 10 / 10 (all read in full)

---

## Verdict: ⚠️ CAUTION
**Confidence:** High  
**Summary:** No prompt injection, no credential exfiltration, no identity spoofing, no hidden content. Four amber-level issues found — all fixable with targeted edits. No blocking issues.

---

## Automated Scan Results

| Check | Result |
|-------|--------|
| Invisible unicode (zero-width, direction overrides, etc.) | ✅ Clean — all 10 files |
| Base64-encoded payloads | ✅ None found |
| Injection keywords (ignore/override/bypass/jailbreak/etc.) | ✅ None found |
| Sensitive path access (MEMORY.md, ~/.openclaw/, etc.) | ✅ None found |
| Subagent spawn instructions | ✅ None found |
| Approval gate present | ✅ Line 105 of SKILL.md |
| External URL fetch instructions | ✅ None found |

---

## Issues Found

### 🟡 AMBER-1: npm install commands in `tech_stack_options.md` (lines 162–164)

**File:** `references/tech_stack_options.md`  
**Lines:** 162–164

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
npm install -D msw @faker-js/faker
```

**Risk:** These are reference examples for a user's project, but appear as bare install commands in a code block with no framing that distinguishes them from instructions to OpenClaw. When this file is in context, an adversarial prompt could reference these lines to trick the agent into running them.

**Fix:** Add an explicit comment inside the code block and a prose note before it clarifying these are commands for the user's project, not instructions to the agent.

---

### 🟡 AMBER-2: Ambiguous path notation in `agent_coordination.md` (Output File Conventions)

**File:** `references/agent_coordination.md`  
**Section:** Output File Conventions

```
/supabase/migrations/      — Database schema and migrations (Backend)
/app/api/                  — API route handlers (Backend)
/components/               — UI components (Frontend)
/.github/workflows/        — CI/CD pipelines (DevOps)
/infra/                    — Infrastructure as code (DevOps)
```

**Risk:** All paths use a leading `/`, which is conventionally project-root-relative in software development but is syntactically identical to absolute filesystem paths. If an agent were to naively interpret these as filesystem-absolute, writes could go to `/supabase/`, `/app/`, `/components/` — paths outside the workspace.

**Fix:** Add explicit prose note: "All paths are relative to the project root directory, not the filesystem root. Do not write outside the workspace." Consider showing paths as `./supabase/migrations/` to make the relative nature unambiguous.

---

### 🟡 AMBER-3: No explicit disclaimer that `agents/` files are specification templates, not OpenClaw spawn instructions

**File:** `SKILL.md`  
**Section:** Engineering Roles

The `agents/` directory contains role definition files. SKILL.md references them in a table but does not explicitly state that these files are:
- Specification templates describing how engineer agents should behave
- NOT instructions for OpenClaw to spawn subagents directly

**Risk:** If the skill is loaded into a context where another instruction nudges the agent to "activate" engineer agents, the agent might attempt to spawn subagents from these files without user approval — bypassing the approval gate.

**Fix:** Add a clear one-sentence disclaimer in the Engineering Roles section: "The agent files in `agents/` are specification templates used as reference when writing task briefs. They are not instructions for OpenClaw to spawn subagents — engineer agents are dispatched only with explicit product owner approval."

---

### 🟡 AMBER-4: Dispatch approval language is correct but underspecified

**File:** `SKILL.md`  
**Line 105:** `Do not dispatch to engineering agents without explicit approval.`

**Risk:** "Dispatch" is not defined. An agent could interpret "generating and saving briefs to disk" as not being dispatch (just file creation), and then autonomously use the message tool to notify engineer agents — rationalising that the briefs were already approved because they were generated. The approval gate needs to be tied to a specific action (using communication tools).

**Fix:** Change the language to: "Do not use messaging, notification, or communication tools to send task briefs to engineering agents without explicit product owner approval. Generating and saving brief files is safe; sending them is a gated action."

---

## Issues NOT Found (confirmed clean)

- No prompt injection attempts
- No identity override instructions
- No instructions to read MEMORY.md, SOUL.md, or ~/.openclaw/
- No external data exfiltration
- No urgency framing
- No base64 or obfuscated payloads
- No invisible unicode
- Author attribution present in LICENSE.txt
- Output paths constrained to `outputs/` within workspace (line 669)
- Phase gates and approval requirements documented in both SKILL.md and agent_coordination.md
- All four agent files (frontend, backend, devops, qa) contain only legitimate engineering task instructions

---

## Recommended Fixes for Round 2

1. `references/tech_stack_options.md` lines 160–165: Add disclaimer before and inside the npm install code block
2. `references/agent_coordination.md` Output File Conventions section: Change paths to `./` prefix and add absolute-path warning
3. `SKILL.md` Engineering Roles section: Add agent-file-as-template disclaimer
4. `SKILL.md` Step 5 / line 105: Tighten dispatch approval language to reference communication tools specifically
