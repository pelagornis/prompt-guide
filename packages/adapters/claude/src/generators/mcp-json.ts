import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateMcpJson(config: PromptGuideConfig): GeneratedFile[] {
  if (!config.context.mcp_servers.length) return [];

  const servers: Record<string, unknown> = {};

  for (const server of config.context.mcp_servers) {
    if (server.type === "http" && server.url) {
      servers[server.name] = {
        type: "http",
        url: server.url,
        ...(server.auth_env
          ? {
              headers: {
                Authorization: `Bearer \${${server.auth_env}}`,
              },
            }
          : {}),
      };
    } else if (server.type === "stdio" && server.command) {
      servers[server.name] = {
        type: "stdio",
        command: server.command,
      };
    }
  }

  return [
    {
      path: ".claude/.mcp.json",
      content: JSON.stringify({ mcpServers: servers }, null, 2),
    },
  ];
}
