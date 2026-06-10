import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  bundle: true,
  splitting: false,
  clean: true,
  dts: false,
  sourcemap: true,
  noExternal: [/^@pelagornis\/prompt-guide-/],
});
