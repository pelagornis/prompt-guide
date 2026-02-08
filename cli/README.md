# prompt-guide-cli

Install prompt-guide in **any project** with one command: choose platform, get `ai/`, `prompts/`, `docs/`, and `.gitignore` set up.

Built with **Commander**, **Zod**, and **TypeScript** for a clean, typed CLI and pretty output.

## Install (per project or global)

```bash
# Run once in your project (no install)
npx prompt-guide-cli init

# Or install globally
npm i -g prompt-guide-cli
prompt-guide init
```

## Development

```bash
cd cli
npm install
npm run build        # compile TypeScript → dist/
npm run dev          # run with tsx (no build): npm run dev init --platform=ios
npm start            # run compiled: node dist/cli.js
```

## Commands

### `init` — Set up prompt-guide in the current directory

- Copies `ai/`, `prompts/`, `docs/` from the CLI templates.
- Sets **platform** in `ai/ai.config.yml` (validated with Zod: ios | android | flutter | web | server).
- Appends recommended entries to `.gitignore` (env, local config, OS, cache, etc.).

**Interactive (asks for platform):**

```bash
npx prompt-guide-cli init
```

**Non-interactive (pass platform):**

```bash
npx prompt-guide-cli init --platform=ios
npx prompt-guide-cli init -p flutter
```

Invalid `--platform` values are rejected with a clear Zod error.

Then edit `ai/ai.config.yml` to adjust `context.include` (and optionally `context.exclude`) for your repo.

## What gets created

| Path | Description |
|------|-------------|
| `ai/ai.config.yml` | Base config with `platform` set; model, context, task presets, rules. |
| `prompts/*.yml` | system.core, review, rules.by-platform, guide.template. |
| `docs/*.md` | Human-readable rule summaries. |
| `.gitignore` | Appended block (env, local config, OS, logs, node_modules). |

## License

MIT.
