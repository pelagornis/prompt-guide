import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import type { Platform } from '../schemas.js';
import { mergeGitignore } from '../lib/gitignore.js';

const GITIGNORE_MARKER = '# prompt-guide (added by prompt-guide-cli)';
const PLATFORMS: Platform[] = ['ios', 'android', 'flutter', 'web', 'server'];

const BAR = chalk.dim('  ' + '─'.repeat(44));

export type DoctorResult = { ok: boolean; message: string; hint?: string };

function getPlatformFromConfig(cwd: string): Platform {
  const configPath = path.join(cwd, 'ai', 'ai.config.yml');
  if (!fs.existsSync(configPath)) return 'web';
  const content = fs.readFileSync(configPath, 'utf8');
  const m = content.match(/^platform:\s*(\w+)/m);
  const value = m?.[1]?.toLowerCase();
  return value && PLATFORMS.includes(value as Platform) ? (value as Platform) : 'web';
}

export function runDoctor(
  cwd: string,
  verbose: boolean,
  fix: boolean
): { results: DoctorResult[]; allOk: boolean; fixed: string[] } {
  const fixed: string[] = [];
  const results: DoctorResult[] = [];
  const aiDir = path.join(cwd, 'ai');
  const configPath = path.join(cwd, 'ai', 'ai.config.yml');
  const promptsDir = path.join(cwd, 'prompts');
  const docsDir = path.join(cwd, 'docs');
  const gitignorePath = path.join(cwd, '.gitignore');

  if (!fs.existsSync(aiDir)) {
    results.push({ ok: false, message: 'ai/ directory missing', hint: 'Run: prompt-guide init' });
  } else {
    results.push({ ok: true, message: 'ai/ directory exists' });
  }

  if (!fs.existsSync(configPath)) {
    results.push({ ok: false, message: 'ai/ai.config.yml missing', hint: 'Run: prompt-guide init' });
  } else {
    const content = fs.readFileSync(configPath, 'utf8');
    const hasPlatform = /^platform:\s*(\w+|null)/m.test(content);
    const hasContext = /^context:/m.test(content) || /context:\s*\n/m.test(content);
    if (!hasPlatform || !hasContext) {
      results.push({
        ok: false,
        message: 'ai/ai.config.yml invalid or incomplete',
        hint: 'Should contain "platform:" and "context:"',
      });
    } else {
      results.push({ ok: true, message: 'ai/ai.config.yml valid' });
    }
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
      const platform = getPlatformFromConfig(cwd);
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
        const platform = getPlatformFromConfig(cwd);
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
  fixed: string[] = []
): void {
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
