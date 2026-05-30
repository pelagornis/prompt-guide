import { ClaudeAdapter } from "@prompt-guide/adapter-claude";
import { CodexAdapter } from "@prompt-guide/adapter-codex";
import { CursorAdapter } from "@prompt-guide/adapter-cursor";
import { resolveConfig } from "@prompt-guide/core";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";

const icons = {
  created: "✚",
  updated: "~",
  unchanged: "·",
  deleted: "✖",
} as const;

export const diffCommand = defineCommand({
  meta: { description: "Preview files that would change" },
  async run() {
    const configResult = await resolveConfig(process.cwd());
    if (configResult.isErr()) {
      p.log.error("Failed to load configuration");
      process.exit(1);
    }

    const config = configResult.value;
    const adapters = [
      ...(config.tools.claude_code ? [new ClaudeAdapter()] : []),
      ...(config.tools.codex ? [new CodexAdapter()] : []),
      ...(config.tools.cursor ? [new CursorAdapter()] : []),
    ];

    for (const adapter of adapters) {
      const diffs = await adapter.diff(config, process.cwd());
      for (const d of diffs) {
        p.log.info(`${icons[d.status]} ${d.path}`);
      }
    }
  },
});
