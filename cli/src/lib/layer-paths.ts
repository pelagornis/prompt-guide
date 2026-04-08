/**
 * Markdown tree: `core/`, `context/`, … live **directly** under each tool root (no `…/ai/` segment).
 * `.cursor/rules/` is separate from `.cursor/core/`; `.claude/rules/` holds `install` bundles (`ai-*.md`).
 * `prompt-guide init` copies the bundled `layers/` template into each **layer target** below.
 * `layers.source` picks which copy `install` reads (default `.claude`).
 */
export const DEFAULT_LAYERS_SOURCE = '.claude';

/** Human authoring tree: Markdown here → `install` writes `.yml` under `layers.source` + tool mirrors. */
export const DEFAULT_DOCS_AUTHORING = 'docs/prompt-guide';

/** Project root merge manifest (paths relative to `layers.source`). */
export const DEFAULT_LAYERS_MANIFEST = 'layers.manifest.yml';

/** `init` copies the template into each path (same layout; no `/ai` subfolder). */
export const LAYER_TEMPLATE_TARGETS: { path: string; label: string }[] = [
  { path: '.cursor', label: 'Cursor' },
  { path: '.claude', label: 'Claude Code' },
  { path: 'codex', label: 'Codex' },
  { path: '.windsurf', label: 'Windsurf' },
];
