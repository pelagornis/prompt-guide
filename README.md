# prompt-guide

Unified configuration for **Claude Code**, **Codex CLI**, and **Cursor** from a single `prompt-guide.yml`.

Install globally, initialize a project, then sync tool-specific files (rules, skills, subagents, hooks).

```bash
npm install -g @pelagornis/prompt-guide
prompt-guide init
prompt-guide sync
```

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [CLI commands](#cli-commands)
- [Configuration](#configuration)
- [Generated files](#generated-files)
- [Monorepo development](#monorepo-development)
- [License](#license)

---

## Overview

**prompt-guide** is a CLI that reads one source file — `prompt-guide.yml` — and generates:

| Tool | Outputs |
|------|---------|
| **Claude Code** | `CLAUDE.md`, `.claude/settings.json`, `.claude/rules/`, `.claude/agents/`, `.claude/skills/` |
| **Codex** | `AGENTS.md`, `.codex/instructions/`, `.codex/config.toml` |
| **Cursor** | `.cursor/rules/*.mdc`, `.cursor/skills/` |
| **Cross-tool** | `.agents/skills/` (Agent Skills standard), optional `~/.agents/skills/` and `~/.cursor/skills/` on sync |

Edit `prompt-guide.yml`, run `prompt-guide sync`, and all enabled tools stay in sync.

---

## Quick Start

```bash
npm install -g @pelagornis/prompt-guide

cd your-project
prompt-guide init          # interactive — creates prompt-guide.yml
prompt-guide sync          # writes Claude / Codex / Cursor config files
prompt-guide doctor        # verify setup
```

One-off without global install:

```bash
npx @pelagornis/prompt-guide init
npx @pelagornis/prompt-guide sync
```

Project types: `ios-swift`, `web-react`, `web-vue`, `python`, `node`, `custom`.

---

## CLI commands

| Command | Description |
|---------|-------------|
| `init` | Create `prompt-guide.yml` (interactive) |
| `sync` | Generate or update all tool config files |
| `diff` | Preview changes without writing |
| `validate` | Validate `prompt-guide.yml` |
| `doctor` | Diagnose config and missing generated files |
| `status` | Summary of generated file states |
| `add skill` | Add a skill entry to the config |
| `add rule` | Add a path rule |
| `add agent` | Add a Claude subagent |

### `init` options

| Option | Description |
|--------|-------------|
| `--git <source>` | Remote template: `owner/repo/path@ref` or a `github.com/.../blob/...` URL. Falls back to bundled templates. |

### `sync` options

| Option | Description |
|--------|-------------|
| `--dry-run` | List files without writing |
| `--tool <name>` | `claude`, `codex`, or `cursor` only |

---

## Configuration

Single file at the project root:

```yaml
version: "1"

project:
  name: my-app
  type: ios-swift
  description: Short project summary

tools:
  claude_code: true
  codex: false
  cursor: true

context:
  tech_stack: [SwiftUI, AlarmKit]
  summary: |
    Core context for all tools (keep concise).
  path_rules: []    # → .claude/rules/, .cursor/rules/, .codex/instructions/
  skills: []        # → Agent Skills (SKILL.md)
  agents: []        # → Claude Code subagents only
  hooks: {}
  forbidden: []
  cursor:
    always_apply_rules: [core]
```

See `templates/<type>/prompt-guide.yml` for full examples.

---

## Generated files

After `sync`, typical layout:

```
your-project/
├── prompt-guide.yml          # source of truth (commit this)
├── CLAUDE.md
├── AGENTS.md
├── .claude/
├── .codex/
├── .cursor/
└── .agents/skills/           # cross-tool Agent Skills
```

Gitignore generated output if you prefer — or commit team-shared rules. See `example/.gitignore` for a sandbox pattern.

---

## Monorepo development

```bash
pnpm install
pnpm build
pnpm pg sync                  # node packages/cli/dist/index.js
pnpm example:sync             # test in example/
pnpm test
```

| Script | Description |
|--------|-------------|
| `pnpm pg` | Run CLI from `packages/cli/dist` |
| `pnpm example:*` | Run sync, doctor, validate, etc. in `example/` |

Architecture and contributor notes: [DEVELOP.md](DEVELOP.md), [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT. See [LICENSE](LICENSE).
