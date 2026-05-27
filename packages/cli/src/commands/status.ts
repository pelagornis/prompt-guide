import { ClaudeAdapter } from "@prompt-guide/adapter-claude";
import { CodexAdapter } from "@prompt-guide/adapter-codex";
import { CursorAdapter } from "@prompt-guide/adapter-cursor";
import { resolveConfig } from "@prompt-guide/core";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";

export const statusCommand = defineCommand({
  meta: { description: "현재 생성된 파일 상태 확인" },
  async run() {
    const configResult = await resolveConfig(process.cwd());
    if (configResult.isErr()) {
      p.log.error("prompt-guide.yml 로드 실패");
      process.exit(1);
    }

    const config = configResult.value;
    const adapters = [
      ...(config.tools.claude_code ? [new ClaudeAdapter()] : []),
      ...(config.tools.codex ? [new CodexAdapter()] : []),
      ...(config.tools.cursor ? [new CursorAdapter()] : []),
    ];

    p.intro(`프로젝트: ${config.project.name}`);

    for (const adapter of adapters) {
      const diffs = await adapter.diff(config, process.cwd());
      const created = diffs.filter((d) => d.status === "created").length;
      const updated = diffs.filter((d) => d.status === "updated").length;
      const unchanged = diffs.filter((d) => d.status === "unchanged").length;

      p.log.info(
        `[${adapter.name}] 생성 예정 ${created} · 변경 ${updated} · 동일 ${unchanged}`,
      );
    }

    p.outro("상세 diff는 `prompt-guide diff` 실행");
  },
});
