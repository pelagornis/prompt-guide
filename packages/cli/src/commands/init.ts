import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ProjectType } from "@prompt-guide/schema";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import yaml from "js-yaml";

const templatesRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../templates",
);

async function loadTypeTemplate(type: ProjectType) {
  try {
    const raw = await readFile(
      join(templatesRoot, type, "prompt-guide.yml"),
      "utf-8",
    );
    return yaml.load(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

type RemoteTemplateSource = {
  owner: string;
  repo: string;
  ref: string;
  path: string;
};

function parseRemoteSource(from: string): RemoteTemplateSource | null {
  if (from.startsWith("https://github.com/")) {
    const url = new URL(from);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    const owner = segments[0];
    const repo = segments[1];
    if (!owner || !repo) return null;

    const kind = segments[2];
    const ref = segments[3];
    const rest = segments.slice(4);
    if (kind === "blob" && ref && rest.length > 0) {
      return { owner, repo, ref, path: rest.join("/") };
    }

    return { owner, repo, ref: "main", path: "prompt-guide.yml" };
  }

  const [repoWithPath = "", refPart] = from.split("@");
  const [owner, repo, ...rest] = repoWithPath.split("/");
  if (!owner || !repo) return null;

  return {
    owner,
    repo,
    ref: refPart || "main",
    path: rest.length > 0 ? rest.join("/") : "prompt-guide.yml",
  };
}

async function loadRemoteTemplate(from: string) {
  const parsed = parseRemoteSource(from);
  if (!parsed) return null;

  const url = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${parsed.ref}/${parsed.path}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const raw = await res.text();
  return yaml.load(raw) as Record<string, unknown>;
}

export const initCommand = defineCommand({
  meta: { description: "Initialize project (interactive)" },
  args: {
    git: {
      type: "string",
      description:
        "Remote template (owner/repo/path[@ref] or github.com/.../blob/... URL)",
    },
  },
  async run({ args }) {
    p.intro("prompt-guide");

    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "Project name",
            placeholder: "my-app",
            validate: (v) => (v.length < 1 ? "Required" : undefined),
          }),
        type: () =>
          p.select({
            message: "Project type",
            options: [
              { value: "ios-swift", label: "iOS / Swift" },
              { value: "web-react", label: "Web / React" },
              { value: "web-vue", label: "Web / Vue" },
              { value: "python", label: "Python" },
              { value: "node", label: "Node.js" },
              { value: "custom", label: "Custom" },
            ],
          }),
        tools: () =>
          p.multiselect({
            message: "AI tools to enable (space to select)",
            options: [
              { value: "claude_code", label: "Claude Code", hint: ".claude/" },
              { value: "codex", label: "Codex CLI", hint: "AGENTS.md" },
              { value: "cursor", label: "Cursor", hint: ".cursor/rules/" },
            ],
            initialValues: ["claude_code", "cursor"],
          }),
        tech_stack: () =>
          p.text({
            message: "Tech stack (comma-separated)",
            placeholder: "SwiftUI, AlarmKit, LiveActivity",
          }),
        description: () =>
          p.text({
            message: "Project description (optional)",
            placeholder: "AlarmKit-based alarm app",
          }),
      },
      {
        onCancel: () => {
          p.cancel("Cancelled");
          process.exit(0);
        },
      },
    );

    const projectType = answers.type as ProjectType;
    const git = args.git ? String(args.git) : "";
    let template: Record<string, unknown> | null = null;

    if (git) {
      try {
        template = await loadRemoteTemplate(git);
        if (!template) {
          p.log.warn(
            `Failed to load remote template: ${git} (falling back to local template)`,
          );
        }
      } catch {
        p.log.warn(
          `Failed to load remote template: ${git} (falling back to local template)`,
        );
      }
    }

    if (!template) {
      template = await loadTypeTemplate(projectType);
    }
    const tools = answers.tools as string[];

    const techFromInput = String(answers.tech_stack)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const templateContext = (template?.context ?? {}) as Record<string, unknown>;

    const config = {
      version: "1",
      project: {
        name: answers.name,
        type: projectType,
        ...(answers.description ? { description: answers.description } : {}),
      },
      tools: {
        claude_code: tools.includes("claude_code"),
        codex: tools.includes("codex"),
        cursor: tools.includes("cursor"),
      },
      context: {
        tech_stack:
          techFromInput.length > 0
            ? techFromInput
            : ((templateContext.tech_stack as string[]) ?? []),
        summary: (templateContext.summary as string) ?? "",
        path_rules: (templateContext.path_rules as unknown[]) ?? [],
        skills: (templateContext.skills as unknown[]) ?? [],
        agents: (templateContext.agents as unknown[]) ?? [],
        forbidden: (templateContext.forbidden as string[]) ?? [],
        hooks: templateContext.hooks ?? { post_write: [], pre_bash: [] },
        mcp_servers: (templateContext.mcp_servers as unknown[]) ?? [],
        cursor: templateContext.cursor ?? { always_apply_rules: ["core"] },
      },
    };

    await writeFile(
      "prompt-guide.yml",
      yaml.dump(config, { lineWidth: 80 }),
      "utf-8",
    );

    p.log.success("Created prompt-guide.yml");
    p.outro("Run `prompt-guide sync` to generate tool config files.");
  },
});
