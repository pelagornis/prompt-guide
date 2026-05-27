import type { Result } from "neverthrow";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export interface GeneratedFile {
  path: string;
  content: string;
  skipIfExists?: boolean;
}

export interface FileDiff {
  path: string;
  status: "created" | "updated" | "unchanged" | "deleted";
  diff?: string;
}

export interface AdapterError {
  adapter: string;
  message: string;
}

export interface Adapter {
  readonly name: string;
  generate(
    config: PromptGuideConfig,
  ): Promise<Result<GeneratedFile[], AdapterError>>;
  validate(config: PromptGuideConfig): Result<void, string[]>;
  diff(config: PromptGuideConfig, projectRoot: string): Promise<FileDiff[]>;
}
