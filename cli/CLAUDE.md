# Project instructions (Claude Code)

This repository uses **[prompt-guide](https://github.com/pelagornis/prompt-guide)**: layered Markdown, a single `prompt.config.js`, and **`layers.manifest.yml`** (merge order for bundles).

## What to read first

1. **`prompt.config.js`** — `tool`, `platform`, **`layers.source`**, **`layers.manifest`**, context, task presets.
2. **`layers.manifest.yml`** (repo root) — ordered **`system:`** paths relative to `layers.source`; **`review.path`** for review mode.
3. **Layer tree** under **`layers.source`** (default `.claude/`) — **`init`** copies the same layout to **`.cursor/`**, **`.claude/`**, **`codex/`**, **`.windsurf/`** (no `…/ai/` subfolder).

Prefer **opening those Markdown files** over assuming a single monolithic instruction block.

## After `prompt-guide install` with `tool: 'claude'`

- `.claude/rules/ai-core.md` — system bundle from the manifest.
- `.claude/rules/ai-review.md` — review bundle.

Keep **this file short** (Anthropic recommends concise project instructions); put detail in **`.claude/`** (Markdown tree) and `prompts/`.

## Conventions this template follows

- **Cursor / IDE agents:** version-controlled rules under `.cursor/rules/`, small composable `.mdc` / `.md` files with YAML frontmatter where applicable ([Cursor docs — Rules](https://cursor.com/docs/rules)).
- **Codex / similar:** `AGENTS.md` at the project root when using `tool: 'codex'` ([common pattern](https://developers.openai.com/codex) for repo-level agent instructions).
- **Claude Code:** root **`CLAUDE.md`** plus optional `.claude/rules/*.md` ([Claude Code best practices](https://docs.anthropic.com/en/docs/claude-code/best-practices)).

Regenerate tool outputs when you change **`tool`** in `prompt-guide install`; edit **`.claude/`** Markdown and **`layers.manifest.yml`** without reinstalling for file-based tools (Cursor).
