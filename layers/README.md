# Layered context (prompt-guide)

This layout matches widely used patterns: **Cursor** project rules under `.cursor/rules/` (often `.mdc` with YAML frontmatter), **Claude Code** with root **`CLAUDE.md`** plus `.claude/rules/`, **Codex / OpenAI Codex CLI** with root **`AGENTS.md`**. prompt-guide keeps **one** layered tree and a **`layers.manifest.yml`** merge list so you do not maintain four different mental models—only paths differ per tool.

---

`prompt-guide init` copies this **same tree** into each tool root below — **`core/`**, **`context/`**, … sit **directly** under that folder (no `…/ai/` segment):

| Path | Tool |
|------|------|
| `.cursor/` | Cursor (alongside `.cursor/rules/`) |
| `.claude/` | Claude Code (default **`layers.source`**) |
| `codex/` | Codex CLI / `AGENTS.md` workflow |
| `.windsurf/` | Windsurf |

**Bundles:** `prompt.config.js` → `layers.source` (default `.claude`). `prompt-guide install` reads **only that path** when building Codex / Claude / Windsurf outputs and when generating the Cursor manifest. Use **`--layer-target`** for extra destinations.

This layout separates **rules**, **product truth**, **project memory**, **work modes**, **role overlays**, and **session runtime**. Do not mix layers; apply lower layers before higher ones.

**Stack-agnostic:** Nothing here assumes a specific OS, language, framework, or deployment target unless you write that into `context/` or `memory/`.

### Markdown vs YAML layer files

- **`.md`**: Plain text for humans and Cursor; headings/bold add **tokens** in bundles.
- **`.yml` / `.yaml`**: Put the instruction body under **`prompt:`** or **`text:`** (same meaning as `prompts/*.yml`). Often **fewer decorative tokens** than Markdown for the same rules. List paths in **`layers.manifest.yml`** (e.g. `core/rules.yml` instead of `core/rules.md`).

## Agent access

- **Cursor:** Rules under `.cursor/rules/` (from `prompt-guide install`) + `read-ai-context-manifest.mdc` lists every layer file (`.md` / `.yml` / `.yaml`) under `layers.source` — open those paths with file tools.
- **Do not** add your canonical `layers.source` tree to ignore lists that block AI file access (e.g. `.cursorignore`). Allowlist it if you use broad ignores.
- **Codex / Claude / Windsurf:** `prompt-guide install` **embeds** text built from `layers.source` into bundled rule files.

## Load order (default)

1. **`core/`** — Always. Hard rules, constraints, style.
2. **`context/`** — Product, architecture, domain.
3. **`memory/`** — Decisions (ADRs), patterns, known bugs.
4. **`actions/`** — Pick by task: `coding.md`, `debugging.md`, `reviewing.md`.
5. **`agents/`** — Specialist overlays when the task matches.
6. **`runtime/`** — Session-local: `task.md`, `plan.md` when in use.

## Role separation

| Layer | Role |
|-------|------|
| `core` | What is **never** violated (unless the user says so). |
| `context` | **What** the product/system is. |
| `memory` | **What we already decided** and **what we know** about the codebase. |
| `actions` | **How to behave** for a class of work. |
| `agents` | **Specialist lens** for an area of the system. |
| `runtime` | **Now**: current goal and steps (ephemeral). |

Fill `context/` and `memory/` with project-specific truth. Keep `runtime/` short and update per task.

---

## `layers.manifest.yml` (project root)

After `init`, this file lives next to `prompt.config.js`. It controls:

- **`system:`** — ordered list of Markdown paths **relative to `layers.source`**. Concatenated in this order for Codex / Claude / Windsurf bundles. **Add new files here** when you start a new workflow (e.g. `actions/experiment.md` or `research/notes.md`).
- **`review.path`** — file used as the review prompt layer (default `actions/reviewing.md`).
- **`cursor.list`** — `all` (default): Cursor manifest lists every `.md` under `layers.source`. `system`: only files listed in `system:` + `review.path` (stricter).

Change `layers.manifest` in `prompt.config.js` if you move the file elsewhere. Re-run **`prompt-guide install`** only when you change `tool` or paths the generated rules embed; editing layer content or this manifest does not require reinstall for Cursor file-based rules.
