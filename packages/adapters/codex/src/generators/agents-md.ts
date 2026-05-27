import type { GeneratedFile } from "@prompt-guide/adapters";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export function generateAgentsMd(config: PromptGuideConfig): GeneratedFile[] {
  const { project, context } = config;
  const lines: string[] = [];

  lines.push(`# AGENTS.md — ${project.name}`);
  if (project.description) lines.push(`\n${project.description}`);

  if (context.tech_stack.length) {
    lines.push(
      `\n## 기술 스택\n${context.tech_stack.map((t) => `- ${t}`).join("\n")}`,
    );
  }

  if (context.summary) {
    lines.push(`\n## 개요\n${context.summary}`);
  }

  if (context.forbidden.length) {
    lines.push(
      `\n## 절대 금지\n${context.forbidden.map((f) => `- ${f}`).join("\n")}`,
    );
  }

  if (context.path_rules.length) {
    lines.push("\n## 파일 타입별 규칙");
    for (const rule of context.path_rules) {
      lines.push(`\n### ${rule.name} (\`${rule.path.join(", ")}\`)`);
      lines.push(rule.content.trim());
    }
  }

  if (context.skills.length) {
    lines.push("\n## 반복 워크플로우");
    for (const s of context.skills) {
      lines.push(`\n### ${s.name}\n${s.prompt.trim()}`);
    }
  }

  return [{ path: "AGENTS.md", content: lines.join("\n") }];
}
