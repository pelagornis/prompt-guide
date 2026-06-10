import { resolveConfig } from "@pelagornis/prompt-guide-core";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";

export const validateCommand = defineCommand({
  meta: { description: "Validate prompt-guide.yml" },
  async run() {
    const result = await resolveConfig(process.cwd());
    if (result.isErr()) {
      if (result.error.type === "VALIDATION_ERROR") {
        for (const issue of result.error.issues) {
          p.log.error(issue);
        }
      } else {
        p.log.error(`Validation failed: ${result.error.type}`);
      }
      process.exit(1);
    }
    p.log.success("Configuration is valid.");
  },
});
