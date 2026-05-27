import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveConfig } from "./resolver.js";

describe("resolveConfig", () => {
  it("loads prompt-guide.yml", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pg-"));
    await writeFile(
      join(dir, "prompt-guide.yml"),
      `version: "1"
project:
  name: TestApp
  type: web-react
tools:
  claude_code: true
context:
  tech_stack: [React]
`,
      "utf-8",
    );

    const result = await resolveConfig(dir);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.project.name).toBe("TestApp");
    }
  });
});
