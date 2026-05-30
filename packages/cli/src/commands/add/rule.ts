import { readFile, writeFile } from "node:fs/promises";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import yaml from "js-yaml";

export const addRuleCommand = defineCommand({
  meta: { description: "Add a new path rule" },
  async run() {
    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "Rule name (kebab-case)",
            placeholder: "swift-ui",
          }),
        path: () =>
          p.text({
            message: "Glob patterns (comma-separated)",
            placeholder: "**/*.swift",
          }),
        description: () =>
          p.text({
            message: "Description (optional)",
            placeholder: "Swift file rules",
          }),
        content: () =>
          p.text({
            message: "Rule content",
            placeholder: "- Use async/await",
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
      `Added rule '${answers.name}'. Run \`prompt-guide sync\` to apply.`,
    );
  },
});
