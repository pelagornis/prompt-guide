# What Installs What — Feature overview

This document explains **what each part** (CLI, config, presets, platforms) **adds** and **what to change when** you need to adjust behavior.  
The same structure works for **any project** (language and framework agnostic).

**CLI details**: see [docs/CLI.md](CLI.md).

---

## 0. CLI command summary

| Command | Description |
|---------|-------------|
| `prompt-guide init` | Create **prompt.config.js** and copy prompts/, docs/ in the current directory; add platform-specific .gitignore. Use `-p <platform>` and `-t <tool>` or interactive. |
| `prompt-guide install` | Read **prompt.config.js** and generate **tool-specific** rule files (Cursor → .cursor/rules/, Codex → AGENTS.md, Windsurf → .windsurfrules, Claude Code → .claude/rules/). |
| `prompt-guide init --dry-run` | Show what would be done without writing files. |
| `prompt-guide install --dry-run` | Show which files would be written for the current tool. |
| `prompt-guide doctor` | Check presence of prompt.config.js, prompts/, docs/, .gitignore. |
| `prompt-guide doctor --fix` | Create or append the prompt-guide block in .gitignore when missing. |

---

## 1. What gets added

**init** adds:

| Path | Description | Added by |
|------|-------------|----------|
| **prompt.config.js** | tool, platform, model, context, prompts paths, taskPresets, platforms, rules. **Single source.** Edit and run `prompt-guide install` to apply. | CLI init |
| **prompts/** | system.core.yml, review.yml, rules.by-platform.yml, guide.template.yml. | CLI init / manual copy |
| **docs/** | system.core.md, review.md, rules-by-platform.md, etc. | CLI init / manual copy |
| **.gitignore** (block) | Common + chosen platform ignore patterns. | CLI init (varies by platform) |

**install** adds (depending on `tool` in prompt.config.js):

| Path | Description | When |
|------|-------------|------|
| **.cursor/rules/use-prompt-guide.mdc** | Cursor rule that references prompt.config.js and prompts/. | `tool: 'cursor'` |
| **AGENTS.md** | Codex project instructions (system + review summary). | `tool: 'codex'` |
| **.windsurfrules** | Windsurf project rules (condensed, &lt;6k chars). | `tool: 'windsurf'` |
| **.claude/rules/prompt-guide-*.md** | Claude Code rule files (core + review). | `tool: 'claude'` |

See **[rules-by-tool.md](rules-by-tool.md)** for where each tool reads rules.

---

## 2. prompt.config.js — What each section controls

| Section | What it adds/controls | When changing later |
|---------|------------------------|----------------------|
| **tool** | Which AI environment. **install** uses this to write the right files. | Change and run `prompt-guide install` again. |
| **platform** | Current platform (ios \| android \| flutter \| web \| server). | Edit; used for context hints and .gitignore. |
| **model** | Default model and option list. | Edit `model.default`, `model.options`. |
| **context** | Which paths to include/exclude, max_files, max_tokens. | Adjust `include`/`exclude` to your project layout. |
| **prompts** | Paths to default and review YAML (e.g. `prompts/system.core.yml`). | Add names or change paths; install reads these. |
| **taskPresets** | Per-task prompt path, description, rules_extra, model. | Add presets or edit. |
| **platforms** | Per-platform context.include and rules_key. | Adjust to your paths. |
| **rules** | Global rules (no_auto_scan, strict, cite_sources, etc.). | Toggle if your tool supports them. |

---

## 3. Prompt files — What each adds

| File | Rules it adds (summary) | When applied |
|------|-------------------------|--------------|
| **prompts/system.core.yml** | Role, response, code quality, security, errors, docs, collaboration. MUST/MUST NOT. | Used by `system_role`, `prompts.default`, most task presets. |
| **prompts/review.yml** | Review scope, checklist (consistency, quality, security, errors, compatibility), output format, approve/request-changes. | Used by `prompts.review`, presets `review`, `security_audit`. |
| **prompts/rules.by-platform.yml** | Per-platform rules (iOS, Android, Flutter, Web, Server, common). | When `platform` is set, the matching `platforms.<id>.prompt` is merged after the system role. |
| **prompts/guide.template.yml** | Task template fields (platform, role, context, task, constraints, output). | For humans to copy and fill; not auto-injected by tools. |

---

## 4. Task presets — What each adds when selected

| Preset | Prompt used | Extra rules (rules_extra) |
|--------|--------------|---------------------------|
| **default** | system.core.yml | None |
| **review** | review.yml | None |
| **refactor** | system.core.yml | No behavior change, preserve semantics; small, single logical change per step. |
| **implement** | system.core.yml | Implement only what’s specified; add tests or test plan. |
| **fix_bug** | system.core.yml | Find root cause; minimal fix; no unnecessary refactor. |
| **security_audit** | review.yml | Focus on secrets, input validation, auth boundaries, sensitive data in logs. |

Changing the preset applies **different rules/prompts for that task only** in the same project.

---

## 5. Platforms — What gets merged when selected

| Platform | Example context.include | Rules (from) |
|----------|-------------------------|--------------|
| **ios** | ios/**, *.xcodeproj/**, Shared/**, src/** | rules.by-platform → platforms.ios.prompt |
| **android** | android/**, app/**, lib/**, src/** | platforms.android.prompt |
| **flutter** | lib/**, ios/**, android/**, test/**, pubspec.yaml | platforms.flutter.prompt |
| **web** | src/**, public/**, app/**, *.config.js, etc. | platforms.web.prompt |
| **server** | src/**, lib/**, app/**, internal/**, cmd/** | platforms.server.prompt |

If `platform` is null or unset, only the top-level **context** in `prompt.config.js` is used.

---

## 6. Later changes — What to edit by scenario

| Goal | What to change |
|------|----------------|
| **Switch platform** | Change `platform` in `prompt.config.js`. Optionally adjust `platforms.<id>.context.include` for your paths. |
| **Stricter review** | Use `taskPresets.review` (already wired). To tighten, edit `prompt` in `prompts/review.yml`. |
| **Adjust context scope** | Edit `context.include`/`context.exclude` for your layout; if using a platform, also `platforms.<id>.context.include`. |
| **Change model only** | Change `model.default`. Add `taskPresets.<name>.model` for a specific task. |
| **Add a task preset** | Add a new entry under `taskPresets` with `description`, `prompt`, and optionally `rules_extra`, `model`. Then run `prompt-guide install` if needed. |
| **Project-specific rules** | Add to `prompt` in `prompts/system.core.yml` or add a new YAML and reference it from `system_role`/`prompts`. |

---

## 7. Using this in any project

- **Install**: Run `prompt-guide init` then `prompt-guide install` (or copy `prompt.config.js`, `prompts/`, `docs/` manually and run install). Run `prompt-guide doctor`; if only .gitignore is missing, run `prompt-guide doctor --fix`.
- **Common layout**: `prompt.config.js` + `prompts/system.core.yml` + `prompts/review.yml` + `prompts/rules.by-platform.yml` is the same **for all languages and frameworks**.
- **Project-specific**: Only `context.include`/`exclude`, `platform`, `platforms.<id>.context.include`, and optionally `model.default` and presets.
- **Docs**: Rule summaries are in `docs/system.core.md`, `docs/review.md`, `docs/rules-by-platform.md`. CLI usage in `docs/CLI.md`. YAML is for tools; Markdown is for humans.

This document is a single place to see **what each part adds** and **what to change later** after install.
