import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateRulesMdc(config: PromptGuideConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const { context } = config;
  const alwaysApplyNames = context.cursor.always_apply_rules;

  const coreFrontmatter = ["---", "alwaysApply: true", "---"].join("\n");
  const coreBody = [
    "# 핵심 규칙",
    "",
    "## 실행 원칙",
    "- 동의 전 가정 검증. 기존 코드 먼저 파악.",
    "- 최소 변경 원칙. 재사용 가능 코드 탐색 후 구현.",
    "- 변경 전 계획 제시, 확인 후 진행.",
    "",
  ];

  if (context.forbidden.length) {
    coreBody.push("## 절대 금지");
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
