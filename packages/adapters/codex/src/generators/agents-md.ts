import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

/** Lean root AGENTS.md — details live in linked instruction and skill files */
export function generateAgentsMd(config: PromptGuideConfig): GeneratedFile[] {
  const { project, context } = config;
  const lines: string[] = [];

  lines.push(`# AGENTS.md — ${project.name}`);
  if (project.description) lines.push(`\n${project.description}`);

  if (context.summary) {
    lines.push(`\n## Overview\n${context.summary}`);
  }

  if (context.tech_stack.length) {
    lines.push(
      `\n## Tech stack\n${context.tech_stack.map((t) => `- ${t}`).join("\n")}`,
    );
  }

  if (context.forbidden.length) {
    lines.push(
      `\n## Forbidden\n${context.forbidden.map((f) => `- ${f}`).join("\n")}`,
    );
  }

  if (context.path_rules.length) {
    lines.push("\n## Path-scoped rules");
    lines.push(
      "Detailed rules load from `.codex/instructions/` (see Codex project doc discovery):",
    );
    for (const rule of context.path_rules) {
      lines.push(
        `- \`.codex/instructions/${rule.name}.md\` — \`${rule.path.join(", ")}\``,
      );
    }
  }

  if (context.skills.length) {
    lines.push("\n## Skills");
    lines.push(
      "Workflows follow the Agent Skills standard in `.agents/skills/` (shared with Claude Code and Cursor):",
    );
    for (const s of context.skills) {
      lines.push(`- \`.agents/skills/${s.name}/SKILL.md\` — ${s.description.split("\n")[0]}`);
    }
  }

  return [{ path: "AGENTS.md", content: lines.join("\n") }];
}
