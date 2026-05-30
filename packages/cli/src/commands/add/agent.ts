import { readFile, writeFile } from "node:fs/promises";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import yaml from "js-yaml";

export const addAgentCommand = defineCommand({
  meta: { description: "Add a new agent" },
  async run() {
    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "Agent name (kebab-case)",
            placeholder: "reviewer",
          }),
        description: () =>
          p.text({
            message: "Description",
            placeholder: "Dedicated code review sub-agent",
          }),
        tools: () =>
          p.text({
            message: "Allowed tools (comma-separated)",
            placeholder: "Read, Bash(git:*)",
          }),
        prompt: () =>
          p.text({
            message: "Instructions",
            placeholder: "Review changed code.",
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
      `Added agent '${answers.name}'. Run \`prompt-guide sync\` to apply.`,
    );
  },
});
