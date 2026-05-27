import { access, chmod, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { GeneratedFile } from "@prompt-guide/adapters";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function writeGeneratedFiles(
  files: GeneratedFile[],
  options: { dryRun?: boolean } = {},
): Promise<{ written: number; skipped: number }> {
  let written = 0;
  let skipped = 0;

  for (const file of files) {
    if (options.dryRun) continue;

    if (file.skipIfExists && (await exists(file.path))) {
      skipped++;
      continue;
    }

    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.content, "utf-8");

    if (file.path.endsWith(".sh")) {
      await chmod(file.path, 0o755);
    }

    written++;
  }

  return { written, skipped };
}
