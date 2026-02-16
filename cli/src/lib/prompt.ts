import readline from 'node:readline';
import chalk from 'chalk';
import { PLATFORMS, TOOLS, type Platform, type Tool } from '../schemas.js';

const PLATFORM_BY_NUM: Record<string, Platform> = {
  '1': 'ios',
  '2': 'android',
  '3': 'flutter',
  '4': 'web',
  '5': 'server',
};

export function askPlatform(): Promise<Platform> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(
      chalk.dim('\n  Platform:') +
        ' ' +
        chalk.cyan('1') +
        '=ios ' +
        chalk.cyan('2') +
        '=android ' +
        chalk.cyan('3') +
        '=flutter ' +
        chalk.cyan('4') +
        '=web ' +
        chalk.cyan('5') +
        '=server'
    );
    rl.question(chalk.dim('  Choose (1–5 or name) ') + chalk.yellow('[4]') + chalk.dim(': '), (answer) => {
      rl.close();
      const trimmed = (answer || '4').trim().toLowerCase();
      const chosen = PLATFORM_BY_NUM[trimmed] ?? (PLATFORMS.includes(trimmed as Platform) ? (trimmed as Platform) : 'web');
      resolve(chosen);
    });
  });
}

const TOOL_BY_NUM: Record<string, Tool> = {
  '1': 'cursor',
  '2': 'claude',
  '3': 'codex',
  '4': 'windsurf',
  '5': 'other',
};

export function askTool(): Promise<Tool> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(
      chalk.dim('\n  AI tool:') +
        ' ' +
        chalk.cyan('1') +
        '=cursor ' +
        chalk.cyan('2') +
        '=claude ' +
        chalk.cyan('3') +
        '=codex ' +
        chalk.cyan('4') +
        '=windsurf ' +
        chalk.cyan('5') +
        '=other'
    );
    rl.question(chalk.dim('  Choose (1–5 or name) ') + chalk.yellow('[1]') + chalk.dim(': '), (answer) => {
      rl.close();
      const trimmed = (answer || '1').trim().toLowerCase();
      const chosen = TOOL_BY_NUM[trimmed] ?? (TOOLS.includes(trimmed as Tool) ? (trimmed as Tool) : 'cursor');
      resolve(chosen);
    });
  });
}
