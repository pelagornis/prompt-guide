# prompt-guide — developer guide

CLI to manage Claude Code, Codex CLI, and Cursor from a single `prompt-guide.yml`.

```bash
prompt-guide init          # initialize project (interactive)
prompt-guide sync          # generate or update all tool config files
prompt-guide diff          # preview changes
prompt-guide validate      # validate prompt-guide.yml
prompt-guide add skill     # add a skill
prompt-guide add rule      # add a path rule
prompt-guide add agent     # add a Claude subagent
prompt-guide status        # show generated file status
prompt-guide doctor        # diagnose setup
```

---

## Tech stack

| Area | Choice | Notes |
|------|--------|-------|
| Language | TypeScript 5.x strict | Type-safe adapters and CLI |
| Monorepo | pnpm workspaces + Turborepo | Cached builds |
| Schema | Zod | Runtime validation + inferred types |
| Errors | neverthrow | Result pattern in core/adapters |
| Config discovery | cosmiconfig | Finds `prompt-guide.yml` |
| CLI parsing | citty (UnJS) | Declarative commands |
| CLI prompts | @clack/prompts | Interactive init |
| Lint / format | Biome | Single toolchain |
| Tests | Vitest | Unit tests |
| Publish | tsup bundle | Single `@pelagornis/prompt-guide` npm package |

---

## Monorepo layout

```
prompt-guide/
├── packages/
│   ├── schema/                 @pelagornis/prompt-guide-schema (private)
│   ├── core/                   @pelagornis/prompt-guide-core (private)
│   ├── adapters/               @pelagornis/prompt-guide-adapters (private)
│   ├── adapters/claude/        @pelagornis/prompt-guide-adapter-claude
│   ├── adapters/codex/         @pelagornis/prompt-guide-adapter-codex
│   ├── adapters/cursor/        @pelagornis/prompt-guide-adapter-cursor
│   └── cli/                    @pelagornis/prompt-guide (published)
├── templates/                  project-type prompt-guide.yml templates
├── example/                    local CLI sandbox
└── prompt-guide.yml            (in consumer projects, not this repo)
```

Only `@pelagornis/prompt-guide` is published to npm. Workspace packages are bundled into the CLI via `tsup`.

---

## Source config (`prompt-guide.yml`)

```yaml
version: "1"

project:
  name: my-app
  type: ios-swift
  description: AlarmKit-based alarm app

tools:
  claude_code: true
  codex: false
  cursor: true

context:
  tech_stack: [SwiftUI, AlarmKit]
  summary: |
    AlarmKit iOS app. SwiftUI + MVVM.
    No force unwraps. async/await preferred. Previews required.

  path_rules:
    - name: swift-ui
      path: ["**/*.swift"]
      description: SwiftUI and Swift file rules
      content: |
        - Prefer @Observable over ObservableObject
        - Include Preview on every View

  skills:
    - name: generate-view
      description: Create SwiftUI view + ViewModel. Use when editing Swift UI.
      allowed_tools: [Read, Write]
      auto_invoke: true
      paths: ["**/*.swift"]
      prompt: |
        Create a SwiftUI view using MVVM...

  agents:
    - name: reviewer
      description: Expert code reviewer. Use after code changes.
      tools: [Read, Grep, Glob, "Bash(git:*)"]
      disallowed_tools: [Write, Edit]
      model: sonnet
      permission_mode: dontAsk
      prompt: |
        Review changed code...

  hooks:
    post_write: []
    pre_bash: []

  forbidden:
    - "Force unwrap (!)"

  cursor:
    always_apply_rules: [core]
```

---

## Package roles

### `packages/schema`

Zod schemas: `PromptGuideConfig`, skills, agents, path rules, hooks, MCP servers.

### `packages/core`

- `resolver.ts` — load `prompt-guide.yml` via cosmiconfig
- `merger.ts` — merge layers if extended later
- `validator.ts` — Zod validation with readable errors

### `packages/adapters`

Shared `Adapter` interface and `renderSkillMd` / `generateSharedSkillFiles` (Agent Skills open standard).

### Tool adapters

| Adapter | Generators |
|---------|------------|
| **claude** | `CLAUDE.md`, settings, rules, agents, skills, hooks, MCP |
| **codex** | `AGENTS.md`, `.codex/instructions/*.md`, `.codex/config.toml` |
| **cursor** | `.cursor/rules/*.mdc`, `.cursor/skills/*/SKILL.md` |

`sync` also writes `.agents/skills/` and user-level `~/.agents/skills/`, `~/.cursor/skills/`.

---

## Generated files (current)

```
# Claude Code
CLAUDE.md
.claude/settings.json
.claude/rules/*.md
.claude/agents/*.md
.claude/skills/*/SKILL.md
.claude/hooks/block-dangerous.sh

# Codex
AGENTS.md
.codex/instructions/*.md
.codex/config.toml

# Cursor
.cursor/rules/core.mdc
.cursor/rules/<rule>.mdc
.cursor/skills/*/SKILL.md

# Cross-tool
.agents/skills/*/SKILL.md

# Not generated
.cursorrules                 # deprecated
```

---

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm pg --help
pnpm example:sync
```

### Release

Push a version tag (no `v` prefix):

```bash
git tag 1.0.5
git push origin 1.0.5
```

GitHub Actions publishes `@pelagornis/prompt-guide` via OIDC trusted publishing. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Implementation status

- [x] Monorepo + Zod schema + core resolver
- [x] Claude / Codex / Cursor adapters
- [x] Agent Skills cross-tool sync
- [x] Subagent frontmatter (2026 Claude Code fields)
- [x] `doctor`, `diff`, `status`, `validate`
- [x] `init --git` remote templates
- [x] Single-package npm publish (`@pelagornis/prompt-guide`)
- [ ] JSON Schema export for IDE autocomplete
- [ ] Changesets automated versioning
- [ ] memfs snapshot tests for generators
