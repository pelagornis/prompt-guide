import { cosmiconfig } from "cosmiconfig";
import yaml from "js-yaml";
import { err, ok, type Result } from "neverthrow";
import {
  PromptGuideConfigSchema,
  type PromptGuideConfig,
} from "@prompt-guide/schema";

export type ResolveError =
  | { type: "NOT_FOUND" }
  | { type: "PARSE_ERROR"; message: string }
  | { type: "VALIDATION_ERROR"; issues: string[] };

const yamlLoader = (_filepath: string, content: string) => {
  const parsed = yaml.load(content);
  if (parsed === null || parsed === undefined) {
    throw new Error("YAML 파일이 비어 있습니다");
  }
  return parsed;
};

export async function resolveConfig(
  cwd: string,
): Promise<Result<PromptGuideConfig, ResolveError>> {
  const explorer = cosmiconfig("prompt-guide", {
    searchPlaces: [
      "prompt-guide.yml",
      "prompt-guide.yaml",
      ".prompt-guiderc",
      "package.json",
    ],
    loaders: {
      ".yaml": yamlLoader,
      ".yml": yamlLoader,
      ".json": (_filepath, content) => JSON.parse(content),
      noExt: yamlLoader,
    },
  });

  let result: Awaited<ReturnType<typeof explorer.search>>;
  try {
    result = await explorer.search(cwd);
  } catch (e) {
    return err({
      type: "PARSE_ERROR",
      message: e instanceof Error ? e.message : String(e),
    });
  }

  if (!result) return err({ type: "NOT_FOUND" });

  const parsed = PromptGuideConfigSchema.safeParse(result.config);
  if (!parsed.success) {
    return err({
      type: "VALIDATION_ERROR",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    });
  }

  return ok(parsed.data);
}
