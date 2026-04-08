# @pelagornis/prompt-guide

Set up prompt-guide in **any directory** with one command — no project config required. Install globally on macOS (or any system with Node) and run `prompt-guide init` from anywhere.

Built with **Commander**, **Zod**, and **TypeScript**.

---

## Install globally (macOS / any Node host)

```bash
npm i -g @pelagornis/prompt-guide
```

Then from **any directory** (your app, monorepo, new folder):

```bash
prompt-guide init
# or with platform
prompt-guide init --platform=ios
prompt-guide init -p flutter
```

No need to add the package to your project’s `package.json` or use `npx` in each repo.

---

## Publish to npm (maintainer)

From the **prompt-guide** repo root:

```bash
cd cli
npm install
npm run build          # optional: prepublishOnly will run this
npm publish            # runs copy-templates + build, then publishes
```

Or from repo root with workspaces:

```bash
npm run build -w @pelagornis/prompt-guide
cd cli && npm publish
```

- **prepublishOnly** copies repo root `docs/`, `prompts/`, `layers/`, `.cursor/` into `cli/` and runs `tsc`, so the tarball includes everything needed.
- **files** in package.json: `bin`, `dist`, `docs`, `prompts`, `layers` are published (no `src/`, `scripts/`, etc.).

---

## Commands

**Full option list** (every `init` / `install` / `doctor` flag, global `-v` / `--verbose`, and root `npm run` scripts): see the repository root **`README.md`** → section **CLI commands · CLI 명령어**.

### `init` — Create config and copy prompts/docs/layers

- Creates `prompt.config.js` (including **`layers.source`** and **`layers.manifest`**), **`layers.manifest.yml`** at the project root, **`CLAUDE.md`**, and copies `prompts/`, `docs/`, and the layered template into **`.cursor/`**, **`.claude/`**, **`codex/`**, **`.windsurf/`** (no `…/ai/`; optional **`--layer-target`** for extra copies; **`--skip-layers`** skips only the tree copies).
- Sets **platform** and **tool** (interactive or `-p` / `-t` / `-y`).
- Appends platform-specific `.gitignore` entries.

**Interactive:** `prompt-guide init`  
**Non-interactive:** `prompt-guide init --platform=ios --tool=cursor` (or `-p ios -t codex`)

### `install` — Generate tool-specific rules

- Reads `prompt.config.js` and writes rule files for your `tool` (Cursor → `.cursor/rules/`, Codex → `AGENTS.md`, Windsurf → `.windsurfrules`, Claude Code → `.claude/rules/`).

Then edit `prompt.config.js` and **`layers.manifest.yml`** as needed; run `prompt-guide install` again when you change **`tool`** (or to refresh bundled outputs).

### `doctor` — Health check

- `prompt-guide doctor` checks config, prompts, docs, layered manifest, `CLAUDE.md`, `.gitignore`. **`--fix`** appends the gitignore block; **`--json`** for scripting.

---

## What gets created

| Path | Description |
|------|-------------|
| `prompt.config.js` | Single config (tool, platform, `layers.source`, model, context, taskPresets). |
| `prompts/*.yml` | system.core, review, rules.by-platform, guide.template. |
| `docs/*.md` | Human-readable rule summaries. |
| Layered dirs | Same `core/`…`runtime/` tree under Cursor / Claude / `codex/` / `.windsurf/` (see `layers/README.md`). |
| `CLAUDE.md` | Short root instructions for Claude Code (industry-standard location); points into `layers/` and config. |
| (after `install`) | `.cursor/rules/`, `AGENTS.md`, `.windsurfrules`, or `.claude/rules/` depending on `tool`. |
| `.gitignore` | Appended block (platform-specific + common). |

---

## License

MIT.
