import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  Adapter,
  AdapterError,
  FileDiff,
  GeneratedFile,
} from "@pelagornis/prompt-guide-adapters";
import type { PromptGuideConfig } from "@pelagornis/prompt-guide-schema";
import { err, ok, type Result } from "neverthrow";
import { generateRulesMdc } from "./generators/rules-mdc.js";

export class CursorAdapter implements Adapter {
  readonly name = "cursor";

  async generate(
    config: PromptGuideConfig,
  ): Promise<Result<GeneratedFile[], AdapterError>> {
    try {
      return ok(generateRulesMdc(config));
    } catch (e) {
      return err({ adapter: this.name, message: String(e) });
    }
  }

  validate(config: PromptGuideConfig): Result<void, string[]> {
    const errors: string[] = [];
    if (!config.project.name) errors.push("project.name is required");
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
