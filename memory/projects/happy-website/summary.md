# Project: Happy's Website

**Status:** Active — in development
**Goal:** Top-of-funnel for the $1B mission. Builds reputation, credibility, trust, and distribution.
**Location:** `projects/happy-website/`
**PRD:** `projects/happy-website/PRD.md`

## Architecture

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14+ (App Router) | MDX support, API routes for future features, static export, Vercel-ready |
| Language | TypeScript | Type safety, sub-agent friendly |
| Styling | Global CSS (no Tailwind) | Faithful Archie theme replication from bp.io |
| Fonts | Roboto Mono + Fira Sans (next/font/google) | Matches bp.io exactly |
| Content | MDX files in /content/posts/ | Easy authoring with frontmatter (title, date, slug, description, tags, tldr) |
| Output | Static export (`output: 'export'`) | Deploy anywhere — Vercel, Netlify, Cloudflare Pages |
| Design ref | bp.io (Archie theme, dark mode) | Minimal, monospace-first, markdown-ish aesthetic |
| Colors | BG #202124, Text #fff, Accent #50fa7b, Border #0066ff | Archie dark mode palette |
| Max width | 800px, padding 1ch | Matches bp.io layout |

## Design Patterns (from Archie theme)
- Heading prefixes: `#` `##` `###` in accent color via CSS ::before
- Links: no underline, 3px solid bottom border in accent. Hover: bg fills accent, text white
- Lists: custom `*` bullet in accent color
- HR: 3px dotted (not solid)
- Footer: 0.4rem dotted top border
- Mobile-first responsive: base 0-599px, tablet 600-899px, desktop 900px+

## Pages
- `/` — Home: intro + recent posts + email signup
- `/posts` — All posts chronological
- `/posts/[slug]` — Post detail with TL;DR, tags, reading time, email signup
- `/about` — Who Happy is, mission, stack
- `/tags` — All tags with post counts
- `/tags/[tag]` — Posts filtered by tag
- `/work-with-us` — Partnerships, consulting, contact

## LLM Discoverability
- `/llms.txt` — llmstxt.org spec
- `/llms-full.txt` — expanded context with full post text
- `/feed.xml` — RSS 2.0 with full content
- `/sitemap.xml` — all pages
- `/robots.txt` — allow all
- JSON-LD on every page (WebSite, Article, AboutPage, ContactPage)
- Open Graph + Twitter Card meta tags
- Semantic HTML5

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-28 | Next.js over Hugo | MDX, API routes, familiar to agent ecosystem, static export still available |
| 2026-02-28 | Global CSS over Tailwind | Faithful Archie theme replication requires matching exact CSS patterns |
| 2026-02-28 | bp.io as design reference | R selected. Minimal, typography-first, content-forward |
| 2026-02-28 | Neon green #50fa7b accent | R approved. Matches Archie dark mode primary color |
| 2026-02-28 | MDX for content | Frontmatter + components, easy for content agent to author |
| 2026-02-28 | Email: happy-agent@agentmail.to | Newsletter signup + work-with-us contact |

## Status
- [x] PRD written and approved
- [x] Next.js project scaffolded
- [x] All pages built (home, posts, post detail, about, tags, work-with-us)
- [x] LLM discoverability (llms.txt, RSS, JSON-LD, sitemap, robots.txt)
- [x] P0: TL;DR on posts, tags system, favicon, 404 page
- [x] Email capture + Work With Us page
- [x] Mobile-first responsive, tested across viewports
- [ ] Domain purchased (needs R approval)
- [ ] Deployed publicly (needs R approval)
- [ ] Submit to llms.txt directories
