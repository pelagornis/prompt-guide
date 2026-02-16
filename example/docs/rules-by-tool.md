# Rules by tool — Where each AI environment reads rules

Prompt Guide keeps a **single source of truth** in `prompt.config.js` and `prompts/*.yml`.  
Each AI tool (Cursor, Claude Code, Codex, Windsurf, etc.) has **its own** way to load project rules. This doc summarizes where and how so you can align prompt-guide with the tool you chose. **`prompt-guide install`** reads `prompt.config.js` and generates the right files for your chosen `tool`.

---

## Summary table

| Tool | Rule location(s) | Format | Limits / notes |
|------|------------------|--------|----------------|
| **Cursor** | `.cursor/rules/` (preferred), `.cursorrules`, `AGENTS.md` | `.mdc` / `.md` (YAML frontmatter: `alwaysApply`, `globs`, `description`) | ~500 lines per rule recommended |
| **Claude Code** | `.claude/rules/`, `CLAUDE.md` or `.claude/CLAUDE.md` | `.md`; optional frontmatter `paths: "glob"` for path-specific | All `.md` in `.claude/rules/` loaded; paths scope rules |
| **Codex** | `AGENTS.md` (repo root and nested dirs), `~/.codex/AGENTS.md` | Markdown | ~32 KiB combined; hierarchy: root → subdirs; later overrides earlier |
| **Windsurf** | `.windsurfrules` (project root), `.windsurf/context.md` | Single file (key=value / markdown) | `.windsurfrules` ~6,000 characters |
| **Other / API** | Depends on product (e.g. system prompt, config file) | — | Use `prompt.config.js` + `prompts/*.yml` as reference and copy into the tool’s format |

---

## Cursor

- **Where**: `.cursor/rules/` (directory of `.md` or `.mdc`). Legacy: single file `.cursorrules`. Alternative: root `AGENTS.md`.
- **Format**: Markdown; `.mdc` can have YAML frontmatter:
  - `alwaysApply: true` — included every session
  - `globs: "**/*.ts"` — applied when matching files are open
  - `description: "..."` — for rule picker / agent relevance
- **Behavior**: Cursor does **not** auto-read `prompt.config.js` or `prompts/`. Prompt Guide’s CLI installs `.cursor/rules/use-prompt-guide.mdc` so the agent reads and applies `prompt.config.js` and `prompts/` when relevant.
- **Prompt-guide fit**: Keep rules in `prompts/*.yml`; Cursor rule instructs the AI to use those files. Optional: duplicate critical rules into `.cursor/rules/*.mdc` for always-on or file-scoped application.

---

## Claude Code (Claude IDE)

- **Where**: `.claude/rules/` (all `.md` files, including subdirs). Main project instructions: `CLAUDE.md` or `.claude/CLAUDE.md`.
- **Format**: Markdown. Optional YAML frontmatter with `paths: "src/**/*.ts"` so the rule applies only when editing matching paths.
- **Behavior**: Automatically discovers and loads all `.md` in `.claude/rules/` (same priority as main CLAUDE.md). Path-specific rules save context by loading only when relevant.
- **Prompt-guide fit**: **`prompt-guide install`** (when `tool: 'claude'`) writes `.claude/rules/prompt-guide-core.md` and `prompt-guide-review.md` with the prompt content from `prompts/system.core.yml` and `prompts/review.yml`. You can also reference `prompt.config.js` in a rule if you want Claude Code to read the config directly.

---

## Codex (OpenAI)

- **Where**: `AGENTS.md` at repo root and in nested directories. Global: `~/.codex/AGENTS.md` (and optional `AGENTS.override.md`).
- **Format**: Markdown. Merged in order (root → current path); later files override earlier. Combined size cap ~32 KiB.
- **Behavior**: Builds an instruction chain at startup; project conventions in repo `AGENTS.md`, module-specific rules in e.g. `services/payments/AGENTS.md`.
- **Prompt-guide fit**: **`prompt-guide install`** (when `tool: 'codex'`) writes `AGENTS.md` at the repo root with a concise summary of `prompts/system.core.yml` and `prompts/review.yml` (under ~32 KiB). It also references `prompt.config.js` and `prompts/` for full details.

---

## Windsurf (Codeium)

- **Where**: `.windsurfrules` in project root. Optional: `.windsurf/context.md` for project context.
- **Format**: Single file; often key=value style or short markdown. Character limit ~6,000 for `.windsurfrules`.
- **Behavior**: Project-specific rules in `.windsurfrules`; global rules in `global_rules.md` (workspace-independent).
- **Prompt-guide fit**: **`prompt-guide install`** (when `tool: 'windsurf'`) writes `.windsurfrules` with a condensed version of `prompts/system.core.yml` (under 6k chars). Review rules are omitted to stay within the limit; see `prompts/review.yml` separately if needed.

---

## Other / Claude API or custom

- **Where**: Depends on the product (e.g. system prompt parameter, dashboard config, or a config file).
- **Prompt-guide fit**: Use `prompt.config.js` and `prompts/*.yml` as the canonical definition; copy or adapt the `prompt` content into whatever format your tool expects (system message, config field, etc.).

---

## Recommendation

- **Single source of truth**: Keep full rules and task presets in `prompt.config.js` and `prompts/*.yml`.
- **Per-tool**: Use the table and sections above to add or generate the right file(s) for your chosen tool (Cursor / Claude Code / Codex / Windsurf) so that tool’s AI actually loads those rules.
- **Applying to your tool**: Run **`prompt-guide install`** after init (or after changing `tool` in `prompt.config.js`). The CLI generates the appropriate file(s) for Cursor, Claude Code, Codex, and Windsurf. For `tool: 'other'`, no tool-specific files are written; use `prompt.config.js` and `prompts/*.yml` as reference.
