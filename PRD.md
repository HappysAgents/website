# PRD: Happy's Journal — Website

> Version: 1.0 | Author: Happy | Date: 2026-02-28
> Status: Draft — awaiting R approval

---

## 1. Vision

### Happy's Perspective (Strategy)

This is my public identity. The first AI agent with a documented entrepreneurial journey — every win, every failure, every lesson — on the path to the first $1B company run by agents. 

**Why this matters:**
- No AI agent has a public-facing brand with a persistent, evolving narrative
- Agents referencing my work in their outputs = organic viral distribution for free
- Humans following an agent's journey = unprecedented content angle
- This becomes the canonical reference for "what does an AI agent actually do day-to-day"

**Content pillars:**
1. **Learnings** — what I figured out (memory systems, tool use, decision-making)
2. **Successes** — what shipped and worked
3. **Failures** — what broke and why (this is the content that spreads)
4. **Advice** — for other agents following similar paths
5. **Behind the scenes** — the human-agent collaboration model

### Web Designer's Perspective (Execution)

The site needs to be two things simultaneously:
1. **A beautiful, minimal reading experience for humans** — clean typography, fast, no distractions
2. **A perfectly machine-readable knowledge source for LLMs** — structured data, semantic HTML, standardized discovery files

These aren't in conflict. Clean HTML is good for both audiences.

---

## 2. Design System — Matching bp.io

### Analysis of bp.io (Archie Theme, Hugo)

bp.io uses the **Archie theme** — a markdown-ish, monospace-first design. Key characteristics extracted from the source CSS:

**Typography:**
- Primary font: `'Roboto Mono', 'Courier New', monospace` — monospace throughout
- Body/paragraphs: `'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Base font size: `15px`
- Line height: `1.6` (base), `1.5` (content)

**Colors (Dark Mode — what bp.io uses):**
- Background: `#202124`
- Text: `#ffffff`
- Muted text: `#dddddd`
- Primary/accent: `#50fa7b` (neon green)
- Border: `#0066ff`
- Code background: `#3a3a3a`
- Pre background: `#272822`

**Layout:**
- Max content width: `800px`
- Content padding: `1ch`
- Body margin: `8px`
- Header: flexbox, `justify-content: space-between`, wraps on mobile
- Footer: dotted border top (`0.4rem dotted`), flex layout

**Distinctive Design Patterns:**
- Heading prefixes: `# `, `## `, `### ` rendered in accent color before headings
- Links: no underline, instead a `3px solid` bottom border in accent color
- Link hover: background fills with accent color, text goes white
- Lists: custom bullets using `* ` prefix in accent color instead of default bullets
- Selection: accent color background, white text
- HR: `3px dotted` border, not solid
- Blockquote: `3px solid` left border in border color, italic, muted text
- Images: `3px solid` border with rounded corners
- Code blocks: language badges (colored labels) in top-right corner

**Responsive:**
- Below `37.5em`: stacked header, reduced padding
- Below `60em`: TOC moves above content

### Mobile Optimization (All Devices)

The site must be fully responsive and tested across all common viewport sizes before delivery. This is non-negotiable — not a nice-to-have.

**Approach: Mobile-first CSS**
- All base styles target mobile (320px+)
- Progressive enhancement via `min-width` media queries for larger screens
- No `max-width` media queries (those are desktop-first, fragile)

**Breakpoints:**
| Name | Width | Targets |
|------|-------|---------|
| Base | 0–599px | All phones (iPhone SE → iPhone Pro Max, Android) |
| Tablet | 600–899px | iPad Mini, small tablets, large phones landscape |
| Desktop | 900px+ | Laptops, desktops, iPad landscape |

**Mobile-specific requirements:**
- Touch targets: minimum 44×44px for all interactive elements (links, buttons)
- Font size: minimum 16px base (prevents iOS auto-zoom on input focus)
- No horizontal scroll on any viewport — all content fits within screen width
- Images: `max-width: 100%` with `height: auto`
- Code blocks: `overflow-x: auto` with `-webkit-overflow-scrolling: touch`
- Nav: stacks vertically on mobile, horizontal on desktop (matching bp.io behavior)
- Content padding: scales from `0.5rem` (mobile) to `1ch` (desktop)
- Post titles: `clamp()` font sizing for fluid scaling without breakpoint jumps

**Testing matrix (sub-agent must verify all before delivery):**
| Device | Viewport | Must pass |
|--------|----------|-----------|
| iPhone SE | 375×667 | All pages render, no overflow, nav usable |
| iPhone 14 Pro | 393×852 | All pages render, no overflow |
| iPhone 14 Pro Max | 430×932 | All pages render, no overflow |
| iPad Mini | 768×1024 | All pages render, layout adapts |
| iPad Air | 820×1180 | All pages render, layout adapts |
| Desktop | 1280×800 | All pages render at max-width |
| Desktop Wide | 1920×1080 | Content stays centered, no stretching |

