import { z } from "zod";

export const ProjectTypeSchema = z.enum([
  "ios-swift",
  "web-react",
  "web-vue",
  "python",
  "node",
  "custom",
]);

export const PathRuleSchema = z.object({
  name: z.string(),
  path: z.array(z.string()),
  description: z.string().optional(),
  content: z.string(),
});

export const SkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  allowed_tools: z.array(z.string()).default([]),
  auto_invoke: z.boolean().default(false),
  prompt: z.string(),
});

export const AgentSchema = z.object({
  name: z.string(),
  description: z.string(),
  tools: z.array(z.string()).default([]),
  prompt: z.string(),
});

export const HookEntrySchema = z.object({
  matcher: z.string(),
  command: z.string(),
  timeout: z.number().default(30),
});

export const McpServerSchema = z.object({
  name: z.string(),
  type: z.enum(["http", "stdio"]),
  url: z.string().optional(),
  command: z.string().optional(),
  auth_env: z.string().optional(),
});

export const CursorConfigSchema = z.object({
  always_apply_rules: z.array(z.string()).default([]),
});

export const ContextSchema = z.object({
  tech_stack: z.array(z.string()).default([]),
  summary: z.string().optional(),
  path_rules: z.array(PathRuleSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  agents: z.array(AgentSchema).default([]),
  hooks: z
    .object({
      post_write: z.array(HookEntrySchema).default([]),
      pre_bash: z.array(HookEntrySchema).default([]),
    })
    .default({}),
  mcp_servers: z.array(McpServerSchema).default([]),
  forbidden: z.array(z.string()).default([]),
  cursor: CursorConfigSchema.default({}),
});

export const PromptGuideConfigSchema = z.object({
  version: z.literal("1").default("1"),
  project: z.object({
    name: z.string(),
    type: ProjectTypeSchema,
    description: z.string().optional(),
  }),
  tools: z
    .object({
      claude_code: z.boolean().default(true),
      codex: z.boolean().default(false),
      cursor: z.boolean().default(true),
    })
    .default({}),
  context: ContextSchema.default({}),
});

export type PromptGuideConfig = z.infer<typeof PromptGuideConfigSchema>;
export type ProjectType = z.infer<typeof ProjectTypeSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type PathRule = z.infer<typeof PathRuleSchema>;
export type Agent = z.infer<typeof AgentSchema>;
