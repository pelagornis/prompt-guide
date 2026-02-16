# Prompt Guide

**CLI project, not a project template.** This repo is a tool that adds a single config file and rule templates to any project. Install globally (`npm i -g @pelagornis/prompt-guide`), run **`prompt-guide init`** to create **`prompt.config.js`** (and copy `prompts/`, `docs/`), then run **`prompt-guide install`** to generate **tool-specific rules** (Cursor, Codex, Windsurf, Claude Code) from that config. All behavior is defined in `prompt.config.js` (tool, platform, model, context, task presets); prompt text lives in `prompts/*.yml`; human summaries are in `docs/` as Markdown.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration Reference](#configuration-reference)
- [File Structure](#file-structure)
- [Usage Guide](#usage-guide)
- [What installs what](#what-installs-what)
- [Customization](#customization)
- [Rule Strength](#rule-strength)
- [License](#license)

---

## Overview

Prompt Guide gives you a **single JS config** (`prompt.config.js`) that controls:

- **Which AI tool** to target (cursor, claude, codex, windsurf, other). **`prompt-guide install`** reads this and writes the right rule files for that tool.
- **Which model** runs by default and per task (e.g. review vs. implement).
- **What context** is sent to the model: allow-list and deny-list paths so secrets and build artifacts are never included.
- **How strict** the AI behaves: global rules (no hallucination, cite sources, stay in scope, etc.).
- **Which “agent”** runs: task presets (default, review, refactor, implement, fix_bug, security_audit) each with their own prompt and optional model/rules.
- **System role** text: from `prompts/system.core.yml` (and review from `prompts/review.yml`); install injects these into the tool-specific output.

The same setup works across **iOS, Android, Flutter, Web, and Server** projects. Run **init** to create `prompt.config.js` and **install** to generate rules for your chosen tool; edit `context.include` and `platform` in `prompt.config.js` for your repo.

---

## Features

| Feature | Description |
|--------|-------------|
| **Model selection** | Global `model.default` plus optional per-preset `model` override. Optional `model.options` list for UI or validation. |
| **Context scope** | `include` (allow) and `exclude` (deny) path patterns. Predefined exclusions for `.env`, secrets, keys, `node_modules`, `dist`, `.git`, etc., to improve security and accuracy. |
| **Strict rules** | Global rules: no auto scan, deterministic, strict, no hallucination, cite sources, require file refs, stay in scope, no unsolicited changes. |
| **Task presets** | Agent-style presets: default, review, refactor, implement, fix_bug, security_audit. Each can set prompt, optional model, and `rules_extra`. |
| **System role** | Single source: `prompts.default` points to `prompts/system.core.yml`; `prompt-guide install` injects its `prompt` key into tool-specific outputs. |
| **Platform-specific config** | Set `platform: ios` (or android, flutter, web, server) to use per-platform context and rules; each platform has its own `context.include` and `rules_key` into `rules.by-platform.yml`. |
| **Human-readable docs** | Rule summaries in `docs/*.md` so people can read the rules without parsing YAML. |
| **Tool-specific rules** | Each AI tool (Cursor, Claude Code, Codex, Windsurf) reads rules from different paths and formats. See [docs/rules-by-tool.md](docs/rules-by-tool.md). |
| **CLI** | `prompt-guide init` — create `prompt.config.js` + prompts/ + docs/. `prompt-guide install` — generate tool-specific rules from config. See [cli/README.md](cli/README.md). |

---

## Quick Start

**Option A — CLI (no project dependency)**  
Install once globally (e.g. on macOS), then run from any directory:

```bash
npm i -g @pelagornis/prompt-guide
prompt-guide init          # creates prompt.config.js + prompts/ + docs/
prompt-guide install       # generates rules for your tool (Cursor, Codex, Windsurf, Claude Code)
# or: prompt-guide init --platform=ios --tool=codex
```

No need to add the package to your project’s `package.json`. **init** creates `prompt.config.js` and copies `prompts/`, `docs/`; **install** reads the config and writes tool-specific rule files (e.g. `.cursor/rules/`, `AGENTS.md`, `.windsurfrules`, `.claude/rules/`). See [cli/README.md](cli/README.md).

Alternatively, one-off: `npx @pelagornis/prompt-guide init` then `npx @pelagornis/prompt-guide install`

**Using the CLI from this repo (no `cd cli`)**  
At the **repository root** you can run:

```bash
npm install    # installs CLI deps (workspaces)
npm run build  # builds the CLI
npm run init   # runs init (interactive)
npm run cli -- init --platform=ios   # run any CLI command
```

**Option B — Manual**  
1. Copy `prompt.config.js` (or create from [template](cli/src/lib/prompt-config-template.ts)) and copy `prompts/`, `docs/` into your project.
2. **Edit `prompt.config.js`**:
   - Set `tool` to your AI environment (`cursor`, `claude`, `codex`, `windsurf`, `other`).
   - Set `model.default` to your tool’s model id (e.g. `claude-sonnet-4`, `gpt-4o`).
   - Set `context.include` to your source paths (e.g. `src/**`, `app/**`, `lib/**`).
   - Optionally set `platform` and adjust `platforms.<id>.context.include` for that platform’s paths.
3. Run **`prompt-guide install`** to generate the rule files for your `tool` (or write them by hand; see [docs/rules-by-tool.md](docs/rules-by-tool.md)).
4. **Use a task preset** (e.g. `review`, `refactor`, `fix_bug`) when running the agent so it loads the right prompt and behavior.
5. **Read the rules** in `docs/system.core.md`, `docs/review.md`, and `docs/rules-by-platform.md` when you need the human-friendly summary.

---

## What installs what

**Any project** uses one config file and optional tool-generated rule files.

- **init**: Creates `prompt.config.js` and copies `prompts/`, `docs/` (+ platform-specific `.gitignore` when using the CLI). No `ai/` folder.
- **install**: Reads `prompt.config.js` and writes **tool-specific** rule files: for **Cursor** `.cursor/rules/`, for **Codex** `AGENTS.md`, for **Windsurf** `.windsurfrules`, for **Claude Code** `.claude/rules/`. Change `tool` in config and run install again to switch.
- **Which feature adds what**: see **[docs/what-install.md](docs/what-install.md)** for a detailed map:
  - What each path adds (prompt.config.js vs prompts vs docs).
  - What each config section controls (model, context, taskPresets, platforms).
  - What each prompt file and task preset adds.
  - **After install**: how to change platform, presets, context, model, or add new presets.

---

## Configuration Reference

Everything below lives in **`prompt.config.js`** (one JS object). Run **`prompt-guide install`** after editing to regenerate tool-specific rules.

### Tool (AI environment)

Which AI editor or API you use. **`prompt-guide install`** uses this to write the right rule files.

| Key | Type | Description |
|-----|------|-------------|
| `tool` | string | One of: `cursor`, `claude`, `codex`, `windsurf`, `other`. Set in prompt.config.js; run `prompt-guide install` to apply. |

Example: `tool: 'codex'` then `prompt-guide install` creates `AGENTS.md`.

### Model

Controls which model is used globally and per preset.

| Key | Type | Description |
|-----|------|-------------|
| `model.default` | string | Default model id for all presets (e.g. `claude-sonnet-4`, `gpt-4o`). Must match your AI tool’s model identifiers. |
| `model.options` | list of strings | Optional. List of model ids available in this project (useful for a model selector UI or validation). |
| `taskPresets.<name>.model` | string | Optional. Override for this preset only. If omitted, `model.default` is used. |

**Example**

```javascript
model: {
  default: 'claude-sonnet-4',
  options: ['claude-sonnet-4', 'claude-opus-4', 'gpt-4o', 'gpt-4o-mini'],
}
```

---

### Context Scope (security and accuracy)

Defines which files can be used as context and which must never be sent to the model.

| Key | Type | Description |
|-----|------|-------------|
| `context.include` | list of strings | **Allow-list.** Only files under these glob patterns are considered for context. Use your project’s source roots (e.g. `src/**`, `app/**`, `lib/**`, `packages/**`). |
| `context.exclude` | list of strings | **Deny-list.** Files matching these patterns are never sent to the model. Use for secrets, env files, keys, and build/cache dirs to improve security and reduce noise. |
| `context.max_files` | number | Maximum number of files to include in one context window (default: 50). |
| `context.max_tokens` | number | Maximum tokens allowed for context (default: 8000). |

**Why this matters**

- **Security:** Excluding `**/.env`, `**/secrets/**`, `**/*.pem`, `**/*.key`, etc., prevents credentials from being sent to the AI.
- **Accuracy:** Excluding `node_modules`, `dist`, `build`, `.git`, `vendor` keeps the context focused on source code and reduces irrelevant content.

**Example**

```javascript
context: {
  include: ['src/**', 'lib/**', 'app/**', 'packages/**'],
  exclude: ['**/.env', '**/.env.*', '**/secrets/**', '**/node_modules/**', '**/dist/**', '**/.git/**'],
  max_files: 50,
  max_tokens: 8000,
}
```

---

### Prompts (system role and review)

Maps logical names to prompt files (each file’s content is taken from its **`prompt`** key).

| Key | Type | Description |
|-----|------|-------------|
| `prompts.default` | string | **System role.** Path to the default prompt file (e.g. `'prompts/system.core.yml'`). Your tool reads this YAML and uses the **`prompt`** key as the system message. **`prompt-guide install`** injects it into tool-specific outputs. |
| `prompts.review` | string | Prompt file for code review (checklist, approval criteria). Same format: YAML with a **`prompt`** key. |

---

### Task Presets (agent-style)

Task presets define named “modes” (default, review, refactor, implement, fix_bug, security_audit). Each preset can specify:

- **prompt** – which YAML file to use (its `prompt` key).
- **context_scope** – which context rules to use (e.g. `default`).
- **model** – optional model override for this preset.
- **rules_extra** – optional list of extra instruction lines for this preset.

| Preset | Purpose | Prompt | Typical use |
|--------|---------|--------|-------------|
| `default` | General coding with full system rules | system.core.yml | Everyday editing and feature work. |
| `review` | Code review with checklist and approval | review.yml | PR review, style and correctness. |
| `refactor` | Refactor only; preserve behavior | system.core.yml + rules_extra | Style/structure changes, no behavior change. |
| `implement` | Implement from spec/ticket; add tests | system.core.yml + rules_extra | New feature from description or ticket. |
| `fix_bug` | Root cause + minimal fix | system.core.yml + rules_extra | Bugfix only; no extra refactors. |
| `security_audit` | Security-focused review | review.yml + rules_extra | Secrets, validation, auth, sensitive data in logs. |

**Example preset with override**

```javascript
taskPresets: {
  review: {
    description: 'Code review with checklist and approval criteria',
    prompt: 'prompts/review.yml',
    model: 'claude-sonnet-4',  // override for this preset only
  },
}
```

---

### Platform-specific settings

You can **select a platform** so that context and rules are merged for that platform (iOS, Android, Flutter, Web, Server). Base config is still used for model, system role, task presets, and rules; when a platform is active, its **context** and **rules** (from `prompts/rules.by-platform.yml`) are merged in.

| Key | Type | Description |
|-----|------|-------------|
| `platform` | string \| null | **Active platform.** Set to `ios`, `android`, `flutter`, `web`, or `server` to enable that platform’s overrides. `null` = use only base config. Can be set via config or env (e.g. `PLATFORM=ios`). |
| `platforms.<id>` | object | Per-platform overrides. `<id>` must match a key in `prompts/rules.by-platform.yml` (ios, android, flutter, web, server). |
| `platforms.<id>.label` | string | Display name (e.g. "iOS", "Android"). |
| `platforms.<id>.context.include` | list of strings | **Context allow-list for this platform.** When this platform is active, these paths are used (and replace the base `context.include`). Adjust to your repo layout (e.g. `ios/**`, `android/**`, `lib/**`). |
| `platforms.<id>.context.exclude` | list of strings | Optional. Extra deny patterns for this platform. Merged with base `context.exclude`. |
| `platforms.<id>.model.default` | string | Optional. Model override for this platform. |
| `platforms.<id>.rules_key` | string | Key to load from `prompts/rules.by-platform.yml` (e.g. `ios` → `platforms.ios.prompt`). Tool should merge that prompt text after the system role. Optionally always merge `common` as well. |

**How merge works**

1. Start with **base** config (model, context, prompts, taskPresets, platforms, rules).
2. If `platform` is set (e.g. `ios`):
   - **Context:** Use `platforms.ios.context.include` (and optional `exclude`) for context scope; if a key is missing, fall back to base.
   - **Rules:** Load `prompts/rules.by-platform.yml`, take `platforms.ios.prompt`, and append it to the system prompt. Optionally append `platforms.common.prompt` too.
3. If `platform` is null or not set, no platform merge; base config only.

**Example (iOS active)**

```javascript
platform: 'ios',

platforms: {
  ios: {
    label: 'iOS',
    context: {
      include: ['ios/**', '*.xcodeproj/**', 'Shared/**', 'src/**'],
    },
    rules_key: 'ios',
  },
}
```

Adjust each platform’s `context.include` (and optional `exclude`) to match your project (e.g. monorepo vs single-app).

---

### Rules (global, strict)

Global rules applied to all presets. Your tool should interpret these as strict defaults (e.g. when building the system prompt or agent instructions).

| Rule | Purpose |
|------|--------|
| `no_auto_scan` | Do not automatically scan the whole codebase; use only provided or referenced context. |
| `deterministic` | Prefer deterministic, reproducible outputs where possible. |
| `strict` | Enforce MUST/MUST NOT from the system prompt; treat violations as blocking. |
| `no_hallucination` | Do not invent APIs or code; only cite or implement what exists or is specified. |
| `cite_sources` | When giving code or advice, reference file paths and line numbers. |
| `require_file_refs` | When suggesting or making changes, specify file and line. |
| `stay_in_scope` | Do not add features or files that are out of scope for the current request. |
| `no_unsolicited_changes` | Only change what the user asked for; no extra “improvements” unless requested. |

---

## File Structure

**After `prompt-guide init`** (in your project):

```
your-project/
├── prompt.config.js          # Single source: tool, platform, model, context, taskPresets (edit this)
├── prompts/
│   ├── system.core.yml      # System role / default (prompt key = injected text)
│   ├── review.yml           # Review prompt (checklist, approval criteria)
│   ├── rules.by-platform.yml
│   └── guide.template.yml
├── docs/
│   ├── system.core.md
│   ├── review.md
│   └── rules-by-platform.md
└── (after prompt-guide install, one of: .cursor/rules/ | AGENTS.md | .windsurfrules | .claude/rules/)
```

| Path | Role |
|------|------|
| `prompt.config.js` | **Config.** tool, platform, model, context, prompts paths, taskPresets, platforms, rules. Run `prompt-guide install` after edits. |
| `prompts/system.core.yml` | **System role / default.** Contains `meta` and `prompt` (the actual system prompt text). |
| `prompts/review.yml` | **Review mode.** Contains `prompt` used for code review preset. |
| `prompts/rules.by-platform.yml` | **Platform add-ons.** `platforms.<ios\|android\|flutter\|web\|server>.prompt` (and `common`). |
| `prompts/guide.template.yml` | **Ad-hoc tasks.** Field definitions to fill for one-off prompts. |
| `docs/*.md` | **Human docs.** Summaries of the rules in Markdown. |
| `.cursor/rules/`, `AGENTS.md`, `.windsurfrules`, `.claude/rules/` | **Generated by install.** Tool-specific rule files; do not edit by hand if you re-run install. |

---

## Usage Guide

### Applying the system role

- Your tool should read the file at `prompts.default` (e.g. `prompts/system.core.yml`), parse the YAML, and use the **`prompt`** key value as the system message for the AI.
- That file is the single source for the default system role.

### Using task presets

1. User (or your UI) chooses a preset name: e.g. `review`, `refactor`, `implement`, `fix_bug`, `security_audit`, or `default`.
2. Load the preset from `taskPresets.<name>` in `prompt.config.js`:
   - Resolve **prompt** to the YAML file path and use its `prompt` key.
   - If the preset has **model**, use it; otherwise use `model.default`.
   - If the preset has **rules_extra**, append those lines to the system prompt (or equivalent).
3. Apply **context** from `context.include` / `context.exclude` and **global rules** from `rules`.

### Using a platform (per-platform setup)

1. Set **`platform`** in `prompt.config.js` to the platform id (e.g. `'ios'`, `'android'`, `'flutter'`, `'web'`, `'server'`).
2. Your tool should **merge** base config with `platforms[platform]`:
   - Use `platforms.<id>.context.include` (and optional `exclude`) for context when present.
   - Load `prompts/rules.by-platform.yml`, read `platforms[platforms.<id>.rules_key].prompt` (and optionally `platforms.common.prompt`), and append to the system prompt.
3. Adjust **`platforms.<id>.context.include`** in `prompt.config.js` to match your repo (e.g. `ios/**`, `android/**`, `lib/**` for Flutter).
4. Run **`prompt-guide install`** after changing platform to regenerate tool-specific rules.

### Reading the rules (humans)

- **Core rules:** `docs/system.core.md`
- **Review criteria:** `docs/review.md`
- **Platform rules:** `docs/rules-by-platform.md`

---

## Customization

- **Change default model:** Edit `model.default` in `prompt.config.js`, then run `prompt-guide install`.
- **Add or remove presets:** Edit `taskPresets` in `prompt.config.js`; add a new key (e.g. `docs`) with `description`, `prompt`, and optional `model` and `rules_extra`.
- **Tighten or loosen context:** Adjust `context.include` (your source roots) and `context.exclude` (secrets, build dirs, etc.) in `prompt.config.js`.
- **Stricter or looser behavior:** Edit the `prompt` key in `prompts/system.core.yml` (and/or `prompts/review.yml`), or add/remove items under `rules` in `prompt.config.js` if your tool supports them. Run `prompt-guide install` after changes.
- **Switch AI tool:** Change `tool` in `prompt.config.js` (e.g. `'cursor'` → `'codex'`), then run `prompt-guide install` to generate the new tool's rule files.
- **Project-specific rules:** Add your own YAML (e.g. `prompts/myproject.yml`) with extra rules and reference it in `prompt.config.js`; or extend `prompts/rules.by-platform.yml` with a custom platform/category.

---

## Rule Strength

In the prompt text (and in the human docs), rules use these levels:

- **MUST / MUST NOT:** Required. Non-compliance should be treated as a blocking issue (fix before considering the task done).
- **SHOULD:** Recommended. Omit only with good reason; can be noted in review.

**Exceptions:** If the user **explicitly** says to exclude or relax a rule (e.g. “ignore style for this edit” or “this rule doesn’t apply here”), that rule can be relaxed for that request only. Without such instruction, all MUST/MUST NOT and SHOULD rules apply.

---

## License

MIT. See [LICENSE](LICENSE) for details.
