# prompt-guide-cli

Set up prompt-guide in **any directory** with one command — no project config required. Install globally on macOS (or any system with Node) and run `prompt-guide init` from anywhere.

Built with **Commander**, **Zod**, and **TypeScript**.

---

## Install globally (macOS / any Node host)

```bash
npm i -g prompt-guide-cli
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
npm run build -w prompt-guide-cli
cd cli && npm publish
```

- **prepublishOnly** copies repo root `ai/`, `docs/`, `prompts/` into `cli/` and runs `tsc`, so the tarball includes everything needed.
- **files** in package.json: only `bin`, `dist`, `ai`, `docs`, `prompts` are published (no `src/`, `scripts/`, etc.).

---

## Commands

### `init` — Set up prompt-guide in the current directory

- Copies `ai/`, `prompts/`, `docs/` into the current directory.
- Sets **platform** in `ai/ai.config.yml` (ios | android | flutter | web | server).
- Appends platform-specific `.gitignore` entries.

**Interactive:** `prompt-guide init`  
**Non-interactive:** `prompt-guide init --platform=ios` (or `-p ios`)

Then edit `ai/ai.config.yml` to adjust `context.include` for your repo.

---

## What gets created

| Path | Description |
|------|-------------|
| `ai/ai.config.yml` | Base config with `platform` set. |
| `prompts/*.yml` | system.core, review, rules.by-platform, guide.template. |
| `docs/*.md` | Human-readable rule summaries. |
| `.gitignore` | Appended block (platform-specific + common). |

---

## License

MIT.
