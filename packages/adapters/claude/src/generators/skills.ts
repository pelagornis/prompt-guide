import { renderSkillMd } from "@pelagornis/prompt-guide-adapters";
import type { GeneratedFile } from "@pelagornis/prompt-guide-adapters";
import type { PromptGuideConfig } from "@pelagornis/prompt-guide-schema";

export function generateSkills(config: PromptGuideConfig): GeneratedFile[] {
  return config.context.skills.map((skill) => ({
    path: `.claude/skills/${skill.name}/SKILL.md`,
    content: renderSkillMd(skill),
  }));
}
