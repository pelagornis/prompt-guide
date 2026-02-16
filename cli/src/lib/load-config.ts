import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

export type PromptConfig = {
  tool: string;
  platform: string;
  model?: { default?: string; options?: string[] };
  context?: { include?: string[]; exclude?: string[]; max_files?: number; max_tokens?: number };
  prompts?: { default?: string; review?: string; [k: string]: string | undefined };
  taskPresets?: Record<string, { description?: string; prompt?: string; model?: string; rules_extra?: string[] }>;
  platforms?: Record<string, { label?: string; context?: { include?: string[] }; rules_key?: string }>;
  rules?: Record<string, boolean>;
};

const REQUIRE = createRequire(import.meta.url);

/**
 * Resolve prompt.config.js or prompt.config.cjs from cwd.
 */
export function findConfigPath(cwd: string): string | null {
  const candidates = ['prompt.config.cjs', 'prompt.config.js'];
  for (const name of candidates) {
    const p = path.join(cwd, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Load prompt.config.js (or .cjs) from the given directory.
 * Uses require() so the config can use module.exports.
 */
export function loadPromptConfig(cwd: string): PromptConfig {
  const configPath = findConfigPath(cwd);
  if (!configPath) {
    throw new Error('prompt.config.js not found. Run `prompt-guide init` first.');
  }
  const config = REQUIRE(configPath) as PromptConfig;
  if (!config || typeof config !== 'object') {
    throw new Error('prompt.config.js must export an object (module.exports = { ... }).');
  }
  if (!config.tool || typeof config.tool !== 'string') {
    throw new Error('prompt.config.js must set "tool" (cursor | claude | codex | windsurf | other).');
  }
  return config;
}
