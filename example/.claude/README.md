# Layered context (prompt-guide)

`prompt-guide init` copies this **same tree** into **`.cursor/`**, **`.claude/`**, **`codex/`**, **`.windsurf/`** — **`core/`**, **`context/`**, … at each root (no `…/ai/`). Default **`layers.source`** is **`.claude`**.

**Bundles:** `prompt-guide install` reads only **`layers.source`** when building tool outputs.

This layout separates **rules**, **product truth**, **project memory**, **work modes**, **role overlays**, and **session runtime**. Do not mix layers; apply lower layers before higher ones.

**Stack-agnostic:** Nothing here assumes a specific OS, language, framework, or deployment target unless you write that into `context/` or `memory/`.

## Agent access

- **Cursor:** Rules under `.cursor/rules/` (from `prompt-guide install`) + `read-ai-context-manifest.mdc` list every `.md` under `layers.source` — open those paths with file tools.
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
