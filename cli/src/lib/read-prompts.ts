import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

/**
 * Read the `prompt` key from a YAML prompt file (e.g. prompts/system.core.yml).
 */
export function readPromptFromYaml(cwd: string, relativePath: string): string {
  const fullPath = path.resolve(cwd, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Prompt file not found: ${relativePath}`);
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const data = yaml.load(content) as { prompt?: string };
  if (typeof data?.prompt !== 'string') {
    throw new Error(`Missing or invalid "prompt" key in ${relativePath}`);
  }
  return data.prompt.trim();
}
