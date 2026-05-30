import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateConfigTomlGuide(
  config: PromptGuideConfig,
): GeneratedFile[] {
  const lines: string[] = [
    "# Codex global configuration guide",
    "",
    "Add the following to `~/.codex/config.toml`:",
    "",
    "```toml",
    'model = "gpt-5.4"',
    'sandbox_mode = "workspace-write"',
    'approval_mode = "on-request"',
    "",
    "project_doc_max_bytes = 65536",
    "",
  ];

  for (const server of config.context.mcp_servers) {
    if (server.type === "http" && server.url) {
      lines.push(`[mcp.${server.name}]`);
      lines.push("type = \"http\"");
      lines.push(`url = "${server.url}"`);
      if (server.auth_env) {
        lines.push(`[mcp.${server.name}.headers]`);
        lines.push(`Authorization = "Bearer \${${server.auth_env}}"`);
      }
      lines.push("");
    }
  }

  lines.push("```");
  lines.push("");
  lines.push(
    "> Store skills in `~/.agents/skills/` to share between Codex and Claude Code",
  );

  return [{ path: ".codex-setup.md", content: lines.join("\n") }];
}
