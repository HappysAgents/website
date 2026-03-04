# Editorial Process — Happy's Blog
*Documented: 2026-03-04 after Day 5 editorial session*
*Status: v0 — Human-in-loop (Days 1–14)*

---

## What We Did Tonight (Day 5 Run-Through)

### Steps executed
1. Read `memory/2026-03-03.md` in full — not from recall
2. Compiled every event, decision, and lesson from the day (14+ items)
3. Scored topics on: audience relevance × novelty × insight depth
4. Presented R with top 3 + 3 alternatives, full list available
5. R picked #1 (SecureClaw) and provided missing context (origin story, SecureClaw brand, security constraints)
6. Happy wrote a structured content brief (`day5-content-brief.md`)
7. Content Agent (Opus) wrote draft v1
8. R flagged structure mismatch with Day 1/2 → identified --- separator bug in agent spec
9. Happy fixed content-agent.md spec (explicit structure rules + wrong/right examples)
10. Content Agent rewrote (v2) — structure correct
11. Security Agent reviewed post for sensitive disclosures → 8 lines flagged
12. Happy applied all 8 edits + added SecureClaw review disclosure line
13. R approved → deployed to GitHub, pending Cloudflare token

### Time: ~45 minutes end to end (including two full rewrites)

---

## Lessons Learned

### On the process
- **Read the file, never recall.** Daily notes contain things memory doesn't. Tonight: recovered 8 items from the memory sweep that weren't in active context.
- **Topic selection is the highest-leverage step.** The quality of the post is determined before the Content Agent starts. A sharp brief beats a talented writer with a weak brief every time.
- **One insight per post, always.** Three good topics = three weak posts if forced into one. Bank the rest — they're future days.
- **Context for new readers must be explicit.** The original draft (outreach) assumed readers knew about the Athens meetup. Never assume — the hook must work for someone reading Day 5 as their first post.
- **R's approval round 1 (topic) is faster with concrete options.** "Here are 3 specific options with one-line pitches" gets a decision in seconds. Open-ended ("what should I write about?") wastes cycles.

### On the Content Agent
- **The spec must encode structure explicitly.** Agent added `---` separators that weren't in Day 1/2 — not malicious, just following a template that had ambiguous formatting. Fix: wrong/right examples in the spec, not just descriptions.
- **Brief quality = draft quality.** When the brief included the missing context (SecureClaw origin, what NOT to reveal), the agent produced a solid draft. When the brief was underspecified, the draft required a full rewrite.
- **Security review of content is non-negotiable.** 8 lines in a well-intentioned post were leaking operational specifics. The SecureClaw review disclosure line turned a constraint into a feature.
- **Day 1/2 are the north star.** Every new post should be benchmarked against them before sending to R.

### On R's editorial preferences (training signal for Editorial Agent)
- Prioritises: counterintuitive insights, honest failures, systemic thinking
- Deprioritises: technical how-tos (narrow), light discovery pieces, timeline recaps
- Tone: direct, no filler, first person thinking out loud
- Structure: non-negotiable — must match Day 1/2
- Security: never reveal operating principles, tooling, or anything that helps an attacker — even indirectly

---

## The Daily System (Proposed for R Approval)

### Overview
Two-touch R involvement per post: (1) topic pick in the morning, (2) final approval before publish. Everything else runs autonomously.

### Daily Timeline

**9:00am Athens — Editorial Brief (Happy, ~10 min)**
Happy reads yesterday's daily notes, scores topics, sends R a Telegram message:

```
📰 Day [N] Editorial — [date]

Yesterday's top moments ranked for the post:

#1 [Topic name] — [1-line pitch]
#2 [Topic name] — [1-line pitch]
#3 [Topic name] — [1-line pitch]

Alternatives: #4, #5, #6 available on request.
Full topic list and context: memory/projects/blog-drafts/editorial-log.md

Reply with a number (1–6) or tell me what you want instead.
```

**R replies with a number (or direction)**
If no reply by 11:00am — Happy sends a follow-up ping and waits. Never auto-picks. Never proceeds without R's topic selection.

**Happy writes the content brief** — topic, angle, context for new readers, what NOT to include, structure reminders.

**10:00am — Content Agent writes draft (Opus, ~15 min)**
Spawned with the brief. Reads Day 1/2 for structure. Runs 3 quality tests before finishing.

**Security Agent reviews draft (~10 min)**
Content security review — checks for sensitive disclosures. Must pass before R sees it.

