import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateClaudeMd(config: PromptGuideConfig): GeneratedFile[] {
  const { project, context } = config;
  const lines: string[] = [];

  lines.push(`# ${project.name}`);
  if (project.description) lines.push(`\n${project.description}`);
  if (context.summary) lines.push(`\n${context.summary}`);

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
    lines.push("\n## Path rules");
    for (const rule of context.path_rules) {
      lines.push(
        `- @.claude/rules/${rule.name}.md — \`${rule.path.join(", ")}\``,
      );
    }
  }

  if (context.skills.length) {
    lines.push("\n## Slash commands");
    for (const s of context.skills) {
      lines.push(
        `- /${s.name} — ${s.description.split("\n")[0]} (see \`.agents/skills/${s.name}/SKILL.md\`)`,
      );
    }
  }

  return [{ path: "CLAUDE.md", content: lines.join("\n") }];
}
