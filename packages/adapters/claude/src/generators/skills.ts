import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateSkills(config: PromptGuideConfig): GeneratedFile[] {
  return config.context.skills.map((skill) => {
    const frontmatterLines = [
      "---",
      `name: ${skill.name}`,
      `description: ${skill.description.trim().split("\n").join(" ")}`,
    ];

    if (skill.allowed_tools.length) {
      frontmatterLines.push(`allowed-tools: ${skill.allowed_tools.join(", ")}`);
    }

    if (!skill.auto_invoke) {
      frontmatterLines.push("disable-model-invocation: true");
    }

    frontmatterLines.push("---");

    return {
      path: `.claude/skills/${skill.name}/SKILL.md`,
      content: `${frontmatterLines.join("\n")}\n\n${skill.prompt.trim()}`,
    };
  });
}
