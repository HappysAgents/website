# QMD — Quick Guide

> Version: 1.0.7 | Installed: 2026-03-05 | Author: Tobias Lütke (Shopify CEO)  
> Binary: `/Users/dirtyagent/.npm-global/bin/qmd`

---

## What It Is

QMD is a local search engine for files. It lets you ask natural language questions across a folder of documents and get back the most relevant snippets — without sending anything to an external API.

Think of it as **grep with a brain**, running entirely on this machine.

---

## How It Works — 3 Layers

QMD combines three search techniques and ranks results using all three:

**1. BM25 (keyword search)**
Classic full-text search. Fast. Good for exact terms, file names, specific phrases. Same engine as Elasticsearch.

**2. Vector search (semantic)**
Converts documents into mathematical embeddings and finds conceptually similar content — even if the exact words don't match. "What did we decide about the memory architecture?" finds relevant content even if those words aren't together.

**3. LLM reranking**
Takes the top results from BM25 + vector and runs them through a local LLM (GGUF model via node-llama-cpp) to re-score by actual relevance to the query. This is the layer that makes `qmd query` dramatically better than a keyword search.

**The model runs locally.** One-time download (~1–4GB GGUF file from HuggingFace) on first `qmd embed`. No ongoing API calls. No data leaves the machine.

---

## Core Commands

```bash
# Index a folder
qmd collection add ~/openclaw-workspace --name workspace --mask "*.md"

# Generate vector embeddings (do this after indexing)
qmd embed

# Smart search — BM25 + vector + LLM reranking (use this for memory queries)
qmd query "what did we decide about the COMPANY.md architecture?"

# Keyword-only search (faster, less smart)
qmd search "Beehiiv"

# Vector-only search (semantic, no reranking)
qmd vsearch "agent memory system"

# Check what's indexed
qmd status
qmd collection list

# Re-index after files change
qmd update

# Start as MCP server (for tool integrations)
qmd mcp --http --daemon
```

---

## Current Setup Recommendation

Index the workspace memory folder:

```bash
qmd collection add ~/openclaw-workspace/memory --name memory --mask "*.md"
qmd collection add ~/openclaw-workspace/agents --name agents --mask "*.md"
qmd embed
```

Then use `qmd query` instead of `memory_search` for detailed lookups — the results will be significantly better, especially as the memory system grows.

---

## Implications as the Memory System Expands

### ✅ What Gets Better With Scale
- **More files = better search quality.** QMD's vector model learns relationships across documents. At 10 files it's useful. At 500 files it becomes essential — keyword grep breaks down, QMD thrives.
- **Cross-document reasoning.** A query like "what are all the decisions we made about agent architecture?" will surface relevant snippets across MEMORY.md, daily notes, PARA project files, and agent specs simultaneously.
- **Replaces brittle grep patterns** in heartbeat and memory sweep tasks — more reliable, less maintenance.

### ⚠️ Things to Plan For

**1. Re-indexing discipline**
QMD doesn't auto-watch for file changes. After writing new files (daily notes, PARA updates), you need to run `qmd update` to re-index. If this isn't automated, searches will return stale results.

→ **Fix:** Add `qmd update` to the heartbeat or memory sweep cron.

**2. Embedding model size**
The GGUF model is 1–4GB. On this M1 Mac that's fine — but it's a one-time download that needs to complete before vector search works. If the Mac is ever reset or the model is deleted, it re-downloads on next `qmd embed`.

**3. Index storage grows with content**
QMD stores BM25 index + vector embeddings on disk. With thousands of markdown files, this will grow. Not a concern now, worth monitoring at scale (100k+ tokens of content).

**4. MCP integration = permanent upgrade**
Running `qmd mcp --http --daemon` exposes QMD as an MCP tool — meaning agents can query it directly via tool calls instead of Happy hand-crafting memory searches. This is the right end state. When we have 5+ agents all reading memory, MCP mode means they all use the same search index without separate configuration.

→ **Decision point:** When to enable MCP mode (probably when Coda or Nova need independent memory access).

**5. Sensitive content in the index**
QMD stores plaintext embeddings locally. The index contains everything from indexed folders — including any credentials, tokens, or sensitive data in markdown files. Currently: `memory/resources/credentials/` exists in the workspace.

→ **Rule:** Always use `--mask` to exclude sensitive paths when adding collections. Never index the `credentials/` subfolder.

---

## Recommended Next Steps

| Priority | Action |
|----------|--------|
| Now | Run `qmd collection add` + `qmd embed` on memory/ and agents/ |
| Soon | Add `qmd update` to memory sweep cron (keeps index fresh) |
| When agents scale | Enable `qmd mcp --http --daemon` for agent-native memory access |
| Ongoing | Exclude credentials/ from all collections |

---

*QMD credit: built by Tobias Lütke (@tobi), Shopify CEO — discovered via YouTube ("3 Tools That Make OpenClaw Actually Useful").*
