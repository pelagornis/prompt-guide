import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** CLI package root (cli/). */
const pkgRoot = path.join(__dirname, '..', '..');

/** Repo root (prompt-guide/). */
const repoRoot = path.join(pkgRoot, '..');

/**
 * Directory that contains ai/, prompts/, docs/.
 * - In repo: repo root (./ai, ./docs, ./prompts).
 * - When published: package root has ai/, docs/, prompts/ (copied by prepublishOnly).
 */
export function getTemplatesDir(): string {
  if (fs.existsSync(path.join(pkgRoot, 'ai'))) return pkgRoot;
  return repoRoot;
}

/** CLI version from package.json. */
export function getVersion(): string {
  const pkgPath = path.join(pkgRoot, 'package.json');
  try {
    const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return typeof json.version === 'string' ? json.version : '1.0.0';
  } catch {
    return '1.0.0';
  }
}
