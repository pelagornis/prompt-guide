import select from '@inquirer/select';
import input from '@inquirer/input';
import confirm from '@inquirer/confirm';
import type { Platform, Tool } from '../schemas.js';
import { parseLayersSourceOption } from './resolve-layers-path.js';
import { DEFAULT_LAYERS_SOURCE } from './layer-paths.js';

const PLATFORM_CHOICES: { name: string; value: Platform }[] = [
  { name: 'Universal (any stack — recommended)', value: 'universal' },
  { name: 'Web', value: 'web' },
  { name: 'Server / backend', value: 'server' },
  { name: 'iOS', value: 'ios' },
  { name: 'Android', value: 'android' },
  { name: 'Flutter', value: 'flutter' },
];

export function askPlatform(): Promise<Platform> {
  return select({
    message: 'Stack profile (rules + .gitignore preset; change in prompt.config.js per project — Universal if unsure)',
    choices: PLATFORM_CHOICES,
    default: 'universal',
  });
}

const TOOL_CHOICES: { name: string; value: Tool }[] = [
  { name: 'Cursor', value: 'cursor' },
  { name: 'Claude Code', value: 'claude' },
  { name: 'Codex', value: 'codex' },
  { name: 'Windsurf', value: 'windsurf' },
  { name: 'Other', value: 'other' },
];

export function askTool(): Promise<Tool> {
  return select({
    message: 'AI tool',
    choices: TOOL_CHOICES,
    default: 'cursor',
  });
}

/** Canonical layered tree path (`layers.source` in prompt.config.js). */
export async function askLayersSource(): Promise<string> {
  const raw = await input({
    message: 'Canonical layered context path (install reads this tree; default: .claude)',
    default: DEFAULT_LAYERS_SOURCE,
    validate: (value) => {
      try {
        parseLayersSourceOption(value?.trim() || DEFAULT_LAYERS_SOURCE);
        return true;
      } catch (e) {
        return e instanceof Error ? e.message : 'Invalid path';
      }
    },
  });
  return parseLayersSourceOption(raw?.trim() || DEFAULT_LAYERS_SOURCE);
}

/** `true` = copy bundled `layers/` into each tool folder; `false` = skip (`--skip-layers`). */
export async function askCopyLayersTemplate(): Promise<boolean> {
  return confirm({
    message:
      'Copy layered template into .cursor/, .claude/, codex/, .windsurf/ (core/, context/, … at each root — no /ai/)?',
    default: true,
  });
}
