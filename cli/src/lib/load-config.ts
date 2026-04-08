import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { DEFAULT_DOCS_AUTHORING, DEFAULT_LAYERS_MANIFEST, DEFAULT_LAYERS_SOURCE } from './layer-paths.js';

export type PromptConfig = {
  tool: string;
  /**
   * Active stack preset for `prompts/rules.by-platform.yml` + init `.gitignore` block.
   * Prefer this over `platform` (legacy name).
   */
  stackProfile?: string;
  /** @deprecated Use `stackProfile`. Kept for existing repos. */
  platform?: string;
  /**
   * Canonical layered Markdown tree for `prompt-guide install` (bundles, manifests).
   * Default `.claude` (Markdown tree at repo `.claude/` root, alongside `.claude/rules/`).
   */
  layers?: {
    source?: string;
    /** Project-relative path to merge manifest (default `layers.manifest.yml`). */
    manifest?: string;
    /**
     * Markdown authoring root (default `docs/prompt-guide`). Same folder layout as the layer tree.
     * `prompt-guide install` converts each `*.md` → `prompt:` YAML under `layers.source` and mirrors.
     * Set to `false` to skip conversion (only use existing `.yml`/`.md` under `layers.source`).
     */
    docsAuthoring?: string | false;
    /** Optional: extra init copy targets `{ path, label }` — usually set via `init --layer-target` instead. */
    initTargets?: { path: string; label?: string }[];
    /**
     * When true (default), Codex / Claude / Windsurf bundles use a **minified** copy of merged text
     * (fewer tokens). Files under `layers.source` remain full Markdown for humans and Cursor.
     */
    bundleMinify?: boolean;
  };
  /** @deprecated Use `layers.source` instead. */
  ai?: { root?: string };
  model?: { default?: string; options?: string[] };
  context?: { include?: string[]; exclude?: string[]; max_files?: number; max_tokens?: number };
  prompts?: { default?: string; review?: string; [k: string]: string | undefined };
  taskPresets?: Record<string, { description?: string; prompt?: string; model?: string; rules_extra?: string[] }>;
  /** Per-stack overrides; keys match `prompts/rules.by-platform.yml` (and `stackProfile`). */
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
  const tool = config.tool.toLowerCase();
  const allowed = ['cursor', 'claude', 'codex', 'windsurf', 'other'];
  if (!allowed.includes(tool)) {
    throw new Error(`prompt.config.js "tool" must be one of: ${allowed.join(', ')}. Got: ${config.tool}`);
  }
  return config;
}

/**
 * Absolute path to layers manifest (merge order for install + Cursor list mode).
 */
export function getLayersManifestPath(cwd: string, config: PromptConfig): string {
  const rel = (config.layers?.manifest ?? DEFAULT_LAYERS_MANIFEST).trim();
  return path.join(cwd, rel.replace(/\\/g, '/'));
}

/**
 * Directory (repo-relative) that contains layer files (`core/rules.yml`, etc.). Used by install and read-ai-layered.
 */
export function getLayersSource(config: PromptConfig): string {
  const fromLayers = config.layers?.source?.trim();
  if (fromLayers) return fromLayers.replace(/\\/g, '/');
  const legacy = config.ai?.root?.trim();
  if (legacy) return legacy.replace(/\\/g, '/');
  return DEFAULT_LAYERS_SOURCE;
}

/**
 * Which stack preset is active (`universal`, `web`, …). New projects should use `stackProfile`.
 */
export function getStackProfile(config: PromptConfig): string {
  const sp = config.stackProfile?.trim();
  if (sp) return sp.replace(/\\/g, '/');
  const legacy = config.platform?.trim();
  if (legacy) return legacy.replace(/\\/g, '/');
  return 'universal';
}

/** Whether to minify text embedded in AGENTS.md / Codex / Claude / Windsurf (default: true). */
export function getBundleMinify(config: PromptConfig): boolean {
  return config.layers?.bundleMinify !== false;
}

/**
 * Markdown authoring root for `install` → YAML sync. `false` = disabled.
 */
export function getDocsAuthoringRoot(config: PromptConfig): string | null {
  if (config.layers?.docsAuthoring === false) return null;
  const v = config.layers?.docsAuthoring;
  if (typeof v === 'string' && v.trim()) return v.trim().replace(/\\/g, '/');
  return DEFAULT_DOCS_AUTHORING;
}
