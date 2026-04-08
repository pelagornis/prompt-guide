import { z } from 'zod';

/** `universal` = stack-agnostic; no extra .gitignore block or platform YAML beyond optional merge. */
export const PLATFORMS = ['universal', 'ios', 'android', 'flutter', 'web', 'server'] as const;

export const platformSchema = z.enum(PLATFORMS, {
  errorMap: () => ({
    message: `Platform must be one of: ${PLATFORMS.join(', ')}`,
  }),
});

export type Platform = z.infer<typeof platformSchema>;

/** AI environment / editor (for model id hints and docs). */
export const TOOLS = ['cursor', 'claude', 'codex', 'windsurf', 'other'] as const;

export const toolSchema = z.enum(TOOLS, {
  errorMap: () => ({
    message: `Tool must be one of: ${TOOLS.join(', ')}`,
  }),
});

export type Tool = z.infer<typeof toolSchema>;

export const initOptionsSchema = z.object({
  platform: platformSchema.optional(),
  tool: toolSchema.optional(),
});

export type InitOptions = z.infer<typeof initOptionsSchema>;
