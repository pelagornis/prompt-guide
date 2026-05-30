import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateRulesMdc(config: PromptGuideConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const { context } = config;
  const alwaysApplyNames = context.cursor.always_apply_rules;

  const coreFrontmatter = ["---", "alwaysApply: true", "---"].join("\n");
  const coreBody = [
    "# Core rules",
    "",
    "## Execution principles",
    "- Validate assumptions before acting. Read existing code first.",
    "- Minimal change principle. Reuse before implementing.",
    "- Present a plan before changes; proceed after confirmation.",
    "",
  ];

  if (context.forbidden.length) {
    coreBody.push("## Forbidden");
    for (const f of context.forbidden) {
      coreBody.push(`- ${f}`);
    }
  }

  files.push({
    path: ".cursor/rules/core.mdc",
    content: `${coreFrontmatter}\n\n${coreBody.join("\n")}`,
  });

  for (const rule of context.path_rules) {
    const isAlways = alwaysApplyNames.includes(rule.name);
    const frontmatterLines = ["---"];

    if (isAlways) {
      frontmatterLines.push("alwaysApply: true");
    } else {
      frontmatterLines.push("alwaysApply: false");
      if (rule.description) {
        frontmatterLines.push(`description: ${rule.description}`);
      }
      frontmatterLines.push(
        `globs: [${rule.path.map((p) => `"${p}"`).join(", ")}]`,
      );
    }
    frontmatterLines.push("---");

    files.push({
      path: `.cursor/rules/${rule.name}.mdc`,
      content: `${frontmatterLines.join("\n")}\n\n${rule.content.trim()}`,
    });
  }

  for (const skill of context.skills) {
    const frontmatter = [
      "---",
      `description: ${skill.description.trim().split("\n").join(" ")}`,
      "alwaysApply: false",
      "---",
    ].join("\n");

    files.push({
      path: `.cursor/rules/skill-${skill.name}.mdc`,
      content: `${frontmatter}\n\n${skill.prompt.trim()}`,
    });
  }

  return files;
}
