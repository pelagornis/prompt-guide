import type { GeneratedFile } from "./interface.js";
import type { PromptGuideConfig, Skill } from "@prompt-guide/schema";

export type SkillRenderOptions = {
  /** @deprecated All targets now use the same Agent Skills frontmatter */
  claude?: boolean;
};

function yamlScalar(value: string): string {
  if (/[:#\n'"&*!?|>@[\]{},]/.test(value) || value.trim() !== value) {
    return JSON.stringify(value);
  }
  return value;
}

/** Agent Skills open standard (agentskills.io) + Cursor paths / disable-model-invocation */
export function renderSkillMd(
  skill: Skill,
  _options: SkillRenderOptions = {},
): string {
  const frontmatterLines = [
    "---",
    `name: ${skill.name}`,
    `description: ${yamlScalar(skill.description.trim().split("\n").join(" "))}`,
  ];

  if (skill.allowed_tools.length) {
    frontmatterLines.push(`allowed-tools: ${skill.allowed_tools.join(" ")}`);
  }

  if (skill.paths.length) {
    frontmatterLines.push("paths:");
    for (const pattern of skill.paths) {
      frontmatterLines.push(`  - ${yamlScalar(pattern)}`);
    }
  }

  if (skill.license) {
    frontmatterLines.push(`license: ${yamlScalar(skill.license)}`);
  }

  if (skill.compatibility) {
    frontmatterLines.push(`compatibility: ${yamlScalar(skill.compatibility)}`);
  }

  if (skill.metadata && Object.keys(skill.metadata).length) {
    frontmatterLines.push("metadata:");
    for (const [key, value] of Object.entries(skill.metadata)) {
      frontmatterLines.push(`  ${key}: ${yamlScalar(value)}`);
    }
  }

  if (!skill.auto_invoke) {
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

    files.push({
      path: `~/.cursor/skills/${skill.name}/SKILL.md`,
      content,
    });
  }

  return files;
}
