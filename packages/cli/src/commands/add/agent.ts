import { readFile, writeFile } from "node:fs/promises";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import yaml from "js-yaml";

export const addAgentCommand = defineCommand({
  meta: { description: "새 agent 추가" },
  async run() {
    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "Agent 이름 (kebab-case)",
            placeholder: "reviewer",
          }),
        description: () =>
          p.text({
            message: "설명",
            placeholder: "코드 리뷰 전담 서브에이전트",
          }),
        tools: () =>
          p.text({
            message: "허용 도구 (쉼표 구분)",
            placeholder: "Read, Bash(git:*)",
          }),
        prompt: () =>
          p.text({
            message: "지침",
            placeholder: "변경된 코드를 리뷰한다.",
          }),
      },
      { onCancel: () => process.exit(0) },
    );

    const raw = await readFile("prompt-guide.yml", "utf-8");
    const config = yaml.load(raw) as {
      context: { agents: unknown[] };
    };
    config.context.agents = config.context.agents ?? [];
    config.context.agents.push({
      name: answers.name,
      description: answers.description,
      tools: String(answers.tools)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      prompt: answers.prompt,
    });

    await writeFile(
      "prompt-guide.yml",
      yaml.dump(config, { lineWidth: 80 }),
      "utf-8",
    );
    p.log.success(
      `agent '${answers.name}' 추가됨. \`prompt-guide sync\` 로 반영하세요.`,
    );
  },
});
