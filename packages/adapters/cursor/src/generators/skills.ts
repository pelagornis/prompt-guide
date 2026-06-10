import { renderSkillMd } from "@pelagornis/prompt-guide-adapters";
import type { GeneratedFile } from "@pelagornis/prompt-guide-adapters";
import type { PromptGuideConfig } from "@pelagornis/prompt-guide-schema";

/** Cursor discovers skills from .cursor/skills/ (also reads .agents/skills/) */
export function generateCursorSkills(
  config: PromptGuideConfig,
): GeneratedFile[] {
  return config.context.skills.map((skill) => ({
    path: `.cursor/skills/${skill.name}/SKILL.md`,
    content: renderSkillMd(skill),
  }));
}
