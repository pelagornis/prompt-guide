import { describe, expect, it } from "vitest";
import { CodexAdapter } from "./adapter.js";

const sampleConfig = {
  version: "1" as const,
  project: { name: "AlarmApp", type: "ios-swift" as const },
  tools: { claude_code: false, codex: true, cursor: false },
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
        allowed_tools: ["Read"],
        auto_invoke: true,
        paths: [],
        prompt: "Create MVVM view",
      },
    ],
    agents: [],
    hooks: { post_write: [], pre_bash: [] },
    mcp_servers: [],
    forbidden: [],
    cursor: { always_apply_rules: ["core"] },
  },
};

describe("CodexAdapter", () => {
  it("generates lean AGENTS.md and project config files", async () => {
    const adapter = new CodexAdapter();
    const result = await adapter.generate(sampleConfig);
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const paths = result.value.map((f) => f.path);
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain(".codex/config.toml");
    expect(paths).toContain(".codex/instructions/swift-ui.md");
    expect(paths).not.toContain(".codex-setup.md");

    const agentsMd = result.value.find((f) => f.path === "AGENTS.md");
    expect(agentsMd?.content).toContain(".codex/instructions/swift-ui.md");
    expect(agentsMd?.content).toContain(".agents/skills/generate-view/SKILL.md");
    expect(agentsMd?.content).not.toContain("Create MVVM view");
  });
});
