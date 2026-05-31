import { describe, expect, it } from "vitest";
import { renderSkillMd } from "./skills.js";

describe("renderSkillMd", () => {
  const skill = {
    name: "generate-view",
    description: "Create SwiftUI view",
    allowed_tools: ["Read", "Write", "Bash(swift:*)"],
    auto_invoke: false,
    prompt: "Create MVVM view",
  };

  it("uses space-separated allowed-tools per Agent Skills spec", () => {
    const md = renderSkillMd(skill);
    expect(md).toContain("allowed-tools: Read Write Bash(swift:*)");
    expect(md).not.toContain("allowed-tools: Read, Write");
  });

  it("adds disable-model-invocation for Claude when auto_invoke is false", () => {
    const md = renderSkillMd(skill, { claude: true });
    expect(md).toContain("disable-model-invocation: true");
  });

  it("omits Claude fields in standard Agent Skills output", () => {
    const md = renderSkillMd(skill);
    expect(md).not.toContain("disable-model-invocation");
  });
});
