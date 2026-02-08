import { Command } from 'commander';
import chalk from 'chalk';
import { z } from 'zod';
import { runInit } from './commands/init.js';
import { platformSchema, PLATFORMS } from './schemas.js';

const program = new Command();

program
  .name('prompt-guide')
  .description('Set up prompt-guide in your project: pick platform, copy config, set .gitignore')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize prompt-guide in the current directory')
  .option(
    '-p, --platform <platform>',
    `Platform: ${PLATFORMS.join(' | ')} (omit for interactive)`,
    (value: string) => {
      const result = platformSchema.safeParse(value?.toLowerCase());
      if (!result.success) {
        throw new Error(result.error.errors.map((e) => e.message).join('; '));
      }
      return result.data;
    }
  )
  .action(async (opts: { platform?: string }) => {
    try {
      await runInit(opts.platform);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red('  ✗'), message);
      process.exit(1);
    }
  });

program.addHelpText(
  'after',
  `

Examples:
  ${chalk.cyan('npx prompt-guide-cli init')}              Interactive: asks for platform
  ${chalk.cyan('npx prompt-guide-cli init --platform=ios')}
  ${chalk.cyan('npx prompt-guide-cli init -p flutter')}

What it does:
  · Copies ai/, prompts/, docs/ into the current directory
  · Sets platform in ai/ai.config.yml
  · Appends recommended .gitignore entries
`
);

program.parse();
