#!/usr/bin/env node

process.env.FORCE_COLOR = process.env.FORCE_COLOR || '1';
await import('../dist/cli.js');
