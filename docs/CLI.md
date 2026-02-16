# CLI usage guide

The Prompt Guide CLI installs `ai/`, `prompts/`, and `docs/` in your project and configures platform-specific `.gitignore`. It also provides a `doctor` command to check that setup.

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
npm install -g prompt-guide-cli
prompt-guide              # Help and banner
prompt-guide init         # Interactive init
prompt-guide init -p web  # Init with web platform
prompt-guide doctor       # Check setup
```

You do not need to add the package to your project’s `package.json`.

### 2. npx (one-off)

Run the latest version without a global install:

```bash
npx prompt-guide-cli init
npx prompt-guide-cli init --platform=ios
npx prompt-guide-cli doctor --fix
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
| `--platform <platform>` | `-p` | Platform. If omitted, chosen interactively (1–5 or name). |
| `--dry-run` | — | Do not write files; only print what would be done. |
| `-y`, `--yes` | — | Non-interactive: use default platform (web) when `--platform` is omitted. |

### Supported platforms

`ios` | `android` | `flutter` | `web` | `server`

- **ios**: iOS (Swift/SwiftUI). Adds `ios/**`, `*.xcodeproj/**`, etc. to context and Xcode-related patterns to `.gitignore`.
- **android**: Android (Kotlin/Java). Adds `android/**`, `app/**`, etc. and Gradle/build dirs to ignore.
- **flutter**: Flutter (Dart). Adds `lib/**`, `test/**`, `pubspec.yaml`, etc. and Dart/Flutter build and cache to ignore.
- **web**: Web (JS/TS, React/Vue, etc.). Adds `src/**`, `public/**`, `*.config.js`, etc. and `dist/`, `.next/`, `.vite/`, etc. to ignore.
- **server**: Server (Node/Go/Rust/Python, etc.). Adds `src/**`, `lib/**`, `cmd/**`, etc. and `venv/`, `node_modules/`, `target/`, etc. to ignore.

### What init does

1. **Choose platform** — If `-p`/`--platform` is not set, prompts in the terminal (1–5 or name). With `-y`, uses default (web).
2. **Copy directories** — Copies `ai/`, `prompts/`, `docs/` from templates into the current directory.
3. **Update config** — Sets `platform` in `ai/ai.config.yml` to the chosen platform.
4. **.gitignore** — Appends a prompt-guide block (common + platform-specific) to `.gitignore`, or creates it if missing.

If `ai/`, `prompts/`, or `docs/` already exist, init **overwrites** them and prints a warning.

### Examples

```bash
# Interactive: choose platform in terminal
prompt-guide init

# Specify platform
prompt-guide init --platform=ios
prompt-guide init -p web
prompt-guide init -p server

# Non-interactive (default platform: web)
prompt-guide init -y

# Show planned actions only
prompt-guide init -p flutter --dry-run

# Verbose
prompt-guide init -p android -v
```

### Notes

- **Existing `ai/`, `prompts/`, `docs/`** — Init overwrites them. Back up or copy files manually if you have local changes.
- **Templates not found** — Reinstall the CLI or, when running from this repo, run `npm run build` and ensure `ai/`, `prompts/`, `docs/` exist under `cli/`.

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
| `--fix` | Create or append the prompt-guide block in `.gitignore` when missing. Uses `platform` from `ai/ai.config.yml` (default `web`). |
| `--json` | Output results as JSON (for scripting). |

### Checks

| Check | Pass condition | On failure |
|-------|-----------------|------------|
| **ai/** | `ai/` exists | Run `prompt-guide init` |
| **ai/ai.config.yml** | File exists and contains `platform:` and `context:` | Run `prompt-guide init` or add those keys |
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

- **After install**: Edit `ai/ai.config.yml` (e.g. `model.default`, `context.include`) for your project. See the main [README Configuration Reference](../README.md#configuration-reference) and [what-install.md](what-install.md).
- **Rule summaries**: See `docs/system.core.md`, `docs/review.md`, and `docs/rules-by-platform.md` for human-readable rule summaries.
