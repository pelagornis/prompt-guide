import { homedir } from "node:os";
import { access, chmod, mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import type { GeneratedFile } from "@pelagornis/prompt-guide-adapters";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function resolveGeneratedPath(path: string, cwd = process.cwd()): string {
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  if (isAbsolute(path)) return path;
  return join(cwd, path);
}

export async function writeGeneratedFiles(
  files: GeneratedFile[],
  options: { dryRun?: boolean; cwd?: string } = {},
): Promise<{ written: number; skipped: number }> {
  const cwd = options.cwd ?? process.cwd();
  let written = 0;
  let skipped = 0;

  for (const file of files) {
    if (options.dryRun) continue;

    const target = resolveGeneratedPath(file.path, cwd);

    if (file.skipIfExists && (await exists(target))) {
      skipped++;
      continue;
    }

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.content, "utf-8");

    if (target.endsWith(".sh")) {
      await chmod(target, 0o755);
    }

    written++;
  }

  return { written, skipped };
}
