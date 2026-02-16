#!/usr/bin/env node
/**
 * Copy repo root docs/, prompts/, .cursor/ into cli/ (package root).
 * Run from cli/ in prepublishOnly. No cli/templates/ — only cli/docs, cli/prompts, cli/.cursor.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');
const pkgRoot = path.join(__dirname, '..');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

for (const dir of ['docs', 'prompts', '.cursor']) {
  const src = path.join(repoRoot, dir);
  const dest = path.join(pkgRoot, dir);
  if (fs.existsSync(src)) {
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
    copyRecursive(src, dest);
    console.log('  copied', dir, '-> cli/' + dir);
  }
}
