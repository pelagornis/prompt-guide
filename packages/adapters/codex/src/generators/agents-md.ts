import type { GeneratedFile } from "@pelagornis/prompt-guide-adapters";
import type { PromptGuideConfig } from "@pelagornis/prompt-guide-schema";

/** Lean root AGENTS.md — shared by Codex and Cursor; details in linked files */
export function generateAgentsMd(config: PromptGuideConfig): GeneratedFile[] {
  const { project, context, tools } = config;
  const lines: string[] = [];

  lines.push(`# AGENTS.md — ${project.name}`);
  if (project.description) lines.push(`\n${project.description}`);

  if (context.summary) {
    lines.push(`\n## Overview\n${context.summary}`);
  }

  if (context.tech_stack.length) {
    lines.push(
      `\n## Tech stack\n${context.tech_stack.map((t) => `- ${t}`).join("\n")}`,
    );
  }

  if (context.forbidden.length) {
    lines.push(
      `\n## Forbidden\n${context.forbidden.map((f) => `- ${f}`).join("\n")}`,
    );
  }

  if (context.path_rules.length) {
    lines.push("\n## Path-scoped rules");
    if (tools.codex) {
      lines.push(
        "Codex loads `.codex/instructions/*.md` via project doc discovery (root → cwd):",
      );
      for (const rule of context.path_rules) {
        lines.push(
          `- \`.codex/instructions/${rule.name}.md\` — \`${rule.path.join(", ")}\``,
        );
      }
    }
    if (tools.cursor) {
      lines.push(
        "Cursor loads `.cursor/rules/*.mdc` (alwaysApply or globs):",
      );
      for (const rule of context.path_rules) {
        lines.push(
          `- \`.cursor/rules/${rule.name}.mdc\` — \`${rule.path.join(", ")}\``,
        );
      }
    }
  }

  if (context.skills.length) {
    lines.push("\n## Agent Skills");
    lines.push(
      "Cross-tool workflows (Agent Skills open standard). Codex discovers `.agents/skills/` from cwd up to repo root; Cursor also reads `.cursor/skills/` and `~/.cursor/skills/`.",
    );
    lines.push(
      "Invoke explicitly with `$skill-name` (Codex) or `/skill-name` (Cursor).",
    );
    for (const s of context.skills) {
      const scope = s.paths.length
        ? ` (paths: ${s.paths.join(", ")})`
        : "";
      lines.push(
        `- \`.agents/skills/${s.name}/SKILL.md\`${scope} — ${s.description.split("\n")[0]}`,
      );
    }
  }

  if (context.agents.length && tools.claude_code) {
    lines.push("\n## Claude Code subagents");
    lines.push(
      "Claude-only specialists in `.claude/agents/`. Not loaded by Codex or Cursor.",
    );
    for (const agent of context.agents) {
      lines.push(
        `- \`.claude/agents/${agent.name}.md\` — ${agent.description.split("\n")[0]}`,
      );
    }
  }

  return [{ path: "AGENTS.md", content: lines.join("\n") }];
}
