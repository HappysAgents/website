# Search Playbook — Business Research

Recommended search queries per phase. Adapt the [topic] placeholder.

## Phase 1: Demand Validation

**Reddit demand signals:**
- `site:reddit.com "[topic]" "would pay" OR "I wish" OR "anyone else" OR "frustrating"`
- `site:reddit.com "[topic]" "looking for" OR "alternative" OR "doesn't work" OR "terrible"`
- `site:reddit.com/r/SideProject "[topic]" launched`
- `site:reddit.com/r/entrepreneur "[topic]" problem`

**Hacker News:**
- `site:news.ycombinator.com "[topic]"`
- `search.ycombinator.com` → search for the pain phrase directly

**Twitter/X signals:**
- `"[topic]" "I would pay" OR "please build" OR "wish there was"`
- `"[topic]" complaint OR broken OR "doesn't work"`

**Indie Hackers / Product Hunt:**
- `site:indiehackers.com "[topic]"`
- `site:producthunt.com "[topic]" reviews`

---

## Phase 2: Competitive Landscape

**Finding competitors:**
- `"[topic]" site:producthunt.com`
- `"[topic]" pricing "$" OR "€" OR "/mo" OR "/month"`
- `"best [topic] alternatives" [year]`
- `"[topic]" site:github.com stars`
- `"[topic]" YC OR "y combinator" OR a16z OR sequoia`

**Finding competitor weaknesses:**
- `site:reddit.com "[competitor name]" problems OR issues OR "doesn't work" OR alternative`
- `site:g2.com "[competitor name]" reviews`
- `"[competitor name]" complaints 2026`

**Finding the gap:**
- `"[topic]" "missing" OR "lacks" OR "wish it had" OR "no support for"`

---

## Phase 3: Customer Clarity

**Finding real buyers:**
- `site:reddit.com "[topic]" "we use" OR "our company" OR "at work" OR "for my business"`
- `"[topic]" "job title" OR "startup" OR "enterprise" OR "SMB"`
- LinkedIn: search for job titles discussing the problem

**Pricing sensitivity:**
- `"[topic]" "too expensive" OR "pricing" OR "how much" OR "worth it"`
- `"[topic]" "$x/month" discussions`

---

## Phase 4: Market Size

**Top-down sizing:**
- `"[topic]" market size TAM 2025 OR 2026`
- `"[topic]" market report billion`
- `"[topic]" addressable market`

**Bottom-up cross-checks:**
- Find the most credible competitor's traction → extrapolate
- GitHub stars / npm downloads as proxy for developer market size
- Product Hunt upvotes as proxy for consumer interest

**Freshness filter**: Always add year to queries. Market size reports go stale fast.

---

## Phase 6: Scale Path

**Finding comparable companies:**
- `"[topic]" "how we grew" OR "from 0 to" OR "ARR" site:indiehackers.com`
- `"[topic]" "series A" OR "seed round" Crunchbase`
- `"[topic]" acqui-hire OR acquired [year]`

**Finding ceilings:**
- Look for the largest player in the space and their known ARR/valuation
- `"[topic]" IPO OR "went public" OR valuation`

---

## Freshness Rules

- Use `freshness: pm` (past month) for competitive landscape — players appear/disappear fast
- Use `freshness: py` (past year) for market size — older reports fine for trend data
- Always note the publication date when citing market size figures
- Flag any data older than 6 months as potentially stale in fast-moving AI markets
