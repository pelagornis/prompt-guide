import readline from 'node:readline';
import chalk from 'chalk';
import { PLATFORMS, type Platform } from '../schemas.js';

const BY_NUM: Record<string, Platform> = {
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
    rl.question(chalk.dim('  Choose (1–5 or name) ') + chalk.yellow('[1]') + chalk.dim(': '), (answer) => {
      rl.close();
      const trimmed = (answer || '1').trim().toLowerCase();
      const chosen = BY_NUM[trimmed] ?? (PLATFORMS.includes(trimmed as Platform) ? (trimmed as Platform) : 'ios');
      resolve(chosen);
    });
  });
}
