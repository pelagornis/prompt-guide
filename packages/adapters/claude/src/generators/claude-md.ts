import type { GeneratedFile } from "@pelagornis/prompt-guide-adapters";
import type { PromptGuideConfig } from "@pelagornis/prompt-guide-schema";

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
    lines.push("\n## Skills");
    lines.push(
      "Agent Skills (agentskills.io) in `.claude/skills/` and `.agents/skills/`.",
    );
    lines.push(
      "Invoke manually with `/skill-name` or let Claude match by description.",
    );
    for (const s of context.skills) {
      const mode = s.auto_invoke ? "auto" : "manual";
      lines.push(
        `- \`${s.name}\` (${mode}) — ${s.description.split("\n")[0]}`,
      );
    }
  }

  if (context.agents.length) {
    lines.push("\n## Subagents");
    lines.push(
      "Custom subagents in `.claude/agents/`. Claude delegates by each agent's `description`.",
    );
    lines.push(
      "Built-in subagents (Explore, Plan, general-purpose) are always available.",
    );
    for (const agent of context.agents) {
      const model = agent.model ? `, model: ${agent.model}` : "";
      lines.push(
        `- \`${agent.name}\`${model} — ${agent.description.split("\n")[0]}`,
      );
    }
    lines.push(
      "\nPolicy: Prefer subagents for read-heavy exploration and dedicated reviews to keep the main thread lean.",
    );
  }

  return [{ path: "CLAUDE.md", content: lines.join("\n") }];
}
