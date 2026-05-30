import { readFile, writeFile } from "node:fs/promises";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import yaml from "js-yaml";

export const addSkillCommand = defineCommand({
  meta: { description: "Add a new skill" },
  async run() {
    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "Skill name (kebab-case)",
            placeholder: "generate-view",
          }),
        description: () =>
          p.text({
            message: "Description (when it auto-invokes)",
            placeholder: "Create SwiftUI view",
          }),
        auto_invoke: () =>
          p.confirm({
            message: "Auto-invoke for file-related tasks?",
            initialValue: false,
          }),
        prompt: () =>
          p.text({ message: "Instructions", placeholder: "1. ... 2. ..." }),
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
      `Added skill '${answers.name}'. Run \`prompt-guide sync\` to apply.`,
    );
  },
});
