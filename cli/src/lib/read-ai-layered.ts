import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_DOCS_AUTHORING, DEFAULT_LAYERS_SOURCE } from './layer-paths.js';
import {
  tryLoadLayerManifest,
  getSystemPaths,
  getReviewRelativePath,
  getCursorListMode,
} from './read-layer-manifest.js';
import { isLayerSourceFilename, readLayerSourceFile } from './read-layer-source.js';

const SEP = '\n\n---\n\n';

function walkAllLayerFilesUnderRoot(cwd: string, root: string): string[] {
  const base = path.join(cwd, root);
  if (!fs.existsSync(base)) return [];
  const out: string[] = [];

  function walk(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && isLayerSourceFilename(e.name)) {
        out.push(path.relative(cwd, full).split(path.sep).join('/'));
      }
    }
  }
  walk(base);
  return out.sort();
}

/**
 * True if layered mode is active: generated `core/rules.yml` under `root`, legacy `.md`, or authoring `docs/.../core/rules.md`.
 */
export function hasAiHierarchy(cwd: string, root = DEFAULT_LAYERS_SOURCE): boolean {
  const base = path.join(cwd, root, 'core');
  const docsCore = path.join(cwd, DEFAULT_DOCS_AUTHORING, 'core');
  return (
    fs.existsSync(path.join(base, 'rules.yml')) ||
    fs.existsSync(path.join(base, 'rules.yaml')) ||
    fs.existsSync(path.join(base, 'rules.md')) ||
    fs.existsSync(path.join(docsCore, 'rules.md'))
  );
}

/**
 * Layer file paths for Cursor manifest (.md / .yml / .yaml). Uses `layers.manifest.yml` (`cursor.list`: all | system).
 */
export function listAiMarkdownFiles(cwd: string, root: string, manifestPath: string): string[] {
  const manifest = tryLoadLayerManifest(manifestPath);
  const mode = getCursorListMode(manifest);
  if (mode === 'all' || !manifest) {
    return walkAllLayerFilesUnderRoot(cwd, root);
  }
  const base = path.join(cwd, root);
  const out: string[] = [];
  const rels = [...getSystemPaths(manifest)];
  const rev = getReviewRelativePath(manifest);
  if (rev && !rels.includes(rev)) rels.push(rev);
  for (const rel of rels) {
    const p = path.join(base, rel);
    if (fs.existsSync(p) && isLayerSourceFilename(path.basename(p))) {
      out.push(path.relative(cwd, p).split(path.sep).join('/'));
    }
  }
  return [...new Set(out)].sort();
}

/**
 * Build system + review strings from layered files (.md or YAML `prompt`/`text`). Order follows `layers.manifest.yml` when present.
 */
export function tryBuildPromptsFromAi(
  cwd: string,
  root: string,
  manifestPath: string
): { system: string; review: string } | null {
  if (!hasAiHierarchy(cwd, root)) return null;

  const manifest = tryLoadLayerManifest(manifestPath);
  const systemRels = getSystemPaths(manifest);
  const reviewRel = getReviewRelativePath(manifest);

  const base = path.join(cwd, root);
  const parts: string[] = [];
  for (const rel of systemRels) {
    const p = path.join(base, rel);
    if (fs.existsSync(p)) {
      const text = readLayerSourceFile(p);
      if (text) parts.push(text);
    }
  }
  const system = parts.join(SEP);
  if (!system) return null;

  const reviewPath = path.join(base, reviewRel);
  let review = '';
  if (fs.existsSync(reviewPath)) {
    review = readLayerSourceFile(reviewPath);
  }

  return { system, review };
}
