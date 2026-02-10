import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { z } from 'zod';
import { runInit } from './commands/init.js';
import { runDoctor, printDoctorResults } from './commands/doctor.js';
import { platformSchema, PLATFORMS } from './schemas.js';

function getBanner(): string {
  const opts = { font: 'Slant' as const, horizontalLayout: 'fitted' as const };
  const promptArt = figlet.textSync('Prompt', opts);
  const guideArt = figlet.textSync('Guide', opts);
  const blue = chalk.blue;
  return blue(promptArt) + '\n' + blue(guideArt);
}

const program = new Command();

program
  .name('prompt-guide')
  .description('Prompt Guide — set up in your project: pick platform, copy config, set .gitignore')
  .version('1.0.0')
  .option('-v, --verbose', 'Show extra details');

program.addHelpText(
  'before',
  getBanner() + '\n' + chalk.dim('  Set up prompt rules and AI config in your repo.\n\n')
);

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
  .option('--dry-run', 'Show what would be done without writing files')
  .action(async (opts: { platform?: string; dryRun?: boolean }) => {
    try {
      const globalOpts = program.opts();
      await runInit(opts.platform, {
        dryRun: opts.dryRun,
        verbose: globalOpts.verbose,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red('  ✗'), message);
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Check prompt-guide setup (ai/, config, prompts/, docs/, .gitignore)')
  .option('--fix', 'Append .gitignore block if missing')
  .action((opts: { fix?: boolean }) => {
    const globalOpts = program.opts();
    const { results, allOk, fixed } = runDoctor(process.cwd(), globalOpts.verbose, opts.fix ?? false);
    printDoctorResults(results, allOk, globalOpts.verbose, fixed);
    process.exit(allOk ? 0 : 1);
  });

program.addHelpText(
  'after',
  `

Examples:
  ${chalk.cyan('npx prompt-guide-cli init')}              Interactive: asks for platform
  ${chalk.cyan('npx prompt-guide-cli init --platform=ios')}
  ${chalk.cyan('npx prompt-guide-cli init -p flutter')}
  ${chalk.cyan('npx prompt-guide-cli init --dry-run')}    Show planned changes only
  ${chalk.cyan('npx prompt-guide-cli doctor')}            Check setup health

What init does:
  · Copies ai/, prompts/, docs/ into the current directory
  · Sets platform in ai/ai.config.yml
  · Appends recommended .gitignore entries
`
);

program.parse();
