import type { GeneratedFile } from "./interface.js";
import type { PromptGuideConfig, Skill } from "@prompt-guide/schema";

export type SkillRenderOptions = {
  /** Claude Code-only frontmatter fields */
  claude?: boolean;
};

/** Agent Skills open standard (agentskills.io) — space-separated allowed-tools */
export function renderSkillMd(
  skill: Skill,
  options: SkillRenderOptions = {},
): string {
  const frontmatterLines = [
    "---",
    `name: ${skill.name}`,
    `description: ${skill.description.trim().split("\n").join(" ")}`,
  ];

  if (skill.allowed_tools.length) {
    frontmatterLines.push(`allowed-tools: ${skill.allowed_tools.join(" ")}`);
  }

  if (options.claude && !skill.auto_invoke) {
    frontmatterLines.push("disable-model-invocation: true");
  }

  frontmatterLines.push("---");

  return `${frontmatterLines.join("\n")}\n\n${skill.prompt.trim()}`;
}

/** Cross-tool Agent Skills paths (project + user home) */
export function generateSharedSkillFiles(
  config: PromptGuideConfig,
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  for (const skill of config.context.skills) {
    const content = renderSkillMd(skill);

    files.push({
      path: `.agents/skills/${skill.name}/SKILL.md`,
      content,
    });

    files.push({
      path: `~/.agents/skills/${skill.name}/SKILL.md`,
      content,
    });
  }

  return files;
}
