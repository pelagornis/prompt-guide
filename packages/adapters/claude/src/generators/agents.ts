import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateAgents(config: PromptGuideConfig): GeneratedFile[] {
  return config.context.agents.map((agent) => {
    const frontmatter = [
      "---",
      `name: ${agent.name}`,
      `description: ${agent.description}`,
      `tools: ${agent.tools.join(", ")}`,
      "---",
    ].join("\n");

    return {
      path: `.claude/agents/${agent.name}.md`,
      content: `${frontmatter}\n\n${agent.prompt.trim()}`,
    };
  });
}
