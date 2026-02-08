import fs from 'node:fs';
import path from 'node:path';
import type { Platform } from '../schemas.js';

export function setPlatformInConfig(cwd: string, platform: Platform): void {
  const configPath = path.join(cwd, 'ai', 'ai.config.yml');
  if (!fs.existsSync(configPath)) return;
  let content = fs.readFileSync(configPath, 'utf8');
  content = content.replace(/^platform:\s*(null|[\w-]+)/m, `platform: ${platform}`);
  fs.writeFileSync(configPath, content);
}
