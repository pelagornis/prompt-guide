import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateAgentsMd(config: PromptGuideConfig): GeneratedFile[] {
  const { project, context } = config;
  const lines: string[] = [];

  lines.push(`# AGENTS.md — ${project.name}`);
  if (project.description) lines.push(`\n${project.description}`);

  if (context.tech_stack.length) {
    lines.push(
      `\n## Tech stack\n${context.tech_stack.map((t) => `- ${t}`).join("\n")}`,
    );
  }

  if (context.summary) {
    lines.push(`\n## Overview\n${context.summary}`);
  }

  if (context.forbidden.length) {
    lines.push(
      `\n## Forbidden\n${context.forbidden.map((f) => `- ${f}`).join("\n")}`,
    );
  }

  if (context.path_rules.length) {
    lines.push("\n## Rules by file type");
    for (const rule of context.path_rules) {
      lines.push(`\n### ${rule.name} (\`${rule.path.join(", ")}\`)`);
      lines.push(rule.content.trim());
    }
  }

  if (context.skills.length) {
    lines.push("\n## Recurring workflows");
    for (const s of context.skills) {
      lines.push(`\n### ${s.name}\n${s.prompt.trim()}`);
    }
  }

  return [{ path: "AGENTS.md", content: lines.join("\n") }];
}
