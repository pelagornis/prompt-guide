import { z } from 'zod';

export const PLATFORMS = ['ios', 'android', 'flutter', 'web', 'server'] as const;

export const platformSchema = z.enum(PLATFORMS, {
  errorMap: () => ({
    message: `Platform must be one of: ${PLATFORMS.join(', ')}`,
  }),
});

export type Platform = z.infer<typeof platformSchema>;

export const initOptionsSchema = z.object({
  platform: platformSchema.optional(),
});

export type InitOptions = z.infer<typeof initOptionsSchema>;
