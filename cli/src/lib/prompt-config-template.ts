import type { Platform, Tool } from '../schemas.js';
import { DEFAULT_DOCS_AUTHORING, DEFAULT_LAYERS_SOURCE, DEFAULT_LAYERS_MANIFEST } from './layer-paths.js';

export type PromptConfigTemplateOptions = {
  /** Canonical layered tree for `install` (default `.claude`). */
  layersSource?: string;
  /** Project-relative merge manifest (default `layers.manifest.yml`). */
  layersManifest?: string;
};

/**
 * Generates the default prompt.config.js content with the given stack profile and tool.
 * `stackProfile` selects `prompts/rules.by-platform.yml` + init `.gitignore` block (not “product platform”).
 */
export function getPromptConfigTemplate(
  stackProfile: Platform,
  tool: Tool,
  options: PromptConfigTemplateOptions = {}
): string {
  const src = options.layersSource ?? DEFAULT_LAYERS_SOURCE;
  const manifest = options.layersManifest ?? DEFAULT_LAYERS_MANIFEST;
  const docsAuthoring = DEFAULT_DOCS_AUTHORING;
  const includeGlobs = [
    'src/**',
    'lib/**',
    'app/**',
    'packages/**',
    `${docsAuthoring}/**`,
    '.cursor/**',
    '.claude/**',
    'codex/**',
    '.windsurf/**',
    'CLAUDE.md',
    'AGENTS.md',
    manifest,
  ];
  const glob = `${src}/**`;
  if (!includeGlobs.includes(glob)) includeGlobs.push(glob);
  const includeJson = JSON.stringify(includeGlobs);
  const layersSourceJson = JSON.stringify(src);
  const layersManifestJson = JSON.stringify(manifest);

  return `/**
 * Prompt Guide config — single source for model, context, rules, and tool-specific install.
 * Edit this file, then run \`prompt-guide install\` to apply to your AI tool (Cursor, Codex, Windsurf, Claude Code, etc.).
 * @see https://github.com/pelagornis/prompt-guide
 */
module.exports = {
  tool: '${tool}',
  /** Active stack preset (rules YAML + gitignore). Change per repo when you switch projects. */
  stackProfile: '${stackProfile}',
  /** @deprecated Same as stackProfile — kept for older configs */
  platform: '${stackProfile}',

  model: {
    default: 'claude-sonnet-4',
    options: ['claude-sonnet-4', 'claude-opus-4', 'gpt-4o', 'gpt-4o-mini'],
  },

  layers: {
    source: ${layersSourceJson},
    manifest: ${layersManifestJson},
    /** Author Markdown here (same paths as layer tree). \`install\` writes \`prompt:\` YAML under layers.source + mirrors. Set false to disable. */
    docsAuthoring: ${JSON.stringify(docsAuthoring)},
    /** Extra roots that receive the same generated YAML (rare). */
    initTargets: [],
    /** When true (default), Codex / Claude / Windsurf bundles use fewer tokens. */
    bundleMinify: true,
  },

  context: {
    include: ${includeJson},
    exclude: [
      '**/.env', '**/.env.*', '**/secrets/**', '**/*secret*', '**/*credentials*',
      '**/*.pem', '**/*.key', '**/node_modules/**', '**/dist/**', '**/build/**',
      '**/.next/**', '**/out/**', '**/.git/**', '**/.cache/**', '**/vendor/**',
    ],
    max_files: 50,
    max_tokens: 8000,
  },

  prompts: {
    default: 'prompts/system.core.yml',
    review: 'prompts/review.yml',
  },

  taskPresets: {
    default: { description: 'General coding with full system rules', prompt: 'prompts/system.core.yml' },
    review: { description: 'Code review with checklist', prompt: 'prompts/review.yml', model: 'claude-sonnet-4' },
    refactor: { description: 'Refactor only; preserve behavior', prompt: 'prompts/system.core.yml', rules_extra: ['Change behavior only when requested; preserve semantics.', 'Prefer small, incremental steps.'] },
    implement: { description: 'Implement from spec/ticket', prompt: 'prompts/system.core.yml', rules_extra: ['Implement exactly what is specified.', 'Add tests or test plan.'] },
    fix_bug: { description: 'Locate and fix with minimal change', prompt: 'prompts/system.core.yml', rules_extra: ['Identify root cause before changing code.', 'Minimal diff; no refactors unless required.'] },
    security_audit: { description: 'Security-focused review', prompt: 'prompts/review.yml', rules_extra: ['Focus on: secrets, input validation, auth, sensitive data in logs.'] },
  },

  platforms: {
    universal: { label: 'Universal', context: { include: ['src/**', 'lib/**', 'app/**', 'packages/**', 'internal/**', 'cmd/**', 'docs/**'] }, rules_key: 'universal' },
    ios: { label: 'iOS', context: { include: ['ios/**', '*.xcodeproj/**', 'Shared/**', 'src/**'] }, rules_key: 'ios' },
    android: { label: 'Android', context: { include: ['android/**', 'app/**', 'lib/**', 'src/**'] }, rules_key: 'android' },
    flutter: { label: 'Flutter', context: { include: ['lib/**', 'ios/**', 'android/**', 'test/**', 'pubspec.yaml'] }, rules_key: 'flutter' },
    web: { label: 'Web', context: { include: ['src/**', 'public/**', 'app/**', '*.config.js', '*.config.ts'] }, rules_key: 'web' },
    server: { label: 'Server', context: { include: ['src/**', 'lib/**', 'app/**', 'internal/**', 'cmd/**'] }, rules_key: 'server' },
  },

  rules: {
    no_auto_scan: true,
    deterministic: true,
    strict: true,
    no_hallucination: true,
    cite_sources: true,
    require_file_refs: true,
    stay_in_scope: true,
    no_unsolicited_changes: true,
  },
};
`;
}
