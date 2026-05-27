import { readFile, writeFile } from "node:fs/promises";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import yaml from "js-yaml";

export const addRuleCommand = defineCommand({
  meta: { description: "새 path rule 추가" },
  async run() {
    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "Rule 이름 (kebab-case)",
            placeholder: "swift-ui",
          }),
        path: () =>
          p.text({
            message: "glob 패턴 (쉼표 구분)",
            placeholder: "**/*.swift",
          }),
        description: () =>
          p.text({
            message: "설명 (선택)",
            placeholder: "Swift 파일 작업 규칙",
          }),
        content: () =>
          p.text({
            message: "규칙 내용",
            placeholder: "- async/await 사용",
          }),
      },
      { onCancel: () => process.exit(0) },
    );

    const raw = await readFile("prompt-guide.yml", "utf-8");
    const config = yaml.load(raw) as {
      context: { path_rules: unknown[] };
    };
    config.context.path_rules = config.context.path_rules ?? [];
    config.context.path_rules.push({
      name: answers.name,
      path: String(answers.path)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      ...(answers.description ? { description: answers.description } : {}),
      content: answers.content,
    });

    await writeFile(
      "prompt-guide.yml",
      yaml.dump(config, { lineWidth: 80 }),
      "utf-8",
    );
    p.log.success(
      `rule '${answers.name}' 추가됨. \`prompt-guide sync\` 로 반영하세요.`,
    );
  },
});