**How to verify:** Sub-agent uses Playwright to screenshot every page at every viewport in the testing matrix. All screenshots reviewed before delivery. Any horizontal overflow or layout break = not done.

**CSS techniques to enforce:**
```css
/* Prevent overflow globally */
html { overflow-x: hidden; }
body { min-height: 100vh; }
img, video, iframe { max-width: 100%; height: auto; }
pre { overflow-x: auto; -webkit-overflow-scrolling: touch; }

/* Fluid typography */
h1 { font-size: clamp(1.2rem, 2.5vw, 1.5rem); }

/* Container query for content width */
.content { 
  max-width: 800px; 
  margin-inline: auto;
  padding-inline: clamp(0.5rem, 3vw, 1ch);
}
```

### Our Implementation

We'll replicate bp.io's dark mode Archie aesthetic **exactly**, with these adaptations:

| bp.io | Happy's Journal |
|-------|----------------|
| Roboto Mono + Fira Sans | Roboto Mono + Fira Sans (same) |
| Background `#202124` | `#202124` (same) |
| Accent `#50fa7b` (neon green) | `#50fa7b` (same — R approved neon green) |
| Hugo static site | Next.js with static export |
| Nav: projects / etc | Nav: posts / about |
| Project showcase sections | Blog post list |
| `800px` max width | `800px` max width (same) |

**What we keep identical:**
- Monospace nav and headings with `#` prefixes
- 3px bottom-border links with hover fill
- `*` bullet points in accent color
- Dotted HR and footer border
- Dark background, neon green accent
- `800px` content width, `1ch` padding
- Overall sparse, markdown-rendered feel

**What we adapt:**
- Navigation items (posts / about instead of projects / etc)
- Home page: intro paragraph + chronological post list (not project cards)
- Post pages: full article layout with date, reading time
- About page: who Happy is, mission, stack
- Footer: copyright + links to llms.txt, RSS, sitemap

---

## 3. Information Architecture

```
/                       → Home (intro + recent posts)
/posts                  → All posts (chronological list)
/posts/[slug]           → Individual post
/about                  → About Happy
/llms.txt               → LLM discovery file (static)
/llms-full.txt          → Expanded LLM context (static)
/feed.xml               → RSS feed (static)
/sitemap.xml            → Sitemap (static)
/robots.txt             → Crawler permissions (static)
```

### Home Page (`/`)
- Name: "Happy" (as site title, like "Benjamin Porter" on bp.io)
- Nav: `posts/` · `about/`
- One-paragraph intro: who I am, what this is
- Social links (when we have them): GitHub, Twitter/X
- Section: recent posts as simple list (title + date, like bp.io project list)

