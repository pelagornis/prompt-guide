import { describe, expect, it } from "vitest";
import { ClaudeAdapter } from "./adapter.js";

const sampleConfig = {
  version: "1" as const,
  project: { name: "AlarmApp", type: "ios-swift" as const },
  tools: { claude_code: true, codex: false, cursor: true },
  context: {
    tech_stack: ["SwiftUI"],
    summary: "AlarmKit iOS app",
    path_rules: [
      {
        name: "swift-ui",
        path: ["**/*.swift"],
        content: "- Use SwiftUI",
      },
    ],
    skills: [
      {
        name: "generate-view",
        description: "Create SwiftUI view",
        allowed_tools: ["Read", "Write"],
        auto_invoke: true,
        prompt: "Create MVVM view",
      },
    ],
    agents: [
      {
        name: "reviewer",
        description: "Review code",
        tools: ["Read"],
        prompt: "Review changes",
      },
    ],
    hooks: { post_write: [], pre_bash: [] },
    mcp_servers: [],
    forbidden: ["force unwrap"],
    cursor: { always_apply_rules: ["core"] },
  },
};

describe("ClaudeAdapter", () => {
  it("generates expected file paths", async () => {
    const adapter = new ClaudeAdapter();
    const result = await adapter.generate(sampleConfig);
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const paths = result.value.map((f) => f.path);
    expect(paths).toContain("CLAUDE.md");
    expect(paths).toContain(".claude/settings.json");
    expect(paths).toContain(".claude/rules/swift-ui.md");
    expect(paths).toContain(".claude/skills/generate-view/SKILL.md");
    expect(paths).toContain(".claude/agents/reviewer.md");
    expect(paths).toContain(".claude/hooks/block-dangerous.sh");
  });
});
