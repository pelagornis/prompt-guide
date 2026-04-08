import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { PromptConfig } from './load-config.js';
import { getDocsAuthoringRoot, getLayersSource } from './load-config.js';
import { LAYER_TEMPLATE_TARGETS } from './layer-paths.js';

/** Strip leading YAML/Markdown frontmatter (`--- ... ---`). */
export function stripMarkdownFrontmatter(raw: string): string {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('---')) return raw;
  const m = trimmed.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (m) return trimmed.slice(m[0].length);
  return raw;
}

export function markdownBodyToYamlLayerFile(mdBody: string): string {
  const body = stripMarkdownFrontmatter(mdBody).trim();
  const dump = (yaml as unknown as { dump: (d: unknown, o?: Record<string, unknown>) => string }).dump;
  return dump({ prompt: body }, { lineWidth: -1, noRefs: true });
}

export function collectLayerSyncTargets(config: PromptConfig): string[] {
  const targets = new Set<string>();
  targets.add(getLayersSource(config));
  for (const t of LAYER_TEMPLATE_TARGETS) {
    targets.add(t.path);
  }
  for (const it of config.layers?.initTargets ?? []) {
    const p = it.path?.trim();
    if (p) targets.add(p.replace(/\\/g, '/'));
  }
  return [...targets];
}

export type SyncDocsResult = { files: number; targets: number; skipped: boolean };

/**
 * For each `*.md` under `docsAuthoring`, write `prompt:` YAML to every layer mirror (`.claude/`, `.cursor/`, …).
 */
export function syncDocsAuthoringToLayerTargets(cwd: string, config: PromptConfig): SyncDocsResult {
  const authorRoot = getDocsAuthoringRoot(config);
  if (!authorRoot) return { files: 0, targets: 0, skipped: true };

  const abs = path.join(cwd, authorRoot);
  if (!fs.existsSync(abs)) return { files: 0, targets: 0, skipped: false };

  const targets = collectLayerSyncTargets(config);
  const collected: { rel: string; body: string }[] = [];

  function walk(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        const rel = path.relative(abs, full).split(path.sep).join('/');
        collected.push({ rel, body: fs.readFileSync(full, 'utf8') });
      }
    }
  }
  walk(abs);

  if (collected.length === 0) return { files: 0, targets: targets.length, skipped: false };

  for (const { rel, body } of collected) {
    const ymlRel = rel.replace(/\.md$/i, '.yml');
    const ymlText = markdownBodyToYamlLayerFile(body);
    for (const target of targets) {
      const dest = path.join(cwd, target, ymlRel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, ymlText, 'utf8');
    }
  }

  return { files: collected.length, targets: targets.length, skipped: false };
}
