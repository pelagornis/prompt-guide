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

- **prepublishOnly** copies repo root `docs/`, `prompts/`, `.cursor/` into `cli/` and runs `tsc`, so the tarball includes everything needed.
- **files** in package.json: only `bin`, `dist`, `docs`, `prompts` are published (no `src/`, `scripts/`, etc.).

---

## Commands

### `init` — Create config and copy prompts/docs

- Creates `prompt.config.js` and copies `prompts/`, `docs/` into the current directory.
- Sets **platform** and **tool** in `prompt.config.js`.
- Appends platform-specific `.gitignore` entries.

**Interactive:** `prompt-guide init`  
**Non-interactive:** `prompt-guide init --platform=ios --tool=cursor` (or `-p ios -t codex`)

### `install` — Generate tool-specific rules

- Reads `prompt.config.js` and writes rule files for your `tool` (Cursor → `.cursor/rules/`, Codex → `AGENTS.md`, Windsurf → `.windsurfrules`, Claude Code → `.claude/rules/`).

Then edit `prompt.config.js` to adjust `context.include` for your repo; run `prompt-guide install` again after changes.

---

## What gets created

| Path | Description |
|------|-------------|
| `prompt.config.js` | Single config (tool, platform, model, context, taskPresets). |
| `prompts/*.yml` | system.core, review, rules.by-platform, guide.template. |
| `docs/*.md` | Human-readable rule summaries. |
| (after `install`) | `.cursor/rules/`, `AGENTS.md`, `.windsurfrules`, or `.claude/rules/` depending on `tool`. |
| `.gitignore` | Appended block (platform-specific + common). |

---

## License

MIT.
