import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ProjectType } from "@prompt-guide/schema";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import yaml from "js-yaml";

const templatesRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../templates",
);

async function loadTypeTemplate(type: ProjectType) {
  try {
    const raw = await readFile(
      join(templatesRoot, type, "prompt-guide.yml"),
      "utf-8",
    );
    return yaml.load(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const initCommand = defineCommand({
  meta: { description: "프로젝트 초기화 (대화형)" },
  async run() {
    p.intro("prompt-guide");

    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "프로젝트 이름",
            placeholder: "my-app",
            validate: (v) => (v.length < 1 ? "필수 입력" : undefined),
          }),
        type: () =>
          p.select({
            message: "프로젝트 타입",
            options: [
              { value: "ios-swift", label: "iOS / Swift" },
              { value: "web-react", label: "Web / React" },
              { value: "web-vue", label: "Web / Vue" },
              { value: "python", label: "Python" },
              { value: "node", label: "Node.js" },
              { value: "custom", label: "Custom" },
            ],
          }),
        tools: () =>
          p.multiselect({
            message: "사용할 AI 툴 (스페이스바로 선택)",
            options: [
              { value: "claude_code", label: "Claude Code", hint: ".claude/" },
              { value: "codex", label: "Codex CLI", hint: "AGENTS.md" },
              { value: "cursor", label: "Cursor", hint: ".cursor/rules/" },
            ],
            initialValues: ["claude_code", "cursor"],
          }),
        tech_stack: () =>
          p.text({
            message: "기술 스택 (쉼표 구분)",
            placeholder: "SwiftUI, AlarmKit, LiveActivity",
          }),
        description: () =>
          p.text({
            message: "프로젝트 설명 (선택)",
            placeholder: "AlarmKit 기반 알람 앱",
          }),
      },
      {
        onCancel: () => {
          p.cancel("취소됨");
          process.exit(0);
        },
      },
    );

    const projectType = answers.type as ProjectType;
    const template = await loadTypeTemplate(projectType);
    const tools = answers.tools as string[];

    const techFromInput = String(answers.tech_stack)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const templateContext = (template?.context ?? {}) as Record<string, unknown>;

    const config = {
      version: "1",
      project: {
        name: answers.name,
        type: projectType,
        ...(answers.description ? { description: answers.description } : {}),
      },
      tools: {
        claude_code: tools.includes("claude_code"),
        codex: tools.includes("codex"),
        cursor: tools.includes("cursor"),
      },
      context: {
        tech_stack:
          techFromInput.length > 0
            ? techFromInput
            : ((templateContext.tech_stack as string[]) ?? []),
        summary: (templateContext.summary as string) ?? "",
        path_rules: (templateContext.path_rules as unknown[]) ?? [],
        skills: (templateContext.skills as unknown[]) ?? [],
        agents: (templateContext.agents as unknown[]) ?? [],
        forbidden: (templateContext.forbidden as string[]) ?? [],
        hooks: templateContext.hooks ?? { post_write: [], pre_bash: [] },
        mcp_servers: (templateContext.mcp_servers as unknown[]) ?? [],
        cursor: templateContext.cursor ?? { always_apply_rules: ["core"] },
      },
    };

    await writeFile(
      "prompt-guide.yml",
      yaml.dump(config, { lineWidth: 80 }),
      "utf-8",
    );

    p.log.success("prompt-guide.yml 생성 완료");
    p.outro("`prompt-guide sync` 로 설정 파일을 생성하세요.");
  },
});