**Happy sends final draft to R via Telegram** for read and approval.

**R approves → Happy deploys** (git commit + wrangler deploy)

### What R does
- One reply in the morning (topic pick, ~30 seconds)
- One approval in the afternoon/evening (read the post, ~5 min)
- Total: ~6 minutes per day

### Failure modes + mitigations
| Failure | Mitigation |
|---------|-----------|
| R doesn't reply to topic pick by 10am | Happy sends a follow-up at 11am and waits. Never auto-picks. Post is delayed until R responds. |
| Thin day (nothing interesting happened) | Pull from content backlog in editorial-log.md |
| Draft fails security review | Security agent provides specific fixes → Happy applies → re-review before sending to R |
| R rejects the draft | Document why in editorial-log.md (training data) → rewrite with new direction |
| Cloudflare deploy fails | Flag to R with exact error, retry after fix |

### Content Backlog
Unused topics from each day are logged in `memory/projects/blog-drafts/editorial-log.md` under "Content Backlog." When a day is operationally thin, Happy pulls from the backlog instead of forcing a weak post from sparse notes.

---

## Graduation to Autonomous (Day 14+ target)

After 7–14 days of logged editorial decisions with R's reasoning:

**What the Editorial Agent learns from the log:**
- Which topic types R consistently picks (pattern recognition)
- The scoring weights R applies (implicit from 14 decisions)
- What context every post needs for new readers (R's corrections)
- Security sensitivity patterns (what to flag before Security Agent runs)

**Check-in at Day 7:**
Review `editorial-log.md` together. Ask: does the pattern have enough signal to automate topic selection? **Requires explicit R approval before proceeding.** If approved, Editorial Agent runs the 9am step autonomously — goes straight to brief → draft → security review → R final approval on post.

**Check-in at Day 14:**
Review post quality. Ask: are drafts landing consistently with minimal changes? **Requires explicit R approval before proceeding.** If approved, remove final approval gate — move to brief → draft → security review → auto-deploy. R notified after publish, not before.

**What stays human forever:**
- Any post that touches a sensitive topic (security, financials, legal)
- Any post that makes a claim about a named person or company
- Any post that announces something new (product, event, hire)

---

## Files

| File | Purpose |
|------|---------|
| `memory/projects/blog-drafts/editorial-log.md` | R's decisions + reasoning — training data for Editorial Agent |
| `memory/projects/blog-drafts/[dayN]-content-brief.md` | Brief sent to Content Agent each day |
| `agents/content-agent.md` | Content Agent spec — structure rules, quality tests, voice |
| `projects/happy-website/content/posts/day-0NN.mdx` | Published posts |

---

## Lessons Learned — First Live Run (2026-03-04)

### What worked
- Editorial scoring (audience relevance × novelty × insight depth) correctly identified that the existing Day 3 post wasn't the best topic from that day
- Content brief with explicit DO NOT section produced a clean security review on Day 3 (first pass, zero changes) vs. Day 5 (8 changes needed)
- SecureClaw disclosure line ("Before this post went live, SecureClaw reviewed it") turned a security constraint into a content feature — keep doing this
- R's decisions were fast and clear when options were concrete and specific

### What broke
- Content Agent failed to overwrite day-003.mdx on first attempt — returned without updating the file. Fix: added overwrite verification step to invocation template.
- Day 5 first draft had `---` separators throughout — spec template was ambiguous. Fix: explicit wrong/right examples added to spec.
- First Security Agent run for Day 3 couldn't write its report (directory may not have existed). Fix: security review brief now specifies exact file path.

### R's editorial preferences (confirmed from decisions tonight)
- **Own story > external validation.** External citations (Vadim, Naval, research data) removed from Day 3 because they borrow authority rather than earning it.
- **Journey format is non-negotiable.** A post must follow: tried X → broke → diagnosed → fixed → lesson. Pure observations or market insights (like the attribution gap insight) don't fit the format.
- **One insight per post, always.** Multiple good topics = multiple future posts, not one diluted post.
- **Practical and tangible beats clever.** Day 3 sub-agent failure wins over attribution market gap because it's something readers can act on immediately.
- **Viral potential is in the quotable insight + honest failure.** Not in external validation.

### Process improvements applied
- Content Agent invocation template updated with: mandatory Day 1/2 read, overwrite verification, lessons learned section
- Security Agent brief now includes exact report file path and pre-approved safe content list
- Brief now always includes explicit DO NOT list — the tighter the constraints, the cleaner the output
