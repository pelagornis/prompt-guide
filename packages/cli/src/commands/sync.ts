import { ClaudeAdapter } from "@prompt-guide/adapter-claude";
import { CodexAdapter } from "@prompt-guide/adapter-codex";
import { CursorAdapter } from "@prompt-guide/adapter-cursor";
import type { Adapter } from "@prompt-guide/adapters";
import { resolveConfig } from "@prompt-guide/core";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { writeGeneratedFiles } from "../lib/write-files.js";

export const syncCommand = defineCommand({
  meta: { description: "모든 툴 설정 파일 생성/갱신" },
  args: {
    "dry-run": {
      type: "boolean",
      default: false,
      description: "실제 파일 쓰기 없이 미리보기",
    },
    tool: {
      type: "string",
      description: "claude | codex | cursor (특정 툴만)",
    },
  },
  async run({ args }) {
    const s = p.spinner();
    s.start("prompt-guide.yml 로딩 중");

    const configResult = await resolveConfig(process.cwd());
    if (configResult.isErr()) {
      s.stop("실패");
      if (configResult.error.type === "NOT_FOUND") {
        p.log.error(
          "prompt-guide.yml 없음. `prompt-guide init` 먼저 실행하세요.",
        );
      } else if (configResult.error.type === "VALIDATION_ERROR") {
        p.log.error(`검증 실패:\n${configResult.error.issues.join("\n")}`);
      } else {
        p.log.error(`설정 로드 실패: ${configResult.error.type}`);
      }
      process.exit(1);
    }

    const config = configResult.value;
    const allAdapters: Adapter[] = [
      ...(config.tools.claude_code ? [new ClaudeAdapter()] : []),
      ...(config.tools.codex ? [new CodexAdapter()] : []),
      ...(config.tools.cursor ? [new CursorAdapter()] : []),
    ];

    const toolFilter = args.tool as string | undefined;
    const adapters = toolFilter
      ? allAdapters.filter((a) => a.name === toolFilter)
      : allAdapters;

    if (!adapters.length) {
      s.stop("완료");
      p.log.warn("활성화된 어댑터 없음. prompt-guide.yml의 tools 섹션 확인.");
      process.exit(0);
    }

    s.message(`[${adapters.map((a) => a.name).join(", ")}] 생성 중`);

    const dryRun = Boolean(args["dry-run"]);
    let totalFiles = 0;

    for (const adapter of adapters) {
      const validation = adapter.validate(config);
      if (validation.isErr()) {
        p.log.warn(`${adapter.name}: ${validation.error.join(", ")}`);
        continue;
      }

      const result = await adapter.generate(config);
      if (result.isErr()) {
        p.log.warn(`${adapter.name}: ${result.error.message}`);
        continue;
      }

      if (!dryRun) {
        await writeGeneratedFiles(result.value);
      }

      for (const file of result.value) {
        const label = dryRun ? "[dry-run] " : "";
        p.log.success(`${label}${file.path}`);
        totalFiles++;
      }
    }

    s.stop(`완료 — ${totalFiles}개 파일 처리`);
  },
});
