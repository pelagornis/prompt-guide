import { access } from "node:fs/promises";
import { ClaudeAdapter } from "@prompt-guide/adapter-claude";
import { CodexAdapter } from "@prompt-guide/adapter-codex";
import { CursorAdapter } from "@prompt-guide/adapter-cursor";
import { resolveConfig } from "@prompt-guide/core";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { resolveGeneratedPath } from "../lib/write-files.js";

async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await access(resolveGeneratedPath(relativePath));
    return true;
  } catch {
    return false;
  }
}

export const doctorCommand = defineCommand({
  meta: { description: "Diagnose prompt-guide setup and generated files" },
  async run() {
    p.intro("prompt-guide doctor");

    const configResult = await resolveConfig(process.cwd());
    if (configResult.isErr()) {
      if (configResult.error.type === "NOT_FOUND") {
        p.log.error("prompt-guide.yml not found. Run `prompt-guide init` first.");
      } else if (configResult.error.type === "VALIDATION_ERROR") {
        p.log.error("Configuration validation failed:");
        for (const issue of configResult.error.issues) {
          p.log.error(`  ${issue}`);
        }
      } else {
        p.log.error(`Failed to load config: ${configResult.error.type}`);
      }
      process.exit(1);
    }

    const config = configResult.value;
    let issues = 0;
    let warnings = 0;

    p.log.info(`Project: ${config.project.name} (${config.project.type})`);

    const enabledTools = [
      config.tools.claude_code && "claude",
      config.tools.codex && "codex",
      config.tools.cursor && "cursor",
    ].filter(Boolean);

    if (!enabledTools.length) {
      p.log.warn("No tools enabled in tools: section");
      warnings++;
    } else {
      p.log.success(`Tools enabled: ${enabledTools.join(", ")}`);
    }

    const summaryTokens = (config.context.summary ?? "").length / 4;
    if (summaryTokens > 375) {
      p.log.warn(
        `context.summary is long (≈${Math.round(summaryTokens)} tokens, recommended ≤375)`,
      );
      warnings++;
    }

    if (config.tools.claude_code) {
      const adapter = new ClaudeAdapter();
      const validation = adapter.validate(config);
      if (validation.isErr()) {
        for (const e of validation.error) {
          p.log.warn(`claude: ${e}`);
          warnings++;
        }
      }

      for (const path of ["CLAUDE.md", ".claude/settings.json"]) {
        if (await fileExists(path)) {
          p.log.success(`✓ ${path}`);
        } else {
          p.log.error(`✗ ${path} missing — run \`prompt-guide sync\``);
          issues++;
        }
      }

      for (const agent of config.context.agents) {
        const path = `.claude/agents/${agent.name}.md`;
        if (await fileExists(path)) {
          p.log.success(`✓ ${path}`);
        } else {
          p.log.warn(`✗ ${path} missing — run \`prompt-guide sync\``);
          warnings++;
        }
      }
    }

    if (config.tools.codex) {
      for (const path of ["AGENTS.md", ".codex/config.toml"]) {
        if (await fileExists(path)) {
          p.log.success(`✓ ${path}`);
        } else {
          p.log.error(`✗ ${path} missing — run \`prompt-guide sync\``);
          issues++;
        }
      }
    }

    if (config.tools.cursor) {
      if (await fileExists(".cursor/rules/core.mdc")) {
        p.log.success("✓ .cursor/rules/core.mdc");
      } else {
        p.log.error("✗ .cursor/rules/core.mdc missing — run `prompt-guide sync`");
        issues++;
      }
    }

    for (const skill of config.context.skills) {
      const checks = [
        `.agents/skills/${skill.name}/SKILL.md`,
        `~/.agents/skills/${skill.name}/SKILL.md`,
        `~/.cursor/skills/${skill.name}/SKILL.md`,
      ];

      if (config.tools.claude_code) {
        checks.push(`.claude/skills/${skill.name}/SKILL.md`);
      }
      if (config.tools.cursor) {
        checks.push(`.cursor/skills/${skill.name}/SKILL.md`);
      }

      for (const skillPath of checks) {
        const isHome = skillPath.startsWith("~/");
        if (await fileExists(skillPath)) {
          p.log.success(`✓ ${skillPath}`);
        } else if (isHome) {
          p.log.info(`  ${skillPath} not synced yet (created on sync)`);
        } else {
          p.log.warn(`✗ ${skillPath} missing — run \`prompt-guide sync\``);
          warnings++;
        }
      }
    }

    if (issues > 0) {
      p.outro(`${issues} issue(s), ${warnings} warning(s). Run \`prompt-guide sync\`.`);
      process.exit(1);
    }

    if (warnings > 0) {
      p.outro(`${warnings} warning(s). Consider running \`prompt-guide sync\`.`);
      return;
    }

    p.outro("All checks passed.");
  },
});
