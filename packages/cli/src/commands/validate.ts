import { resolveConfig } from "@prompt-guide/core";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";

export const validateCommand = defineCommand({
  meta: { description: "prompt-guide.yml 검증" },
  async run() {
    const result = await resolveConfig(process.cwd());
    if (result.isErr()) {
      if (result.error.type === "VALIDATION_ERROR") {
        for (const issue of result.error.issues) {
          p.log.error(issue);
        }
      } else {
        p.log.error(`검증 실패: ${result.error.type}`);
      }
      process.exit(1);
    }
    p.log.success("유효한 설정입니다.");
  },
});
