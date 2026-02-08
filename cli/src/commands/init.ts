import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import type { Platform } from '../schemas.js';
import { askPlatform } from '../lib/prompt.js';
import { getTemplatesDir } from '../lib/paths.js';
import { copyRecursive } from '../lib/copy.js';
import { setPlatformInConfig } from '../lib/config.js';
import { mergeGitignore } from '../lib/gitignore.js';

const BOX_TOP = '╭────────────────────────────────────────╮';
const BOX_BOTTOM = '╰────────────────────────────────────────╯';

export async function runInit(platformFromOption?: string): Promise<void> {
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
  console.log(chalk.gray(BOX_TOP));
  console.log(chalk.gray('  ') + chalk.bold('Setting up prompt-guide'));
  console.log(chalk.gray('  ') + chalk.dim(`platform: ${platform}`));
  console.log(chalk.gray(BOX_BOTTOM));
  console.log('');

  const aiSrc = path.join(templatesDir, 'ai');
  const promptsSrc = path.join(templatesDir, 'prompts');
  const docsSrc = path.join(templatesDir, 'docs');

  if (fs.existsSync(aiSrc)) copyRecursive(aiSrc, path.join(cwd, 'ai'));
  if (fs.existsSync(promptsSrc)) copyRecursive(promptsSrc, path.join(cwd, 'prompts'));
  if (fs.existsSync(docsSrc)) copyRecursive(docsSrc, path.join(cwd, 'docs'));

  setPlatformInConfig(cwd, platform);
  const { updated: gitignoreUpdated } = mergeGitignore(cwd);

  console.log(chalk.green('  ✓') + ' ai/ai.config.yml ' + chalk.dim(`(platform=${platform})`));
  console.log(chalk.green('  ✓') + ' prompts/');
  console.log(chalk.green('  ✓') + ' docs/');
  if (gitignoreUpdated) {
    console.log(chalk.green('  ✓') + ' .gitignore ' + chalk.dim('(appended)'));
  } else {
    console.log(chalk.dim('  · .gitignore already contains prompt-guide block'));
  }
  console.log('');
  console.log(chalk.dim('  Next: edit ai/ai.config.yml to adjust context.include for your repo.'));
  console.log('');
}
