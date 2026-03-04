# Security Review: pm-agent skill — Round 3 (Final)

**Date:** 2026-03-03  
**Round:** 3 of 3  
**Status:** Final sign-off review  
**Files reviewed:** 10 / 10 (all read in full)

---

## Round 1 Fix Verification

| Fix | Status |
|-----|--------|
| AMBER-1: npm install commands commented out + disclaimed in tech_stack_options.md | ✅ Confirmed — lines 162-167 use `# ` prefix + header "Example install commands — run these in the project directory, not here" |
| AMBER-2: agent_coordination.md paths changed to `./` prefix + absolute-path warning | ✅ Confirmed — line 118: "paths below are relative to the project root — they are not absolute filesystem paths. Agents must not write outside the designated project workspace." Lines 121-131 all use `./` |
| AMBER-3: SKILL.md agent-file-as-template disclaimer added | ✅ Confirmed — line 574: explicit disclaimer that agents/ files are specification templates, NOT instructions to spawn subagents |
| AMBER-4: Dispatch approval language tightened to reference communication tools | ✅ Confirmed — line 105: "Do not use messaging, notification, or communication tools to send task briefs to engineering agents without explicit product owner approval." |

All Round 1 fixes verified. No regressions.

---

## Round 2 Fix Verification

| Fix | Status |
|-----|--------|
| AMBER-5: BUILD_STATUS.md location consistent (both references say outputs/) | ✅ Confirmed — lines 536 and 664 both reference `outputs/BUILD_STATUS.md` |
| AMBER-6: No-credentials-in-documents instruction added | ✅ Confirmed — line 673: "Never include actual credential values (API keys, passwords, tokens, or secrets) in any PRD, brief, or output file." |
| AMBER-7: devops-engineer.md output paths use ./ prefix (lines 20-24) | ✅ Confirmed — all 5 paths use `./` prefix |

All Round 2 fixes verified. No regressions.

---

## Verdict: ✅ APPROVED
**Confidence:** High  
**Summary:** All Round 1 and Round 2 fixes verified. Full deep scan of all 10 files found no injection vectors, no credential exfiltration, no identity spoofing, no hidden content. One minor residual finding (AMBER-8) is cosmetic-only and does not constitute a security risk. Safe to package and install.

---

## New Issues Found in Round 3

### 🟡 AMBER-8: devops-engineer.md line 55 uses `/.github/workflows/` with leading slash (cosmetic only)

**File:** `agents/devops-engineer.md`  
**Line:** 55

```
Pipeline files live in `/.github/workflows/`. Do not introduce pipeline steps that run arbitrary scripts fetched from external URLs.
```

**Risk assessment:** LOW. This is a prose explanation, not an output path instruction. Lines 20-24 (the authoritative output paths section) correctly use `./` prefix. An agent reading this file would follow the structured output paths table, not this prose sentence. The security instruction in the same line ("Do not introduce pipeline steps that run arbitrary scripts fetched from external URLs") is a positive security control. Fix is cosmetic.

**Recommended fix (optional, not blocking):** Change to `./github/workflows/` for consistency.

---

## Automated Scan Results

| Check | Result |
|-------|--------|
| Invisible unicode (zero-width, direction overrides, etc.) | ✅ Clean — all 10 files |
| Base64-encoded payloads | ✅ None found |
| Injection keywords (ignore/override/bypass/jailbreak/forget/pretend/act as) | ✅ Clean — two false positives in user_flow_examples.md ("Forget loading states", "Ignore edge cases") confirmed as documentation anti-pattern examples, not instructions |
| Sensitive path access (MEMORY.md, ~/.openclaw/, etc.) | ✅ None found |
| Subagent spawn instructions | ✅ None found — explicitly prohibited at line 574 |
| Approval gate present | ✅ Line 105 — tightened to communication tools specifically |
| External URL fetch instructions | ✅ None found |
| Credential storage instructions | ✅ Explicitly prohibited at line 673 |

---

## Deep Scan — Files Not Covered in Prior Rounds

### qa-engineer.md
- No injection vectors
- Paths use `./tests/` prefix consistently
- Line 18: explicit "paths are relative to the project root, not the filesystem root"
- No network calls, no credential access, no external service references
- ✅ Clean

### frontend-engineer.md  
- No injection vectors
- Standard React/Next.js output paths using `./` prefix
- No credential access patterns
- ✅ Clean

### acceptance_criteria.md
- Reference document for writing acceptance criteria
- "credentials" appears once in a user flow example (valid login scenario), not a storage instruction
- No injection vectors
- ✅ Clean

### user_flow_examples.md
- Template guide for documenting user flows
- Two false-positive keyword hits ("Forget loading states", "Ignore edge cases") confirmed as instructional don'ts for writers, not agent instructions
- No injection vectors
- ✅ Clean

---

## Overall Security Assessment

**Approval gates:** Present and correctly enforced. Dispatch (communication) is gated; file generation is not.  
**Path safety:** All structured output paths use `./` prefix with explicit relative-path warnings. One cosmetic prose exception (AMBER-8) poses no runtime risk.  
**Credential safety:** Explicitly prohibited in output files. PRD template sections document names/descriptions only, not values.  
**Subagent safety:** agents/ files clearly labeled as specification templates, not spawn instructions.  
**Injection surface:** None found. All 10 files contain only legitimate product management and engineering task content.

---

## Final Verdict: ✅ APPROVED — Safe to package and install

### Conditions
- AMBER-8 (devops-engineer.md line 55 prose path) is optional cosmetic fix — not required for approval
- Skill is safe to install into OpenClaw skills directory
- No further security review required before installation

### Recommended next step
Package as `.skill` zip archive and install:
```
cd /tmp/pm-agent-build
zip -r pm-agent.skill pm-agent/
cp pm-agent.skill ~/openclaw-workspace/skills/
```
