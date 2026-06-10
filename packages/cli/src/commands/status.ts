import { ClaudeAdapter } from "@pelagornis/prompt-guide-adapter-claude";
import { CodexAdapter } from "@pelagornis/prompt-guide-adapter-codex";
import { CursorAdapter } from "@pelagornis/prompt-guide-adapter-cursor";
import { resolveConfig } from "@pelagornis/prompt-guide-core";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";

export const statusCommand = defineCommand({
  meta: { description: "Show status of generated files" },
  async run() {
    const configResult = await resolveConfig(process.cwd());
    if (configResult.isErr()) {
      p.log.error("Failed to load prompt-guide.yml");
      process.exit(1);
    }

    const config = configResult.value;
    const adapters = [
      ...(config.tools.claude_code ? [new ClaudeAdapter()] : []),
      ...(config.tools.codex ? [new CodexAdapter()] : []),
      ...(config.tools.cursor ? [new CursorAdapter()] : []),
    ];

    p.intro(`Project: ${config.project.name}`);

    for (const adapter of adapters) {
      const diffs = await adapter.diff(config, process.cwd());
      const created = diffs.filter((d) => d.status === "created").length;
      const updated = diffs.filter((d) => d.status === "updated").length;
      const unchanged = diffs.filter((d) => d.status === "unchanged").length;

      p.log.info(
        `[${adapter.name}] to create ${created} · to update ${updated} · unchanged ${unchanged}`,
      );
    }

    p.outro("Run `prompt-guide diff` for details");
  },
});
