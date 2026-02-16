# Prompt Guide — Docs index

This directory contains documentation for **setup, configuration, and rules**.  
Config lives in `prompt.config.js`; the actual rule text used for injection is in `prompts/*.yml`.  
Here we provide **human-readable summaries** and **CLI/feature documentation**.

---

## Document list

| Document | Audience | Content |
|----------|----------|---------|
| **[CLI.md](CLI.md)** | Users, developers | How to run the CLI, `init` / `doctor` commands and options, examples, errors and exit codes. |
| **[what-install.md](what-install.md)** | Users, maintainers | What each part (CLI, config, presets, platforms) **adds** and **what to change later**. |
| **[request-guide.md](request-guide.md)** | Developers | **How to write request lists**: per-preset tips, guide.template fields, spec/ticket writing, examples. |
| **[system.core.md](system.core.md)** | Developers, reviewers | Core rules summary (role, code quality, security, errors, docs, collaboration). Source: `prompts/system.core.yml`. |
| **[review.md](review.md)** | Reviewers | Code review scope, checklist, output format, conclusion rules. Source: `prompts/review.yml`. |
| **[rules-by-platform.md](rules-by-platform.md)** | Platform developers | Per-platform rule summaries (iOS, Android, Flutter, Web, Server). Source: `prompts/rules.by-platform.yml`. |
| **[rules-by-tool.md](rules-by-tool.md)** | Users, maintainers | **Where each AI tool reads rules**: Cursor (`.cursor/rules/`), Claude Code (`.claude/rules/`), Codex (`AGENTS.md`), Windsurf (`.windsurfrules`). Format and limits per tool. |

---

## Suggested reading order

1. **First-time setup**  
   [CLI.md](CLI.md) → [what-install.md](what-install.md) (sections 1, 2, 6, 7)

2. **When asking the AI to do work**  
   [request-guide.md](request-guide.md) (request principles, per-preset tips, template/spec examples)

3. **Day-to-day development and review**  
   [system.core.md](system.core.md), [review.md](review.md), [rules-by-platform.md](rules-by-platform.md)

4. **Changing config or adding presets/platforms**  
   [what-install.md](what-install.md) (sections 2–6)

5. **Using a specific AI tool (Cursor, Codex, Windsurf, etc.)**  
   [rules-by-tool.md](rules-by-tool.md) (where each tool loads rules and how to align with prompt-guide)

---

## YAML source mapping

| Markdown doc | YAML source | Key used by tools |
|--------------|-------------|-------------------|
| system.core.md | prompts/system.core.yml | `prompt` |
| review.md | prompts/review.yml | `prompt` |
| rules-by-platform.md | prompts/rules.by-platform.yml | `platforms.<name>.prompt` |

Tools read the corresponding key from the YAML and inject it as system role / prompt.  
The Markdown docs are **human-friendly summaries** of the same content.
