import { describe, expect, it } from "vitest";
import { renderSkillMd } from "./skills.js";

describe("renderSkillMd", () => {
  const skill = {
    name: "generate-view",
    description: "Create SwiftUI view",
    allowed_tools: ["Read", "Write", "Bash(swift:*)"],
    auto_invoke: false,
    paths: ["**/*.swift"] as string[],
    prompt: "Create MVVM view",
  };

  it("uses space-separated allowed-tools per Agent Skills spec", () => {
    const md = renderSkillMd(skill);
    expect(md).toContain("allowed-tools: Read Write Bash(swift:*)");
    expect(md).not.toContain("allowed-tools: Read, Write");
  });

  it("emits paths for Cursor file scoping", () => {
    const md = renderSkillMd(skill);
    expect(md).toContain("paths:");
    expect(md).toContain('  - "**/*.swift"');
  });

  it("adds disable-model-invocation when auto_invoke is false", () => {
    const md = renderSkillMd(skill);
    expect(md).toContain("disable-model-invocation: true");
  });

  it("omits disable-model-invocation when auto_invoke is true", () => {
    const md = renderSkillMd({ ...skill, auto_invoke: true });
    expect(md).not.toContain("disable-model-invocation");
  });
});
