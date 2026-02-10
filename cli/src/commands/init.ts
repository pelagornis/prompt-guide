import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import figlet from 'figlet';
import type { Platform } from '../schemas.js';
import { askPlatform } from '../lib/prompt.js';
import { getTemplatesDir } from '../lib/paths.js';
import { copyRecursive } from '../lib/copy.js';
import { setPlatformInConfig } from '../lib/config.js';
import { mergeGitignore } from '../lib/gitignore.js';

const BAR = chalk.dim('  ' + '─'.repeat(44));

function renderBanner(): string {
  const opts = { font: 'Slant' as const, horizontalLayout: 'fitted' as const };
  const promptArt = figlet.textSync('Prompt', opts);
  const guideArt = figlet.textSync('Guide', opts);
  const blue = chalk.blue;
  return blue(promptArt) + '\n' + blue(guideArt);
}

export type InitOptions = { dryRun?: boolean; verbose?: boolean };

export async function runInit(platformFromOption?: string, options: InitOptions = {}): Promise<void> {
  const { dryRun = false, verbose = false } = options;
  const cwd = process.cwd();
  const templatesDir = getTemplatesDir();

  if (!fs.existsSync(templatesDir)) {
    throw new Error('Templates not found. Reinstall prompt-guide-cli or run from the prompt-guide repo.');
  }

  let platform: Platform;
  const parsed = platformFromOption?.trim().toLowerCase();

  if (parsed && ['ios', 'android', 'flutter', 'web', 'server'].includes(parsed)) {
    platform = parsed as Platform;
    console.log(chalk.dim('  Platform:') + ' ' + chalk.cyan(platform));
  } else {
    platform = await askPlatform();
  }

  console.log('');
  console.log(renderBanner());
  console.log(chalk.dim('  platform: ') + chalk.cyan(platform));
  if (dryRun) console.log(chalk.yellow('  [dry-run] No files will be written.\n'));
  else console.log('');

  const aiSrc = path.join(templatesDir, 'ai');
  const promptsSrc = path.join(templatesDir, 'prompts');
  const docsSrc = path.join(templatesDir, 'docs');

  if (dryRun) {
    console.log(chalk.dim('  Would install'));
    console.log(BAR);
    if (fs.existsSync(aiSrc)) console.log(chalk.blue('  →') + ' copy ai/ → ' + path.join(cwd, 'ai'));
    if (fs.existsSync(promptsSrc)) console.log(chalk.blue('  →') + ' copy prompts/ → ' + path.join(cwd, 'prompts'));
    if (fs.existsSync(docsSrc)) console.log(chalk.blue('  →') + ' copy docs/ → ' + path.join(cwd, 'docs'));
    console.log(chalk.blue('  →') + ' set platform in ai/ai.config.yml');
    console.log(chalk.blue('  →') + ' append .gitignore if needed');
    console.log(BAR);
    console.log('');
    return;
  }

  if (fs.existsSync(aiSrc)) copyRecursive(aiSrc, path.join(cwd, 'ai'));
  if (fs.existsSync(promptsSrc)) copyRecursive(promptsSrc, path.join(cwd, 'prompts'));
  if (fs.existsSync(docsSrc)) copyRecursive(docsSrc, path.join(cwd, 'docs'));

  setPlatformInConfig(cwd, platform);
  const { updated: gitignoreUpdated } = mergeGitignore(cwd, platform);

  if (verbose) {
    console.log(chalk.dim('  Templates from: ') + templatesDir);
  }
  console.log(chalk.dim('  Installed'));
  console.log(BAR);
  console.log(chalk.green('  ✓') + ' ai/ai.config.yml ' + chalk.dim(`(platform=${platform})`));
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
  console.log(chalk.dim('  → ') + 'Edit ' + chalk.cyan('ai/ai.config.yml') + chalk.dim(' to set context.include for your repo.'));
  console.log('');
}
