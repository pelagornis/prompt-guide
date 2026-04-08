import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { runInit } from './commands/init.js';
import { runInstall } from './commands/install.js';
import { runDoctor, printDoctorResults } from './commands/doctor.js';
import { platformSchema, PLATFORMS, toolSchema, TOOLS } from './schemas.js';
import { getVersion } from './lib/paths.js';

function collectLayerTargets(value: string, previous: string[]): string[] {
  return [...previous, value];
}

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
  .description('Prompt Guide — init: prompt.config.js; install: generate tool-specific rules')
  .version(getVersion())
  .option('-v, --verbose', 'Show extra details');

program.addHelpText(
  'before',
  getBanner() + '\n' + chalk.dim('  Set up prompt rules and AI config in your repo.\n\n')
);

program
  .command('init')
  .description('Initialize prompt-guide in the current directory')
  .option(
    '-p, --stack <stackProfile>',
    `Stack profile: ${PLATFORMS.join(' | ')} (omit for interactive). Alias: --platform`,
    (value: string) => {
      const result = platformSchema.safeParse(value?.toLowerCase());
      if (!result.success) {
        throw new Error(result.error.errors.map((e) => e.message).join('; '));
      }
      return result.data;
    }
  )
  .option(
    '--platform <stackProfile>',
    'Deprecated: same as --stack',
    (value: string) => {
      const result = platformSchema.safeParse(value?.toLowerCase());
      if (!result.success) {
        throw new Error(result.error.errors.map((e) => e.message).join('; '));
      }
      return result.data;
    }
  )
  .option(
    '-t, --tool <tool>',
    `AI tool: ${TOOLS.join(' | ')} (omit for interactive)`,
    (value: string) => {
      const result = toolSchema.safeParse(value?.toLowerCase());
      if (!result.success) {
        throw new Error(result.error.errors.map((e) => e.message).join('; '));
      }
      return result.data;
    }
  )
  .option('--dry-run', 'Show what would be done without writing files')
  .option('-y, --yes', 'Non-interactive: use default stack profile (universal) and tool (cursor) when omitted (also used when stdin is not a TTY)')
  .option(
    '--layers-source <path>',
    'Canonical layered tree for install (default: .claude). Written to prompt.config.js as layers.source.'
  )
  .option(
    '--skip-layers',
    'Do not copy the bundled layers/ template into Cursor/Claude/codex/Windsurf folders'
  )
  .option(
    '--layer-target <path>',
    'Extra directory to receive a copy of the layers template (repeatable)',
    collectLayerTargets,
    []
  )
  .action(
    async (opts: {
      stack?: string;
      platform?: string;
      tool?: string;
      dryRun?: boolean;
      yes?: boolean;
      layersSource?: string;
      skipLayers?: boolean;
      layerTarget?: string[];
    }) => {
    try {
      const globalOpts = program.opts();
      const extra = opts.layerTarget ?? [];
      const stackProfile = opts.stack ?? opts.platform;
      await runInit(stackProfile, {
        dryRun: opts.dryRun,
        verbose: globalOpts.verbose,
        yes: opts.yes,
        toolFromOption: opts.tool,
        layersSource: opts.layersSource,
        skipLayers: opts.skipLayers,
        extraLayerTargets: extra,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red('  ✗'), message);
      process.exit(1);
    }
  });

program
  .command('install')
  .description('Generate tool-specific rules from prompt.config.js (run after init or after editing config)')
  .option('--dry-run', 'Show what would be written without writing')
  .action(async (opts: { dryRun?: boolean }) => {
    try {
      const globalOpts = program.opts();
      runInstall({ dryRun: opts.dryRun, verbose: globalOpts.verbose });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red('  ✗'), message);
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Check prompt-guide setup (config, prompts, docs, layers manifest, CLAUDE.md, .gitignore)')
  .option('--fix', 'Append .gitignore block if missing')
  .option('--json', 'Output results as JSON (for scripting)')
  .action((opts: { fix?: boolean; json?: boolean }) => {
    const globalOpts = program.opts();
    const { results, allOk, fixed } = runDoctor(process.cwd(), globalOpts.verbose, opts.fix ?? false);
    printDoctorResults(results, allOk, globalOpts.verbose, fixed, opts.json ?? false);
    process.exit(allOk ? 0 : 1);
  });

program.addHelpText(
  'after',
  `

Examples:
  ${chalk.cyan('npx @pelagornis/prompt-guide init')}              Create prompt.config.js + prompts/ + docs/
  ${chalk.cyan('npx @pelagornis/prompt-guide install')}           Generate rules for your tool (from prompt.config.js)
  ${chalk.cyan('npx @pelagornis/prompt-guide init -y')}           Non-interactive (default: universal, cursor)
  ${chalk.cyan('npx @pelagornis/prompt-guide init --stack=ios --tool=codex')}
  ${chalk.cyan('npx @pelagornis/prompt-guide init --layers-source=docs/pg-layers')}
  ${chalk.cyan('npx @pelagornis/prompt-guide init --layer-target=internal/ai-layers')}
  ${chalk.cyan('npx @pelagornis/prompt-guide init --skip-layers')}
  ${chalk.cyan('npx @pelagornis/prompt-guide install --dry-run')}
  ${chalk.cyan('npx @pelagornis/prompt-guide doctor')}           Check setup health
  ${chalk.cyan('npx @pelagornis/prompt-guide doctor --fix')}    Auto-fix .gitignore

Flow:
  · init — creates prompt.config.js, layers.manifest.yml, CLAUDE.md, prompts/, docs/, layered dirs. Edit config and manifest there.
  · install — reads prompt.config.js and writes tool-specific rules (Cursor, Codex, Windsurf, Claude Code).
`
);

program.parse();
