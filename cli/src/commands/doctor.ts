import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import type { Platform } from '../schemas.js';
import { findConfigPath, loadPromptConfig } from '../lib/load-config.js';
import { mergeGitignore } from '../lib/gitignore.js';
import { readPromptFromYaml } from '../lib/read-prompts.js';

const GITIGNORE_MARKER = '# prompt-guide (added by prompt-guide-cli)';
const PLATFORMS: Platform[] = ['ios', 'android', 'flutter', 'web', 'server'];

const BAR = chalk.dim('  ' + '─'.repeat(44));

export type DoctorResult = { ok: boolean; message: string; hint?: string };

function getPlatformFromCwd(cwd: string): Platform {
  const configPath = findConfigPath(cwd);
  if (!configPath) return 'web';
  try {
    const config = loadPromptConfig(cwd);
    const p = (config.platform || 'web').toLowerCase();
    return PLATFORMS.includes(p as Platform) ? (p as Platform) : 'web';
  } catch {
    return 'web';
  }
}

export function runDoctor(
  cwd: string,
  verbose: boolean,
  fix: boolean
): { results: DoctorResult[]; allOk: boolean; fixed: string[] } {
  const fixed: string[] = [];
  const results: DoctorResult[] = [];
  const configPath = findConfigPath(cwd);
  const promptsDir = path.join(cwd, 'prompts');
  const docsDir = path.join(cwd, 'docs');
  const gitignorePath = path.join(cwd, '.gitignore');

  if (configPath) {
    try {
      const config = loadPromptConfig(cwd);
      const tool = config.tool || 'cursor';
      results.push({ ok: true, message: `prompt.config.js exists (tool=${tool})` });
      // Check that prompt files referenced in config exist
      const defaultPath = config.prompts?.default ?? 'prompts/system.core.yml';
      const reviewPath = config.prompts?.review ?? 'prompts/review.yml';
      for (const [label, relPath] of [
        ['prompts.default', defaultPath],
        ['prompts.review', reviewPath],
      ] as const) {
        try {
          readPromptFromYaml(cwd, relPath);
        } catch {
          results.push({
            ok: false,
            message: `Prompt file missing: ${relPath}`,
            hint: `Create the file or fix ${label} in prompt.config.js`,
          });
        }
      }
    } catch {
      results.push({ ok: false, message: 'prompt.config.js invalid or failed to load', hint: 'Fix exports or run: prompt-guide init' });
    }
  } else {
    results.push({ ok: false, message: 'prompt.config.js not found', hint: 'Run: prompt-guide init' });
  }

  if (!fs.existsSync(promptsDir)) {
    results.push({ ok: false, message: 'prompts/ directory missing', hint: 'Run: prompt-guide init' });
  } else {
    results.push({ ok: true, message: 'prompts/ directory exists' });
  }

  if (!fs.existsSync(docsDir)) {
    results.push({ ok: false, message: 'docs/ directory missing', hint: 'Run: prompt-guide init' });
  } else {
    results.push({ ok: true, message: 'docs/ directory exists' });
  }

  if (!fs.existsSync(gitignorePath)) {
    if (fix) {
      const platform = getPlatformFromCwd(cwd);
      mergeGitignore(cwd, platform);
      fixed.push('.gitignore (created)');
      results.push({ ok: true, message: '.gitignore created with prompt-guide block (--fix)' });
    } else {
      results.push({
        ok: false,
        message: '.gitignore missing',
        hint: 'Run: prompt-guide doctor --fix to create with recommended entries',
      });
    }
  } else {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes(GITIGNORE_MARKER)) {
      if (fix) {
        const platform = getPlatformFromCwd(cwd);
        const { updated } = mergeGitignore(cwd, platform);
        if (updated) {
          fixed.push('.gitignore');
          results.push({ ok: true, message: '.gitignore prompt-guide block appended (--fix)' });
        } else {
          results.push({
            ok: false,
            message: '.gitignore has no prompt-guide block',
            hint: 'Run: prompt-guide doctor --fix',
          });
        }
      } else {
        results.push({
          ok: false,
          message: '.gitignore has no prompt-guide block',
          hint: 'Run: prompt-guide doctor --fix to append recommended entries',
        });
      }
    } else {
      results.push({ ok: true, message: '.gitignore has prompt-guide block' });
    }
  }

  const allOk = results.every((r) => r.ok);
  return { results, allOk, fixed };
}

export function printDoctorResults(
  results: DoctorResult[],
  allOk: boolean,
  verbose: boolean,
  fixed: string[] = [],
  json = false
): void {
  if (json) {
    const out = {
      ok: allOk,
      results: results.map((r) => ({ ok: r.ok, message: r.message, hint: r.hint })),
      fixed,
    };
    console.log(JSON.stringify(out, null, 0));
    return;
  }
  console.log(chalk.dim('  Doctor') + ' — checking prompt-guide setup\n');
  console.log(BAR);
  for (const r of results) {
    const icon = r.ok ? chalk.green('  ✓') : chalk.red('  ✗');
    const msg = r.ok ? chalk.dim(r.message) : r.message;
    console.log(icon + ' ' + msg);
    if (!r.ok && r.hint && (verbose || !allOk)) console.log(chalk.dim('    → ' + r.hint));
  }
  console.log(BAR);
  if (fixed.length > 0) {
    console.log(chalk.green('\n  Fixed: ') + fixed.join(', '));
  }
  if (allOk) {
    console.log(chalk.green('\n  All checks passed.\n'));
  } else {
    console.log(chalk.yellow('\n  Fix the items above, or run doctor --fix to auto-fix .gitignore.\n'));
  }
}
