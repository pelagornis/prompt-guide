import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import figlet from 'figlet';
import type { Platform, Tool } from '../schemas.js';
import { askPlatform, askTool } from '../lib/prompt.js';
import { getTemplatesDir } from '../lib/paths.js';
import { copyRecursive } from '../lib/copy.js';
import { getPromptConfigTemplate } from '../lib/prompt-config-template.js';
import { mergeGitignore } from '../lib/gitignore.js';

const BAR = chalk.dim('  ' + '─'.repeat(44));

function renderBanner(): string {
  const opts = { font: 'Slant' as const, horizontalLayout: 'fitted' as const };
  const promptArt = figlet.textSync('Prompt', opts);
  const guideArt = figlet.textSync('Guide', opts);
  const blue = chalk.blue;
  return blue(promptArt) + '\n' + blue(guideArt);
}

const DEFAULT_PLATFORM: Platform = 'web';
const DEFAULT_TOOL: Tool = 'cursor';

export type InitOptions = { dryRun?: boolean; verbose?: boolean; yes?: boolean; tool?: string };

export async function runInit(
  platformFromOption?: string,
  options: InitOptions & { toolFromOption?: string } = {}
): Promise<void> {
  const { dryRun = false, verbose = false, yes = false, toolFromOption } = options;
  const cwd = process.cwd();
  const templatesDir = getTemplatesDir();

  if (!fs.existsSync(templatesDir)) {
    throw new Error('Templates not found. Reinstall @pelagornis/prompt-guide or run from the prompt-guide repo.');
  }

  const isInteractive = process.stdin.isTTY === true;

  let platform: Platform;
  const parsedPlatform = platformFromOption?.trim().toLowerCase();
  if (parsedPlatform && ['ios', 'android', 'flutter', 'web', 'server'].includes(parsedPlatform)) {
    platform = parsedPlatform as Platform;
    console.log(chalk.dim('  Platform:') + ' ' + chalk.cyan(platform));
  } else if (yes) {
    platform = DEFAULT_PLATFORM;
    console.log(chalk.dim('  Platform:') + ' ' + chalk.cyan(platform) + chalk.dim(' (--yes)'));
  } else if (!isInteractive) {
    platform = DEFAULT_PLATFORM;
    console.log(chalk.dim('  Platform:') + ' ' + chalk.cyan(platform) + chalk.dim(' (non-interactive, default)'));
  } else {
    platform = await askPlatform();
  }

  let tool: Tool;
  const parsedTool = toolFromOption?.trim().toLowerCase();
  if (parsedTool && ['cursor', 'claude', 'codex', 'windsurf', 'other'].includes(parsedTool)) {
    tool = parsedTool as Tool;
    console.log(chalk.dim('  AI tool:') + ' ' + chalk.cyan(tool));
  } else if (yes) {
    tool = DEFAULT_TOOL;
    console.log(chalk.dim('  AI tool:') + ' ' + chalk.cyan(tool) + chalk.dim(' (--yes)'));
  } else if (!isInteractive) {
    tool = DEFAULT_TOOL;
    console.log(chalk.dim('  AI tool:') + ' ' + chalk.cyan(tool) + chalk.dim(' (non-interactive, default)'));
  } else {
    tool = await askTool();
  }

  console.log('');
  console.log(renderBanner());
  console.log(chalk.dim('  platform: ') + chalk.cyan(platform) + chalk.dim('  tool: ') + chalk.cyan(tool));
  if (dryRun) console.log(chalk.yellow('  [dry-run] No files will be written.\n'));
  else console.log('');

  const promptsSrc = path.join(templatesDir, 'prompts');
  const docsSrc = path.join(templatesDir, 'docs');
  const promptsDest = path.join(cwd, 'prompts');
  const docsDest = path.join(cwd, 'docs');
  const configPath = path.join(cwd, 'prompt.config.js');

  const existing: string[] = [];
  if (fs.existsSync(configPath)) existing.push('prompt.config.js');
  if (fs.existsSync(promptsDest)) existing.push('prompts/');
  if (fs.existsSync(docsDest)) existing.push('docs/');
  if (existing.length > 0 && !dryRun) {
    console.log(chalk.yellow('  ⚠ ') + 'Existing: ' + existing.join(', ') + chalk.dim(' (will be overwritten)'));
    console.log('');
  }

  if (dryRun) {
    console.log(chalk.dim('  Would create'));
    console.log(BAR);
    console.log(chalk.blue('  →') + ' prompt.config.js ' + chalk.dim(`(platform=${platform}, tool=${tool})`));
    if (fs.existsSync(promptsSrc)) console.log(chalk.blue('  →') + ' copy prompts/ → ' + promptsDest);
    if (fs.existsSync(docsSrc)) console.log(chalk.blue('  →') + ' copy docs/ → ' + docsDest);
    console.log(chalk.blue('  →') + ' append .gitignore if needed');
    console.log(BAR);
    console.log(chalk.dim('\n  Then run ') + chalk.cyan('prompt-guide install') + chalk.dim(' to generate tool-specific rules.'));
    console.log('');
    return;
  }

  const configContent = getPromptConfigTemplate(platform, tool);
  fs.writeFileSync(configPath, configContent);

  if (fs.existsSync(promptsSrc)) copyRecursive(promptsSrc, promptsDest);
  if (fs.existsSync(docsSrc)) copyRecursive(docsSrc, docsDest);

  const { updated: gitignoreUpdated } = mergeGitignore(cwd, platform);

  if (verbose) {
    console.log(chalk.dim('  Templates from: ') + templatesDir);
  }
  console.log(chalk.dim('  Created'));
  console.log(BAR);
  console.log(chalk.green('  ✓') + ' prompt.config.js ' + chalk.dim(`(platform=${platform}, tool=${tool})`));
  console.log(chalk.green('  ✓') + ' prompts/');
  console.log(chalk.green('  ✓') + ' docs/');
  if (gitignoreUpdated) {
    console.log(chalk.green('  ✓') + ' .gitignore ' + chalk.dim('(appended)'));
  } else {
    console.log(chalk.dim('  · .gitignore already contains prompt-guide block'));
  }
  console.log('');
  console.log(chalk.dim('  Next step'));
  console.log(BAR);
  console.log(chalk.dim('  → ') + 'Run ' + chalk.cyan('prompt-guide install') + chalk.dim(' to generate rules for your AI tool (') + chalk.cyan(tool) + chalk.dim(').'));
  console.log(chalk.dim('  → ') + 'Edit ' + chalk.cyan('prompt.config.js') + chalk.dim(' to set context.include for your repo.'));
  console.log('');
}
