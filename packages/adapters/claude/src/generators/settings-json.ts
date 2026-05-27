import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateSettingsJson(
  config: PromptGuideConfig,
): GeneratedFile[] {
  const { context } = config;
  const hooks: Record<string, unknown[]> = {};

  if (context.hooks.post_write.length) {
    hooks.PostToolUse = context.hooks.post_write.map((h) => ({
      matcher: h.matcher,
      hooks: [{ type: "command", command: h.command, timeout: h.timeout }],
    }));
  }

  if (context.hooks.pre_bash.length) {
    hooks.PreToolUse = context.hooks.pre_bash.map((h) => ({
      matcher: h.matcher,
      hooks: [{ type: "command", command: h.command, timeout: h.timeout }],
    }));
  }

  const settings = {
    permissions: {
      allow: ["Bash", "Read", "Write"],
      deny: [] as string[],
    },
    hooks,
  };

  return [
    {
      path: ".claude/settings.json",
      content: JSON.stringify(settings, null, 2),
    },
  ];
}
