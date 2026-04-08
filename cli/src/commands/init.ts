import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import figlet from 'figlet';
import type { Platform, Tool } from '../schemas.js';
import { PLATFORMS } from '../schemas.js';
import { askPlatform, askTool, askLayersSource, askCopyLayersTemplate } from '../lib/prompt.js';
import { getTemplatesDir } from '../lib/paths.js';
import { copyRecursive, copyDirExcluding } from '../lib/copy.js';
import { getPromptConfigTemplate } from '../lib/prompt-config-template.js';
import { parseLayersSourceOption } from '../lib/resolve-layers-path.js';
import {
  DEFAULT_DOCS_AUTHORING,
  DEFAULT_LAYERS_SOURCE,
  DEFAULT_LAYERS_MANIFEST,
} from '../lib/layer-paths.js';
import { mergeGitignore } from '../lib/gitignore.js';

const BAR = chalk.dim('  ' + '─'.repeat(44));

function renderBanner(): string {
  const opts = { font: 'Slant' as const, horizontalLayout: 'fitted' as const };
  const promptArt = figlet.textSync('Prompt', opts);
  const guideArt = figlet.textSync('Guide', opts);
  const blue = chalk.blue;
  return blue(promptArt) + '\n' + blue(guideArt);
}

const DEFAULT_PLATFORM: Platform = 'universal';
const DEFAULT_TOOL: Tool = 'cursor';

export type InitOptions = {
  dryRun?: boolean;
  verbose?: boolean;
  yes?: boolean;
  tool?: string;
  /** Canonical layered tree path in prompt.config.js `layers.source` (default `.claude`). Markdown authoring: `docs/prompt-guide/`. */
  layersSource?: string;
  /** If true, do not copy bundled `layers/` into tool folders. */
  skipLayers?: boolean;
  /** @deprecated init copies only to docs/prompt-guide; add extra sync targets in prompt.config.js → layers.initTargets */
  extraLayerTargets?: string[];
};

