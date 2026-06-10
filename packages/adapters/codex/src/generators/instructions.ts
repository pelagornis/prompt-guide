import type { GeneratedFile } from "@pelagornis/prompt-guide-adapters";
import type { PromptGuideConfig } from "@pelagornis/prompt-guide-schema";

/** Path-scoped instruction files (progressive disclosure for Codex) */
export function generateInstructionFiles(
  config: PromptGuideConfig,
): GeneratedFile[] {
  return config.context.path_rules.map((rule) => ({
    path: `.codex/instructions/${rule.name}.md`,
    content: [
      `# ${rule.name}`,
      "",
      rule.description ? `${rule.description}\n` : "",
      `Applies to: \`${rule.path.join("`, `")}\``,
      "",
      rule.content.trim(),
    ].join("\n"),
  }));
}
