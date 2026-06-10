import { ClaudeAdapter } from "@pelagornis/prompt-guide-adapter-claude";
import { CodexAdapter } from "@pelagornis/prompt-guide-adapter-codex";
import { CursorAdapter } from "@pelagornis/prompt-guide-adapter-cursor";
import { generateSharedSkillFiles, type Adapter } from "@pelagornis/prompt-guide-adapters";
import { resolveConfig } from "@pelagornis/prompt-guide-core";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { writeGeneratedFiles } from "../lib/write-files.js";

export const syncCommand = defineCommand({
  meta: { description: "Generate or update all tool config files" },
  args: {
    "dry-run": {
      type: "boolean",
      default: false,
      description: "Preview without writing files",
    },
    tool: {
      type: "string",
      description: "claude | codex | cursor (single tool only)",
    },
  },
  async run({ args }) {
    const s = p.spinner();
    s.start("Loading prompt-guide.yml");

    const configResult = await resolveConfig(process.cwd());
    if (configResult.isErr()) {
      s.stop("Failed");
      if (configResult.error.type === "NOT_FOUND") {
        p.log.error(
          "prompt-guide.yml not found. Run `prompt-guide init` first.",
        );
      } else if (configResult.error.type === "VALIDATION_ERROR") {
        p.log.error(`Validation failed:\n${configResult.error.issues.join("\n")}`);
      } else {
        p.log.error(`Failed to load config: ${configResult.error.type}`);
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
      s.stop("Done");
      p.log.warn("No active adapters. Check the tools section in prompt-guide.yml.");
      process.exit(0);
    }

    s.message(`Generating [${adapters.map((a) => a.name).join(", ")}]`);

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

    if (config.context.skills.length > 0) {
      const sharedSkills = generateSharedSkillFiles(config);
      if (!dryRun) {
        const { written, skipped } = await writeGeneratedFiles(sharedSkills);
        if (skipped > 0) {
          p.log.info(
            `Agent Skills: ${written} written, ${skipped} skipped (already exist)`,
          );
        }
      }
      for (const file of sharedSkills) {
        const label = dryRun ? "[dry-run] " : "";
        p.log.success(`${label}${file.path}`);
        totalFiles++;
      }
    }

    s.stop(`Done — processed ${totalFiles} file(s)`);
  },
});
