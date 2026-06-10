# Example — local prompt-guide sandbox

Run CLI commands from the repo root (after `pnpm build`):

```bash
pnpm example:sync      # generate tool config files here
pnpm example:doctor    # check setup and missing files
pnpm example:validate  # validate prompt-guide.yml
pnpm example:diff      # preview changes
pnpm example:status    # summary of file states
```

Or from this directory:

```bash
node ../packages/cli/dist/index.js sync
node ../packages/cli/dist/index.js doctor
```

## What gets generated (2026)

| Path | Tool | Role |
|------|------|------|
| `CLAUDE.md`, `.claude/agents/` | Claude Code | Project context + **subagents** |
| `.claude/skills/` | Claude Code | Agent Skills |
| `AGENTS.md`, `.codex/instructions/` | Codex | Layered instructions + path rules |
| `.cursor/rules/*.mdc` | Cursor | Always-on / glob-scoped rules |
| `.cursor/skills/` | Cursor | Agent Skills (auto or `/skill-name`) |
| `.agents/skills/` | All | Cross-tool Agent Skills standard |
| `~/.agents/skills/`, `~/.cursor/skills/` | User | Global skills (on sync) |

Generated files are gitignored. Only `prompt-guide.yml` and sample source under `src/` are tracked.

## Edit and re-sync

1. Change `prompt-guide.yml`
2. Run `pnpm example:sync`
3. Run `pnpm example:doctor` to verify
