import fs from 'node:fs';
import yaml from 'js-yaml';

export type LayerManifestV1 = {
  version?: number;
  system: string[];
  review?: { path?: string };
  cursor?: { list?: 'all' | 'system' };
};

/** Default merge order when no manifest file exists (`install` emits `.yml` from `docs/prompt-guide/*.md`). */
export const DEFAULT_SYSTEM_PATHS: readonly string[] = [
  'core/rules.yml',
  'core/constraints.yml',
  'core/style.yml',
  'context/product.yml',
  'context/architecture.yml',
  'context/domain.yml',
  'memory/decisions.yml',
  'memory/patterns.yml',
  'memory/bugs.yml',
  'actions/coding.yml',
  'actions/debugging.yml',
  'agents/backend.yml',
  'agents/frontend.yml',
  'agents/infra.yml',
];

const DEFAULT_REVIEW_REL = 'actions/reviewing.yml';

export function tryLoadLayerManifest(manifestPath: string): LayerManifestV1 | null {
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const doc = yaml.load(raw) as unknown;
    if (!doc || typeof doc !== 'object') return null;
    const m = doc as LayerManifestV1;
    if (!Array.isArray(m.system) || m.system.length === 0) return null;
    const system = m.system.map((p) => String(p).replace(/\\/g, '/').trim()).filter(Boolean);
    if (system.length === 0) return null;
    return { ...m, system };
  } catch {
    return null;
  }
}

export function getReviewRelativePath(manifest: LayerManifestV1 | null): string {
  const p = manifest?.review?.path?.trim();
  return p || DEFAULT_REVIEW_REL;
}

export function getSystemPaths(manifest: LayerManifestV1 | null): string[] {
  if (manifest?.system?.length) return [...manifest.system];
  return [...DEFAULT_SYSTEM_PATHS];
}

export function getCursorListMode(manifest: LayerManifestV1 | null): 'all' | 'system' {
  const mode = manifest?.cursor?.list;
  return mode === 'system' ? 'system' : 'all';
}
