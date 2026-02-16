# CLI usage guide

The Prompt Guide CLI creates `prompt.config.js` and copies `prompts/`, `docs/` in your project; run `prompt-guide install` to generate tool-specific rules. It also provides a `doctor` command to check that setup.

---

## Table of contents

- [How to run](#how-to-run)
- [Global options](#global-options)
- [init — Initialize project](#init--initialize-project)
- [doctor — Check and fix setup](#doctor--check-and-fix-setup)
- [Errors and exit codes](#errors-and-exit-codes)

---

## How to run

### 1. Global install (recommended)

Install once and run from any directory:

```bash
npm install -g @pelagornis/prompt-guide
prompt-guide              # Help and banner
prompt-guide init         # Interactive init
prompt-guide init -p web  # Init with web platform
prompt-guide doctor       # Check setup
```

You do not need to add the package to your project’s `package.json`.

### 2. npx (one-off)

Run the latest version without a global install:

```bash
npx @pelagornis/prompt-guide init
npx @pelagornis/prompt-guide init --platform=ios
npx @pelagornis/prompt-guide doctor --fix
```

### 3. From this repo (development)

From the **repository root**:

```bash
npm install    # Install workspace deps
npm run build  # Build CLI (cli/)
npm run cli    # Print help (node cli/bin/cli.js)
npm run init   # Run init interactively
npm run cli -- init -p web         # Init with a specific platform
npm run cli -- init --dry-run      # Show what would be done
npm run cli -- doctor              # Check
npm run cli -- doctor --fix        # Fix .gitignore
npm run cli -- doctor -v           # Verbose
```

Arguments after `--` are passed through to the CLI.

---

## Global options

Available for every command.

| Option | Description |
|--------|-------------|
| `-v`, `--verbose` | Extra output. For init: template path; for doctor: always show hints for failed items. |
| `-V`, `--version` | Print CLI version. |
| `-h`, `--help` | Print help for the command. |

Example:

```bash
prompt-guide init -p flutter -v
prompt-guide doctor -v
prompt-guide --help
prompt-guide init --help
```

---

## init — Initialize project

Installs Prompt Guide in the current directory.

### Usage

```bash
prompt-guide init [options]
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--platform <platform>` | `-p` | Platform. If omitted, chosen interactively (arrow keys) when stdin is a TTY. |
| `--tool <tool>` | `-t` | AI tool (cursor, claude, codex, windsurf, other). If omitted, chosen interactively (arrow keys) when stdin is a TTY. |
| `--dry-run` | — | Do not write files; only print what would be done. |
| `-y`, `--yes` | — | Non-interactive: use default platform (web) and tool (cursor) when omitted. Also used when stdin is not a TTY (e.g. scripts, CI). |

### Supported platforms

`ios` | `android` | `flutter` | `web` | `server`

- **ios**: iOS (Swift/SwiftUI). Adds `ios/**`, `*.xcodeproj/**`, etc. to context and Xcode-related patterns to `.gitignore`.
- **android**: Android (Kotlin/Java). Adds `android/**`, `app/**`, etc. and Gradle/build dirs to ignore.
- **flutter**: Flutter (Dart). Adds `lib/**`, `test/**`, `pubspec.yaml`, etc. and Dart/Flutter build and cache to ignore.
- **web**: Web (JS/TS, React/Vue, etc.). Adds `src/**`, `public/**`, `*.config.js`, etc. and `dist/`, `.next/`, `.vite/`, etc. to ignore.
- **server**: Server (Node/Go/Rust/Python, etc.). Adds `src/**`, `lib/**`, `cmd/**`, etc. and `venv/`, `node_modules/`, `target/`, etc. to ignore.

### What init does

1. **Choose platform and tool** — If `-p`/`--platform` or `-t`/`--tool` are not set and stdin is a TTY, prompts in the terminal. With `-y`, or when stdin is not a TTY (e.g. scripts, CI), uses defaults (platform: web, tool: cursor) and prints “(non-interactive, default)” or “(--yes)”.
2. **Create config** — Writes `prompt.config.js` with `platform` and `tool` set.
3. **Copy directories** — Copies `prompts/`, `docs/` from templates into the current directory.
4. **.gitignore** — Appends a prompt-guide block (common + platform-specific) to `.gitignore`, or creates it if missing.

If `prompt.config.js`, `prompts/`, or `docs/` already exist, init **overwrites** them and prints a warning. Then run **`prompt-guide install`** to generate tool-specific rule files.

### Examples

```bash
# Interactive: choose platform in terminal
prompt-guide init

# Specify platform
prompt-guide init --platform=ios
prompt-guide init -p web
prompt-guide init -p server

# Non-interactive (default platform: web, tool: cursor)
prompt-guide init -y
prompt-guide init --platform=ios --tool=codex

# Show planned actions only
prompt-guide init -p flutter --dry-run

# Verbose
prompt-guide init -p android -v
```

### Notes

- **Existing `prompt.config.js`, `prompts/`, `docs/`** — Init overwrites them. Back up or copy files manually if you have local changes.
- **Templates not found** — Reinstall the CLI or, when running from this repo, run `npm run copy-templates` and `npm run build` so `prompts/`, `docs/` exist under `cli/`.

---

## doctor — Check and fix setup

Checks that the Prompt Guide layout and config are valid.  
The `--fix` option **creates or appends** the prompt-guide block in `.gitignore` when it’s missing.

### Usage

```bash
prompt-guide doctor [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--fix` | Create or append the prompt-guide block in `.gitignore` when missing. Uses `platform` from `prompt.config.js` (default `web`). |
| `--json` | Output results as JSON (for scripting). |

### Checks

| Check | Pass condition | On failure |
|-------|-----------------|------------|
| **prompt.config.js** | File exists and loads | Run `prompt-guide init` |
| **prompts/** | `prompts/` exists | Run `prompt-guide init` |
| **docs/** | `docs/` exists | Run `prompt-guide init` |
| **.gitignore** | File exists and contains `# prompt-guide (added by prompt-guide-cli)` | Run `prompt-guide doctor --fix` or `prompt-guide init` |

### Examples

```bash
# Check only
prompt-guide doctor

# Fix .gitignore if needed
prompt-guide doctor --fix

# Verbose
prompt-guide doctor -v
prompt-guide doctor --fix -v

# JSON output
prompt-guide doctor --json
```

### doctor --fix behavior

- **No .gitignore** — Creates a new `.gitignore` with the prompt-guide block (common + platform from config).
- **.gitignore exists but no block** — Appends the block. If the block is already present, nothing is done.

Useful when you only need to fix `.gitignore` without re-running init.

---

## Errors and exit codes

| Situation | Exit code | Example message |
|-----------|-----------|-----------------|
| Success | 0 | — |
| init failure (templates missing, invalid platform, etc.) | 1 | `✗ Templates not found. ...` / `✗ Platform must be one of: ...` |
| doctor failed (one or more checks failed) | 1 | `✗` items printed, then “Fix the items above, or run doctor --fix ...” |
| doctor all passed | 0 | “All checks passed.” |

---

## Next steps

- **After init**: Edit `prompt.config.js` (e.g. `model.default`, `context.include`) and run `prompt-guide install`. See the main [README Configuration Reference](../README.md#configuration-reference) and [what-install.md](what-install.md).
- **Rule summaries**: See `docs/system.core.md`, `docs/review.md`, and `docs/rules-by-platform.md` for human-readable rule summaries.
