import { renderSkillMd } from "@prompt-guide/adapters";
import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateCursorSkills(
  config: PromptGuideConfig,
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  for (const skill of config.context.skills) {
    files.push({
      path: `.cursor/skills/${skill.name}/SKILL.md`,
      content: renderSkillMd(skill),
    });

    const frontmatter = [
      "---",
      `description: ${skill.description.trim().split("\n").join(" ")}`,
      "alwaysApply: false",
      "---",
    ].join("\n");

    files.push({
      path: `.cursor/rules/skill-${skill.name}.mdc`,
      content: `${frontmatter}\n\nFollow the Agent Skill at \`.cursor/skills/${skill.name}/SKILL.md\`.`,
    });
  }

  return files;
}
