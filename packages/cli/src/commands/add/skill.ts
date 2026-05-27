import { readFile, writeFile } from "node:fs/promises";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import yaml from "js-yaml";

export const addSkillCommand = defineCommand({
  meta: { description: "새 skill 추가" },
  async run() {
    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "Skill 이름 (kebab-case)",
            placeholder: "generate-view",
          }),
        description: () =>
          p.text({
            message: "설명 (언제 자동 활성화되는지)",
            placeholder: "SwiftUI 뷰 생성",
          }),
        auto_invoke: () =>
          p.confirm({
            message: "파일 관련 작업 시 자동 활성화?",
            initialValue: false,
          }),
        prompt: () =>
          p.text({ message: "지침 내용", placeholder: "1. ... 2. ..." }),
      },
      { onCancel: () => process.exit(0) },
    );

    const raw = await readFile("prompt-guide.yml", "utf-8");
    const config = yaml.load(raw) as {
      context: { skills: unknown[] };
    };
    config.context.skills = config.context.skills ?? [];
    config.context.skills.push({
      name: answers.name,
      description: answers.description,
      allowed_tools: [],
      auto_invoke: answers.auto_invoke,
      prompt: answers.prompt,
    });

    await writeFile(
      "prompt-guide.yml",
      yaml.dump(config, { lineWidth: 80 }),
      "utf-8",
    );
    p.log.success(
      `skill '${answers.name}' 추가됨. \`prompt-guide sync\` 로 반영하세요.`,
    );
  },
});
