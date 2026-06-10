import {
  PromptGuideConfigSchema,
  type PromptGuideConfig,
} from "@pelagornis/prompt-guide-schema";
import { err, ok, type Result } from "neverthrow";

export type ValidationError = { issues: string[] };

export function validateConfig(
  config: unknown,
): Result<PromptGuideConfig, ValidationError> {
  const parsed = PromptGuideConfigSchema.safeParse(config);
  if (!parsed.success) {
    return err({
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    });
  }
  return ok(parsed.data);
}
