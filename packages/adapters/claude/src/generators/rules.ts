import type { GeneratedFile } from "@pelagornis/prompt-guide-adapters";
import type { PromptGuideConfig } from "@pelagornis/prompt-guide-schema";

export function generateRules(config: PromptGuideConfig): GeneratedFile[] {
  return config.context.path_rules.map((rule) => {
    const frontmatter = [
      "---",
      `path: [${rule.path.map((p) => `"${p}"`).join(", ")}]`,
      "---",
    ].join("\n");

    return {
      path: `.claude/rules/${rule.name}.md`,
      content: `${frontmatter}\n\n${rule.content.trim()}`,
    };
  });
}
