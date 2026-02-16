import select from '@inquirer/select';
import type { Platform, Tool } from '../schemas.js';

const PLATFORM_CHOICES: { name: string; value: Platform }[] = [
  { name: 'iOS', value: 'ios' },
  { name: 'Android', value: 'android' },
  { name: 'Flutter', value: 'flutter' },
  { name: 'Web', value: 'web' },
  { name: 'Server', value: 'server' },
];

export function askPlatform(): Promise<Platform> {
  return select({
    message: 'Platform',
    choices: PLATFORM_CHOICES,
    default: 'web',
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
