# What Installs What — Feature overview

This document explains **what each part** (CLI, config, presets, platforms) **adds** and **what to change when** you need to adjust behavior.  
The same structure works for **any project** (language and framework agnostic).

**CLI details**: see [docs/CLI.md](CLI.md).

---

## 0. CLI command summary

| Command | Description |
|---------|-------------|
| `prompt-guide init` | Install ai/, prompts/, docs/ in the current directory and add platform-specific .gitignore. Use `-p <platform>` or interactive choice. |
| `prompt-guide init --dry-run` | Show what would be done without writing files. |
| `prompt-guide doctor` | Check presence and validity of ai/, config, prompts/, docs/, .gitignore. |
| `prompt-guide doctor --fix` | Create or append the prompt-guide block in .gitignore when missing. |

---

## 1. What gets added on install (CLI `init` or manual copy)

| Path | Description | Added by |
|------|-------------|----------|
| **ai/ai.config.yml** | Model, context, system role, task presets, platform, rules. **Single source of behavior.** | CLI init / manual copy |
| **prompts/system.core.yml** | Core rules (YAML). Tools inject the `prompt` key. | CLI init / manual copy |
| **prompts/review.yml** | Review rules. Uses `prompt` key. | CLI init / manual copy |
| **prompts/rules.by-platform.yml** | Per-platform rules (ios, android, flutter, web, server, common). `platforms.<name>.prompt` | CLI init / manual copy |
| **prompts/guide.template.yml** | Task prompt template field definitions. | CLI init / manual copy |
| **docs/system.core.md** | Core rules summary (human-readable). | CLI init / manual copy |
| **docs/review.md** | Review criteria summary. | CLI init / manual copy |
| **docs/rules-by-platform.md** | Per-platform rules summary. | CLI init / manual copy |
| **.gitignore** (block) | Common + **chosen platform** ignore patterns. | CLI init (varies by platform) |

With the CLI, choosing a **platform** sets `platform` in `ai.config.yml` and appends that platform’s patterns to `.gitignore`.

---

## 2. ai.config.yml — What each section controls

| Section | What it adds/controls | When changing later |
|---------|------------------------|----------------------|
| **model** | Default model and option list. | Edit `model.default`, `model.options`. Add `task_presets.<name>.model` for per-preset model. |
| **context** | Which paths to include/exclude, max_files, max_tokens. | Adjust `include`/`exclude` to your project layout. |
| **system_role** | File that defines the system role (quality, security, errors, etc.). | Usually keep. To change, edit the `prompt` in the YAML it points to. |
| **prompts** | Named prompt files (default, review, etc.). | Add names or change paths. |
| **task_presets** | Per-task prompt, extra rules, model. | Add presets or edit `prompt`/`rules_extra`/`model`. |
| **platform** | Current platform (ios \| android \| flutter \| web \| server). null = no platform merge. | Set e.g. `platform: ios` to apply that platform’s config. |
| **platforms** | Per-platform context.include and rules_key. | Adjust `platforms.<id>.context.include` to your paths. |
| **rules** | Global rules (no_auto_scan, strict, cite_sources, etc.). | Toggle here if your tool supports them. |

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

If `platform: null`, no platform merge is applied and only the top-level **context** in `ai.config.yml` is used.

---

## 6. Later changes — What to edit by scenario

| Goal | What to change |
|------|----------------|
| **Switch platform** | Change `platform` in `ai.config.yml`. Optionally adjust `platforms.<id>.context.include` for your paths. |
| **Stricter review** | Use `task_presets.review` (already wired). To tighten, edit `prompt` in `prompts/review.yml`. |
| **Adjust context scope** | Edit `context.include`/`context.exclude` for your layout; if using a platform, also `platforms.<id>.context.include`. |
| **Change model only** | Change `model.default`. Add `task_presets.<name>.model` for a specific task. |
| **Add a task preset** | Add a new entry under `task_presets` with `description`, `prompt`, and optionally `rules_extra`, `model`. |
| **Project-specific rules** | Add to `prompt` in `prompts/system.core.yml` or add a new YAML and reference it from `system_role`/`prompts`. |

---

## 7. Using this in any project

- **Install**: Run `prompt-guide init` (or copy `ai/`, `prompts/`, `docs/` manually). Then run `prompt-guide doctor`; if only .gitignore is missing, run `prompt-guide doctor --fix`.
- **Common layout**: `ai.config.yml` + `prompts/system.core.yml` + `prompts/review.yml` + `prompts/rules.by-platform.yml` is the same **for all languages and frameworks**.
- **Project-specific**: Only `context.include`/`exclude`, `platform`, `platforms.<id>.context.include`, and optionally `model.default` and presets.
- **Docs**: Rule summaries are in `docs/system.core.md`, `docs/review.md`, `docs/rules-by-platform.md`. CLI usage in `docs/CLI.md`. YAML is for tools; Markdown is for humans.

This document is a single place to see **what each part adds** and **what to change later** after install.