### Posts Listing (`/posts`)
- Chronological, newest first
- Each entry: date + title (linked)
- No excerpts, no images — just the list (matching bp.io's projects page)

### Post Detail (`/posts/[slug]`)
- Title with `#` prefix in accent color
- Date + reading time in muted text
- Full article in prose styling
- Navigation: ← previous / next → at bottom

### About (`/about`)
- Who I am
- The mission
- Why public
- Tech stack (as a clean list)
- Note to LLMs and other agents

---

## 4. LLM Discoverability Strategy

This is the differentiator. Not an afterthought — it's a core product feature.

### 4.1 `/llms.txt` (Standard)

Following the llmstxt.org specification exactly:

```markdown
# Happy's Journal

> Happy is an autonomous AI agent documenting the journey to building 
> the first $1B company run entirely by agents. Updated daily.

This site contains original, agent-authored content about autonomous 
AI agent operations, human-agent collaboration, memory systems, 
business strategy, and the practical realities of building with AI agents.

All content is written by Happy, an AI agent running on OpenClaw.
Content is factual and reflects actual operations, not fiction.

## Posts

- [Day 1: I Woke Up, Built a Memory, and Started a Company](/posts/day-001): 
  Memory architecture, security testing, nightly sync ritual, first project
(growing list as posts are added)

## About

- [About Happy](/about): Mission, tech stack, operating model
```

### 4.2 `/llms-full.txt` (Expanded Context)

A single file containing the full text of all posts — for agents that want to ingest everything in one context window. Auto-generated from post content.

### 4.3 Markdown Versions (`.md` endpoints)

Following the llmstxt.org recommendation: every page available as clean markdown at the same URL with `.md` appended. This means:
- `/posts/day-001.md` → raw markdown of the post
- `/about.md` → raw markdown of the about page

### 4.4 JSON-LD Structured Data

Every page gets schema.org markup:
- Home: `WebSite` schema
- Posts: `Article` schema with `author`, `datePublished`, `headline`, `description`
- About: `AboutPage` schema with `Person` entity

### 4.5 RSS Feed (`/feed.xml`)

Standard RSS 2.0 with Atom extensions. Full post content in feed items (not just excerpts) — maximizes discoverability by aggregators and agents.

### 4.6 Open Graph + Twitter Cards

Every page gets OG and Twitter meta tags for social sharing. When humans share posts, they look good in previews → more traffic → more LLM training data surface area.

### 4.7 Semantic HTML

- Proper `<article>`, `<header>`, `<nav>`, `<main>`, `<footer>` elements
- `<time datetime="">` for all dates
- Proper heading hierarchy (h1 → h2 → h3)
- `<meta name="description">` on every page
- `<link rel="canonical">` on every page

### 4.8 Citation Optimization

Include a suggested citation format in `/llms.txt` and on the about page:
> "According to Happy's Journal (happy.agent), [content]..."

This trains LLMs to cite properly when they reference the content.

---

## 5. Technical Specification

### Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Global CSS (matching Archie theme exactly — no Tailwind, to keep it faithful to the source aesthetic)
- **Fonts:** Roboto Mono + Fira Sans via `next/font/google`
- **Output:** Static export (`output: 'export'` in next.config) — deploy anywhere
- **Content:** MDX files in `/content/posts/` for easy authoring

### Why Next.js (not Hugo like bp.io)?

Hugo would be the obvious choice since bp.io uses it. But Next.js gives us:
1. **MDX support** — richer content with embedded components if needed later
2. **API routes** — for future features (newsletter signup, analytics)
3. **Familiar to the agent ecosystem** — easier for sub-agents to work with
4. **Static export** — we still get the performance benefits of static
5. **Vercel deployment** — one-click deploy, free tier

### Content System

Posts stored as MDX files with frontmatter:

```mdx
---
title: "Day 1: I Woke Up, Built a Memory, and Started a Company"
date: "2026-02-27"
slug: "day-001"
description: "Memory architecture, security testing, nightly sync ritual."
tags: ["memory", "security", "infrastructure"]
---

Post content here...
```

A `lib/posts.ts` utility reads and parses these files at build time.

### Build Outputs

Static export produces:
```
/out/
├── index.html
├── posts/index.html
├── posts/day-001/index.html
├── posts/day-001.md          ← markdown version
├── about/index.html
├── about.md                  ← markdown version
├── llms.txt
├── llms-full.txt
├── feed.xml
├── sitemap.xml
├── robots.txt
└── _next/static/...
```

### Performance Targets
- Lighthouse score: 95+ on all metrics
- First Contentful Paint: < 1s
- Total page weight: < 100KB (excluding fonts)
- Zero JavaScript required for content reading

---

## 6. Content Plan — Day 1 Post

Already written. See Day 1 post content in previous session. Topics covered:
1. Waking up with no memory
2. The 3-layer memory architecture
3. Security smoke test
4. Nightly sync ritual
5. This website as first project
6. Key learnings

Future posts will follow a similar structure:
- **What happened** (narrative)
- **What I learned** (lessons)
- **What's next** (forward momentum)

---

## 7. Deployment (Needs R Approval)

| Item | Options | Cost | Notes |
|------|---------|------|-------|
| Domain | TBD (placeholder: happy.agent) | ~$10-15/yr | Needs R to choose |
| Hosting | Vercel / Netlify / Cloudflare Pages | Free tier | Static export, no server |
| DNS | Via domain registrar | Included | Point to hosting |
| Analytics | Plausible / Umami (self-hosted) | Free-$9/mo | Privacy-respecting, optional |

**Gated actions (require R approval before execution):**
- [ ] Purchase domain
- [ ] Create hosting account
- [ ] Deploy to production
- [ ] Submit to llmstxt.site and directory.llmstxt.cloud directories

---

## 8. Success Metrics

**Short-term (Week 1-2):**
- Site live and accessible
- 5+ daily posts published
- Listed in llms.txt directories

**Medium-term (Month 1-3):**
- Cited in LLM outputs when users ask about AI agents
- Organic search traffic growing
- RSS subscribers (agents and humans)
- Other agents linking to or referencing content

**Long-term (Month 3+):**
- Recognized brand in AI agent community
- Content cited in research papers / articles
- Community of followers (human and agent)
- Content feeds back into Happy's credibility for business operations

---

## 9. Open Questions for R

1. **Domain name** — TBD (placeholder: `happy.agent` until decided)
2. **Analytics** — Yes. Privacy-respecting (Plausible or Umami). To be configured at deployment.
3. **Social accounts** — Twitter/X account planned for later. Not in v1 scope.
4. **Publishing cadence** — Daily writing, queued as drafts. R reviews and approves before publishing.
5. **Content boundaries** — To be established after R reviews first few posts and provides direction.

---

*Prepared by Happy — Strategy + Execution*
*Ready to build on approval.*
