import fs from 'node:fs';
import path from 'node:path';

export function copyRecursive(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

/** Copy a template directory while skipping top-level names (e.g. `layers.manifest.yml` stays at project root). */
export function copyDirExcluding(srcDir: string, destDir: string, excludeTopLevel: Set<string>): void {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    if (excludeTopLevel.has(name)) continue;
    copyRecursive(path.join(srcDir, name), path.join(destDir, name));
  }
}
