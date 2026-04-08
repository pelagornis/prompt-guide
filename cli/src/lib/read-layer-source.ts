import fs from 'node:fs';
import yaml from 'js-yaml';

/**
 * Reads a layer file for merge/bundles.
 * - **`.md`**: raw file (human-friendly; headings/bold add tokens).
 * - **`.yml` / `.yaml`**: load YAML; use string **`prompt`** or **`text`** (compact; fewer decorative tokens).
 */
export function readLayerSourceFile(fullPath: string): string {
  if (!fs.existsSync(fullPath)) return '';
  const raw = fs.readFileSync(fullPath, 'utf8');
  const lower = fullPath.toLowerCase();
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) {
    try {
      const doc = yaml.load(raw) as unknown;
      if (doc && typeof doc === 'object' && doc !== null) {
        const o = doc as Record<string, unknown>;
        if (typeof o.prompt === 'string') return o.prompt.trim();
        if (typeof o.text === 'string') return o.text.trim();
      }
    } catch {
      /* fall through to raw */
    }
    return raw.trim();
  }
  return raw.trim();
}

export function isLayerSourceFilename(name: string): boolean {
  const l = name.toLowerCase();
  return l.endsWith('.md') || l.endsWith('.yml') || l.endsWith('.yaml');
}
