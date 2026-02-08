import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolve path to templates (from dist/ or from src/ when using tsx). */
export function getTemplatesDir(): string {
  const base = path.join(__dirname, '..', '..');
  return path.join(base, 'templates');
}
