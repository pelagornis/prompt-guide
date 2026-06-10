import { deepmerge } from "deepmerge-ts";
import type { PromptGuideConfig } from "@pelagornis/prompt-guide-schema";

export function mergeWithDefaults(
  local: PromptGuideConfig,
  typeDefaults: Partial<PromptGuideConfig>,
): PromptGuideConfig {
  return deepmerge(typeDefaults, local) as PromptGuideConfig;
}
