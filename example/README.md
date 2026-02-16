# Example — test project

This folder is a **sample project** for testing the **prompt-guide CLI**.  
It includes `prompt.config.js`, `prompts/`, and `docs/` so you can run `install` and `doctor` right away.

## How to test

### 1. From this repo (at root)

```bash
# Run CLI from example folder
npm run example:install   # prompt-guide install in example/
npm run example:doctor     # prompt-guide doctor in example/
```

Or directly:

```bash
cd example
node ../cli/bin/cli.js install
node ../cli/bin/cli.js doctor
```

### 2. With globally installed CLI

```bash
cd example
prompt-guide install
prompt-guide doctor
```

### 3. Testing init (overwrites)

You can use this `example` folder as the init target. **Existing contents will be overwritten.**

```bash
cd example
prompt-guide init -y
prompt-guide install
```

## What’s included

| Path | Description |
|------|-------------|
| `prompt.config.js` | Sample config (tool: cursor, platform: web) |
| `prompts/` | system.core, review, rules.by-platform, guide.template |
| `docs/` | Rule summaries in Markdown |

**Note:** `prompt-guide install` only uses **`tool`** and **`prompts.default`** / **`prompts.review`**. `taskPresets`, `platforms`, `rules`, `model`, and `context` live only in the config file; the CLI does not embed them in generated files. (They are defined so other tools can read `prompt.config.js`.)

When you run `prompt-guide install`, the **CLI reads `prompt.config.js` and `prompts/*.yml`** and **generates** the following based on **`tool`**:

- **cursor** → `.cursor/rules/use-prompt-guide.mdc`
- **codex** → `AGENTS.md`
- **windsurf** → `.windsurfrules`
- **claude** → `.claude/rules/prompt-guide-*.md`

→ To change behavior, **edit `prompt.config.js` or `prompts/`**, then run **`prompt-guide install`** again. Do not edit generated files by hand; they are overwritten on each install.

Generated files are ignored by `example/.gitignore` (they only exist locally when you run the CLI).
