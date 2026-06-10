import type { GeneratedFile } from "@prompt-guide/adapters";
import type { Agent, PromptGuideConfig } from "@prompt-guide/schema";

function renderAgentFrontmatter(agent: Agent): string {
  const lines = [
    "---",
    `name: ${agent.name}`,
    `description: ${agent.description}`,
  ];

  if (agent.tools.length) {
    lines.push(`tools: ${agent.tools.join(", ")}`);
  }

  if (agent.disallowed_tools.length) {
    lines.push(`disallowedTools: ${agent.disallowed_tools.join(", ")}`);
  }

  if (agent.model) {
    lines.push(`model: ${agent.model}`);
  }

  if (agent.permission_mode) {
    lines.push(`permissionMode: ${agent.permission_mode}`);
  }

  if (agent.max_turns !== undefined) {
    lines.push(`maxTurns: ${agent.max_turns}`);
  }

  if (agent.skills.length) {
    lines.push(`skills: ${agent.skills.join(", ")}`);
  }

  if (agent.memory) {
    lines.push(`memory: ${agent.memory}`);
  }

  if (agent.background) {
    lines.push("background: true");
  }

  if (agent.color) {
    lines.push(`color: ${agent.color}`);
  }

  if (agent.isolation) {
    lines.push(`isolation: ${agent.isolation}`);
  }

  lines.push("---");
  return lines.join("\n");
}

export function generateAgents(config: PromptGuideConfig): GeneratedFile[] {
  return config.context.agents.map((agent) => ({
    path: `.claude/agents/${agent.name}.md`,
    content: `${renderAgentFrontmatter(agent)}\n\n${agent.prompt.trim()}`,
  }));
}
