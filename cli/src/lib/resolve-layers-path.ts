import path from 'node:path';

/**
 * Normalize and validate a relative layered-context path (e.g. `.claude`).
 * Rejects absolute paths and `..` segments.
 */
export function parseLayersSourceOption(raw: string): string {
  const trimmed = raw.trim().replace(/\\/g, '/');
  if (!trimmed) {
    throw new Error('--layers-source must be a non-empty relative path.');
  }
  if (path.isAbsolute(trimmed) || /^[A-Za-z]:/.test(trimmed)) {
    throw new Error('--layers-source must be relative to the project (no absolute paths).');
  }
  const segments = trimmed.split('/').filter(Boolean);
  if (segments.some((s) => s === '..')) {
    throw new Error('--layers-source must not contain "..".');
  }
  return segments.join('/');
}