export async function runInit(
  stackProfileFromOption?: string,
  options: InitOptions & { toolFromOption?: string } = {}
): Promise<void> {
  const { dryRun = false, verbose = false, yes = false, toolFromOption } = options;
  const skipLayersFromCli = options.skipLayers === true;
  const cwd = process.cwd();
  const templatesDir = getTemplatesDir();

  if (!fs.existsSync(templatesDir)) {
    throw new Error('Templates not found. Reinstall @pelagornis/prompt-guide or run from the prompt-guide repo.');
  }

  const isInteractive = process.stdin.isTTY === true;

  let stackProfile: Platform;
  const parsedStack = stackProfileFromOption?.trim().toLowerCase();
  if (parsedStack && (PLATFORMS as readonly string[]).includes(parsedStack)) {
    stackProfile = parsedStack as Platform;
    console.log(chalk.dim('  Stack profile:') + ' ' + chalk.cyan(stackProfile));
  } else if (yes) {
    stackProfile = DEFAULT_PLATFORM;
    console.log(chalk.dim('  Stack profile:') + ' ' + chalk.cyan(stackProfile) + chalk.dim(' (--yes)'));
  } else if (!isInteractive) {
    stackProfile = DEFAULT_PLATFORM;
    console.log(chalk.dim('  Stack profile:') + ' ' + chalk.cyan(stackProfile) + chalk.dim(' (non-interactive, default)'));
  } else {
    stackProfile = await askPlatform();
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

  let layersSource = DEFAULT_LAYERS_SOURCE;
  if (options.layersSource !== undefined && options.layersSource !== '') {
    layersSource = parseLayersSourceOption(options.layersSource);
    console.log(chalk.dim('  layers.source:') + ' ' + chalk.cyan(layersSource) + chalk.dim(' (from CLI)'));
  } else if (yes) {
    layersSource = DEFAULT_LAYERS_SOURCE;
    console.log(chalk.dim('  layers.source:') + ' ' + chalk.cyan(layersSource) + chalk.dim(' (--yes)'));
  } else if (!isInteractive) {
    layersSource = DEFAULT_LAYERS_SOURCE;
    console.log(
      chalk.dim('  layers.source:') + ' ' + chalk.cyan(layersSource) + chalk.dim(' (non-interactive, default)')
    );
  } else {
    layersSource = await askLayersSource();
  }

  let skipLayers = skipLayersFromCli;
  if (skipLayersFromCli) {
    console.log(chalk.dim('  layered templates:') + ' ' + chalk.cyan('skip') + chalk.dim(' (--skip-layers)'));
  } else if (yes) {
    skipLayers = false;
    console.log(chalk.dim('  layered templates:') + ' ' + chalk.cyan('copy') + chalk.dim(' (--yes)'));
  } else if (!isInteractive) {
    skipLayers = false;
    console.log(
      chalk.dim('  layered templates:') + ' ' + chalk.cyan('copy') + chalk.dim(' (non-interactive, default)')
    );
  } else {
    const copyTemplate = await askCopyLayersTemplate();
    skipLayers = !copyTemplate;
  }

  console.log('');
  console.log(renderBanner());
  console.log(chalk.dim('  stack: ') + chalk.cyan(stackProfile) + chalk.dim('  tool: ') + chalk.cyan(tool));
  console.log(
    chalk.dim('  layers.source: ') +
      chalk.cyan(layersSource) +
      (skipLayers ? chalk.dim(' (layer copy skipped)') : '')
  );
  if (dryRun) console.log(chalk.yellow('  [dry-run] No files will be written.\n'));
  else console.log('');

  const promptsSrc = path.join(templatesDir, 'prompts');
  const docsSrc = path.join(templatesDir, 'docs');
  const layersSrc = path.join(templatesDir, 'layers');
  const claudeTemplate = path.join(templatesDir, 'CLAUDE.md');
  const promptsDest = path.join(cwd, 'prompts');
  const docsDest = path.join(cwd, 'docs');
  const claudeDest = path.join(cwd, 'CLAUDE.md');
  const configPath = path.join(cwd, 'prompt.config.js');

  const existing: string[] = [];
  if (fs.existsSync(configPath)) existing.push('prompt.config.js');
  if (fs.existsSync(promptsDest)) existing.push('prompts/');
  if (fs.existsSync(docsDest)) existing.push('docs/');
  if (fs.existsSync(claudeDest)) existing.push('CLAUDE.md');
  if (!skipLayers) {
    const mf = path.join(cwd, DEFAULT_LAYERS_MANIFEST);
    if (fs.existsSync(mf)) existing.push(DEFAULT_LAYERS_MANIFEST);
    const da = path.join(cwd, DEFAULT_DOCS_AUTHORING);
    if (fs.existsSync(da)) existing.push(DEFAULT_DOCS_AUTHORING + '/');
  }
  if (existing.length > 0 && !dryRun) {
    console.log(chalk.yellow('  ⚠ ') + 'Existing: ' + existing.join(', ') + chalk.dim(' (will be overwritten)'));
    console.log('');
  }

  if (dryRun) {
    console.log(chalk.dim('  Would create'));
    console.log(BAR);
    console.log(
      chalk.blue('  →') +
        ' prompt.config.js ' +
        chalk.dim(`(stackProfile=${stackProfile}, tool=${tool}, layers.source=${layersSource})`)
    );
    if (fs.existsSync(promptsSrc)) console.log(chalk.blue('  →') + ' copy prompts/ → ' + promptsDest);
    if (fs.existsSync(docsSrc)) console.log(chalk.blue('  →') + ' copy docs/ → ' + docsDest);
    if (fs.existsSync(claudeTemplate)) console.log(chalk.blue('  →') + ' copy CLAUDE.md → ' + claudeDest);
    if (fs.existsSync(layersSrc) && !skipLayers) {
      console.log(
        chalk.blue('  →') + ' copy ' + DEFAULT_LAYERS_MANIFEST + ' → ' + path.join(cwd, DEFAULT_LAYERS_MANIFEST)
      );
      console.log(
        chalk.blue('  →') +
          ' copy layers/ → ' +
          path.join(cwd, DEFAULT_DOCS_AUTHORING) +
          chalk.dim(' (Markdown authoring; install emits .yml under .claude/, .cursor/, …)')
      );
    }
    console.log(chalk.blue('  →') + ' append .gitignore if needed');
    console.log(BAR);
    console.log(chalk.dim('\n  Then run ') + chalk.cyan('prompt-guide install') + chalk.dim(' to generate tool-specific rules.'));
    console.log('');
    return;
  }

  const configContent = getPromptConfigTemplate(stackProfile, tool, { layersSource });
  fs.writeFileSync(configPath, configContent);

  if (fs.existsSync(promptsSrc)) copyRecursive(promptsSrc, promptsDest);
  if (fs.existsSync(docsSrc)) copyRecursive(docsSrc, docsDest);
  if (fs.existsSync(claudeTemplate)) {
    fs.copyFileSync(claudeTemplate, claudeDest);
  }
  if (fs.existsSync(layersSrc) && !skipLayers) {
    const srcManifest = path.join(layersSrc, DEFAULT_LAYERS_MANIFEST);
    const destManifest = path.join(cwd, DEFAULT_LAYERS_MANIFEST);
    if (fs.existsSync(srcManifest)) {
      fs.copyFileSync(srcManifest, destManifest);
    }
    const exclude = new Set([DEFAULT_LAYERS_MANIFEST]);
    const docsAuthoringDest = path.join(cwd, DEFAULT_DOCS_AUTHORING);
    copyDirExcluding(layersSrc, docsAuthoringDest, exclude);
  }

  const { updated: gitignoreUpdated } = mergeGitignore(cwd, stackProfile);

  if (verbose) {
    console.log(chalk.dim('  Templates from: ') + templatesDir);
  }
  console.log(chalk.dim('  Created'));
  console.log(BAR);
  console.log(
    chalk.green('  ✓') +
      ' prompt.config.js ' +
      chalk.dim(`(stackProfile=${stackProfile}, tool=${tool}, layers.source=${layersSource})`)
  );
  console.log(chalk.green('  ✓') + ' prompts/');
  console.log(chalk.green('  ✓') + ' docs/');
  if (fs.existsSync(claudeTemplate)) {
    console.log(chalk.green('  ✓') + ' CLAUDE.md ' + chalk.dim('(Claude Code root instructions)'));
  }
  if (fs.existsSync(layersSrc) && !skipLayers) {
    if (fs.existsSync(path.join(layersSrc, DEFAULT_LAYERS_MANIFEST))) {
      console.log(chalk.green('  ✓') + ' ' + DEFAULT_LAYERS_MANIFEST + chalk.dim(' (merge order + Cursor list mode)'));
    }
    console.log(
      chalk.green('  ✓') +
        ' ' +
        DEFAULT_DOCS_AUTHORING +
        '/ ' +
        chalk.dim('(edit Markdown here; run install to write .yml under layers.source + mirrors)')
    );
  } else if (skipLayers) {
    console.log(chalk.dim('  · ') + 'skipped layered template copy ' + chalk.dim('(--skip-layers)'));
  } else if (!fs.existsSync(layersSrc)) {
    console.log(chalk.dim('  · ') + 'no bundled layers/ template in this package');
  }
  if (gitignoreUpdated) {
    console.log(chalk.green('  ✓') + ' .gitignore ' + chalk.dim('(appended)'));
  } else {
    console.log(chalk.dim('  · .gitignore already contains prompt-guide block'));
  }
  console.log('');
  console.log(chalk.dim('  Next step'));
  console.log(BAR);
  console.log(chalk.dim('  → ') + 'Run ' + chalk.cyan('prompt-guide install') + chalk.dim(' to generate rules for your AI tool (') + chalk.cyan(tool) + chalk.dim(').'));
  console.log(
    chalk.dim('  → ') +
      'Edit ' +
      chalk.cyan('docs/prompt-guide/**/*.md') +
      chalk.dim(', then ') +
      chalk.cyan('prompt-guide install') +
      chalk.dim(' to generate YAML under .claude/, .cursor/, …')
  );
  console.log('');
}
