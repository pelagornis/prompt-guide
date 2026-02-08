# Prompt Guide

A **config-driven prompt guide** for AI-assisted coding. All behavior is defined in `ai/ai.config.yml`: model choice, context scope (with security-aware exclusions), strict rules, task presets (agent-style workflows), and system role. Prompts are stored in YAML; humans can read rule summaries in Markdown under `docs/`.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration Reference](#configuration-reference)
- [File Structure](#file-structure)
- [Usage Guide](#usage-guide)
- [Customization](#customization)
- [Rule Strength](#rule-strength)
- [License](#license)

---

## Overview

Prompt Guide gives you a single YAML config (`ai/ai.config.yml`) that controls:

- **Which model** runs by default and per task (e.g. review vs. implement).
- **What context** is sent to the model: allow-list paths and deny-list paths so secrets and build artifacts are never included.
- **How strict** the AI behaves: global rules (no hallucination, cite sources, stay in scope, etc.).
- **Which “agent”** runs: task presets (default, review, refactor, implement, fix_bug, security_audit) each with their own prompt and optional model/rules.
- **System role**: one file (`prompts/system.core.yml`) that defines base behavior; its `prompt` key is what gets injected.

The same setup works across **iOS, Android, Flutter, Web, and Server** projects. Fork the repo, point `context.include` at your code paths, and optionally add platform-specific rules from `prompts/rules.by-platform.yml`.

---

## Features

| Feature | Description |
|--------|-------------|
| **Model selection** | Global `model.default` plus optional per-preset `model` override. Optional `model.options` list for UI or validation. |
| **Context scope** | `include` (allow) and `exclude` (deny) path patterns. Predefined exclusions for `.env`, secrets, keys, `node_modules`, `dist`, `.git`, etc., to improve security and accuracy. |
| **Strict rules** | Global rules: no auto scan, deterministic, strict, no hallucination, cite sources, require file refs, stay in scope, no unsolicited changes. |
| **Task presets** | Agent-style presets: default, review, refactor, implement, fix_bug, security_audit. Each can set prompt, optional model, and `rules_extra`. |
| **System role** | Single source of truth: `system_role` points to `prompts/system.core.yml`; tools use the `prompt` key for injection. |
| **Platform-specific config** | Set `platform: ios` (or android, flutter, web, server) to use per-platform context and rules; each platform has its own `context.include` and `rules_key` into `rules.by-platform.yml`. |
| **Human-readable docs** | Rule summaries in `docs/*.md` so people can read the rules without parsing YAML. |
| **CLI** | `npx prompt-guide-cli init` — install in any project: pick platform, copy config, set `.gitignore`. See [cli/README.md](cli/README.md). |

---

## Quick Start

**Option A — CLI (recommended for new projects)**  
From any project directory, run:

```bash
npx prompt-guide-cli init
```

Then choose platform (ios / android / flutter / web / server). The CLI copies `ai/`, `prompts/`, `docs/`, sets `platform` in `ai/ai.config.yml`, and appends recommended `.gitignore` entries. See [cli/README.md](cli/README.md) for details.

**Using the CLI from this repo (no `cd cli`)**  
At the **repository root** you can run:

```bash
npm install    # installs CLI deps (workspaces)
npm run build  # builds the CLI
npm run init   # runs init (interactive)
npm run cli -- init --platform=ios   # run any CLI command
```

**Option B — Manual**  
1. Fork or clone this repository into your project (or copy `ai/`, `prompts/`, `docs/`).
2. **Edit `ai/ai.config.yml`**:
   - Set `model.default` to your tool’s model id (e.g. `claude-sonnet-4`, `gpt-4o`).
   - Set `context.include` to your source paths (e.g. `src/**`, `app/**`, `lib/**`).
   - Optionally set `platform: ios` (or android, flutter, web, server) and adjust `platforms.<id>.context.include` for that platform’s paths.
   - Optionally tighten `context.exclude` for your repo (secrets, build dirs).
3. **Point your tool** (or use the CLI above) at `ai.config.yml` (and at the paths under `prompts/` for loading the `prompt` key from YAML).
4. **Use a task preset** (e.g. `review`, `refactor`, `fix_bug`) when running the agent so it loads the right prompt and behavior.
5. **Read the rules** in `docs/system.core.md`, `docs/review.md`, and `docs/rules-by-platform.md` when you need the human-friendly summary.

---

## Configuration Reference

Everything below lives in **`ai/ai.config.yml`** unless noted.

### Model

Controls which model is used globally and per preset.

| Key | Type | Description |
|-----|------|-------------|
| `model.default` | string | Default model id for all presets (e.g. `claude-sonnet-4`, `gpt-4o`). Must match your AI tool’s model identifiers. |
| `model.options` | list of strings | Optional. List of model ids available in this project (useful for a model selector UI or validation). |
| `task_presets.<name>.model` | string | Optional. Override for this preset only. If omitted, `model.default` is used. |

**Example**

```yaml
model:
  default: claude-sonnet-4
  options:
    - claude-sonnet-4
    - claude-opus-4
    - gpt-4o
    - gpt-4o-mini
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

```yaml
context:
  include:
    - src/**
    - lib/**
    - app/**
    - packages/**
  exclude:
    - "**/.env"
    - "**/.env.*"
    - "**/secrets/**"
    - "**/node_modules/**"
    - "**/dist/**"
    - "**/.git/**"
  max_files: 50
  max_tokens: 8000
```

---

### System Role

The system role is the base “persona” and rules for the AI. It is defined by a single file.

| Key | Type | Description |
|-----|------|-------------|
| `system_role` | string | Path to the YAML file that contains the system prompt. The tool should read this file and use the **`prompt`** key value as the system message. |

In this repo, `system_role` is set to `prompts/system.core.yml`. That file’s `prompt` key holds the full system prompt (MUST/MUST NOT rules, code quality, security, etc.). Same file is used for `prompts.default`.

---

### Prompts

Maps logical names to prompt files (each file’s content is taken from its **`prompt`** key).

| Key | Type | Description |
|-----|------|-------------|
| `prompts.default` | string | Default prompt file (typically the same as `system_role`). |
| `prompts.review` | string | Prompt file used for code review (e.g. checklist, approval criteria). |

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

```yaml
task_presets:
  review:
    description: "Code review with checklist and approval criteria"
    prompt: prompts/review.yml
    context_scope: default
    model: claude-sonnet-4   # override for this preset only
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

1. Start with **base** config (model, context, system_role, prompts, task_presets, rules).
2. If `platform` is set (e.g. `ios`):
   - **Context:** Use `platforms.ios.context.include` (and optional `exclude`) for context scope; if a key is missing, fall back to base.
   - **Rules:** Load `prompts/rules.by-platform.yml`, take `platforms.ios.prompt`, and append it to the system prompt. Optionally append `platforms.common.prompt` too.
3. If `platform` is null or not set, no platform merge; base config only.

**Example (iOS active)**

```yaml
platform: ios

platforms:
  ios:
    label: iOS
    context:
      include:
        - ios/**
        - "*.xcodeproj/**"
        - Shared/**
        - src/**
    rules_key: ios
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

```
prompt-guide/
├── cli/                     # prompt-guide-cli: npx prompt-guide-cli init
│   ├── bin/cli.js
│   ├── lib/init.js
│   ├── templates/           # ai/, prompts/, docs/ (shipped with CLI)
│   └── README.md
├── ai/
│   └── ai.config.yml          # Single source of truth: model, context, rules, presets, system role
├── prompts/
│   ├── system.core.yml       # System role + default prompt (prompt key = injected text)
│   ├── review.yml            # Review prompt (checklist, approval criteria)
│   ├── rules.by-platform.yml # Platform-specific rules (iOS, Android, Flutter, Web, Server); merge as needed
│   └── guide.template.yml    # Template fields for ad-hoc task prompts (copy and fill)
├── docs/
│   ├── system.core.md        # Human-readable summary of core rules
│   ├── review.md             # Human-readable review criteria
│   └── rules-by-platform.md  # Human-readable platform rules summary
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

| Path | Role |
|------|------|
| `ai/ai.config.yml` | **Config.** Model, context scope, system role, prompts, task presets, global rules. |
| `prompts/system.core.yml` | **System role / default.** Contains `meta` and `prompt` (the actual system prompt text). |
| `prompts/review.yml` | **Review mode.** Contains `prompt` used for code review preset. |
| `prompts/rules.by-platform.yml` | **Platform add-ons.** `platforms.<ios\|android\|flutter\|web\|server>.prompt` (and `common`) to merge with default when needed. |
| `prompts/guide.template.yml` | **Ad-hoc tasks.** Field definitions to fill for one-off prompts. |
| `docs/*.md` | **Human docs.** Summaries of the rules in Markdown; no need to open YAML to read them. |

---

## Usage Guide

### Applying the system role

- Your tool should read `system_role` (e.g. `prompts/system.core.yml`), parse the YAML, and use the **`prompt`** key value as the system message for the AI.
- Same file is used for `prompts.default`, so “default” and “system role” stay in sync.

### Using task presets

1. User (or your UI) chooses a preset name: e.g. `review`, `refactor`, `implement`, `fix_bug`, `security_audit`, or `default`.
2. Load the preset from `task_presets.<name>`:
   - Resolve **prompt** to the YAML file and use its `prompt` key.
   - If the preset has **model**, use it; otherwise use `model.default`.
   - If the preset has **rules_extra**, append those lines to the system prompt (or equivalent).
3. Apply **context** from `context.include` / `context.exclude` and **global rules** from `rules`.

### Using a platform (per-platform setup)

1. Set **`platform`** in `ai.config.yml` to the platform id (e.g. `ios`, `android`, `flutter`, `web`, `server`), or pass it via env (e.g. `PLATFORM=ios`).
2. Your tool should **merge** base config with `platforms[platform]`:
   - Use `platforms.<id>.context.include` (and optional `exclude`) for context when present.
   - Load `prompts/rules.by-platform.yml`, read `platforms[platforms.<id>.rules_key].prompt` (and optionally `platforms.common.prompt`), and append to the system prompt.
3. Adjust **`platforms.<id>.context.include`** in `ai.config.yml` to match your repo (e.g. `ios/**`, `android/**`, `lib/**` for Flutter).

### Reading the rules (humans)

- **Core rules:** `docs/system.core.md`
- **Review criteria:** `docs/review.md`
- **Platform rules:** `docs/rules-by-platform.md`

---

## Customization

- **Change default model:** Edit `model.default` in `ai.config.yml`.
- **Add or remove presets:** Edit `task_presets` in `ai.config.yml`; add a new key (e.g. `docs`) with `description`, `prompt`, and optional `model` and `rules_extra`.
- **Tighten or loosen context:** Adjust `context.include` (your source roots) and `context.exclude` (secrets, build dirs, etc.).
- **Stricter or looser behavior:** Edit the `prompt` key in `prompts/system.core.yml` (and/or `prompts/review.yml`), or add/remove items under `rules` in `ai.config.yml` if your tool supports them.
- **Project-specific rules:** Add your own YAML (e.g. `rules.myproject.yml`) with extra rules and merge when building the system prompt; or extend `prompts/rules.by-platform.yml` with a custom platform/category.

---

## Rule Strength

In the prompt text (and in the human docs), rules use these levels:

- **MUST / MUST NOT:** Required. Non-compliance should be treated as a blocking issue (fix before considering the task done).
- **SHOULD:** Recommended. Omit only with good reason; can be noted in review.

**Exceptions:** If the user **explicitly** says to exclude or relax a rule (e.g. “ignore style for this edit” or “this rule doesn’t apply here”), that rule can be relaxed for that request only. Without such instruction, all MUST/MUST NOT and SHOULD rules apply.

---

## License

MIT. See [LICENSE](LICENSE) for details.
