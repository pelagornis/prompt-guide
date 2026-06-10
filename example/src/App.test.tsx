import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the title", () => {
    expect(App({ title: "example-app" })).toBeDefined();
  });
});
