import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  Adapter,
  AdapterError,
  FileDiff,
  GeneratedFile,
} from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";
import { err, ok, type Result } from "neverthrow";
import { generateAgents } from "./generators/agents.js";
import { generateClaudeMd } from "./generators/claude-md.js";
import { generateMcpJson } from "./generators/mcp-json.js";
import { generateRules } from "./generators/rules.js";
import { generateSettingsJson } from "./generators/settings-json.js";
import { generateSkills } from "./generators/skills.js";

const BLOCK_DANGEROUS_HOOK = `#!/bin/bash
# Block dangerous commands hook
COMMAND="$BASH_COMMAND"
if echo "$COMMAND" | grep -qE "rm -rf|DROP TABLE|format C:"; then
  echo "Blocked: dangerous command detected - $COMMAND"
  exit 2
fi`;

export class ClaudeAdapter implements Adapter {
  readonly name = "claude";

  async generate(
    config: PromptGuideConfig,
  ): Promise<Result<GeneratedFile[], AdapterError>> {
    try {
      const files: GeneratedFile[] = [
        ...generateClaudeMd(config),
        ...generateSettingsJson(config),
        ...generateRules(config),
        ...generateAgents(config),
        ...generateSkills(config),
        ...generateMcpJson(config),
        {
          path: ".claude/hooks/block-dangerous.sh",
          skipIfExists: true,
          content: BLOCK_DANGEROUS_HOOK,
        },
      ];
      return ok(files);
    } catch (e) {
      return err({ adapter: this.name, message: String(e) });
    }
  }

  validate(config: PromptGuideConfig): Result<void, string[]> {
    const errors: string[] = [];
    if (!config.project.name) errors.push("project.name is required");

    const summaryTokens = (config.context.summary ?? "").length / 4;
    if (summaryTokens > 375) {
      errors.push(
        `context.summary is too long (≈${Math.round(summaryTokens)} tokens, recommended ≤375)`,
      );
    }

    return errors.length ? err(errors) : ok(undefined);
  }

  async diff(
    config: PromptGuideConfig,
    projectRoot: string,
  ): Promise<FileDiff[]> {
    const generated = await this.generate(config);
    if (generated.isErr()) return [];

    return Promise.all(
      generated.value.map(async (file) => {
        try {
          const existing = await readFile(
            join(projectRoot, file.path),
            "utf-8",
          );
          return {
            path: file.path,
            status: existing === file.content ? "unchanged" : "updated",
          } as FileDiff;
        } catch {
          return { path: file.path, status: "created" } as FileDiff;
        }
      }),
    );
  }
}
