import fs from 'node:fs';
import path from 'node:path';

const MARKER = '# prompt-guide (added by prompt-guide-cli)';

export const GITIGNORE_APPEND = `${MARKER}
# OS
.DS_Store
Thumbs.db
# Editor / IDE
.idea/
*.swp
*.swo
*~
# Local env / secrets
.env
.env.*
!.env.example
# Local config overrides
ai/ai.config.local.yml
*.local.yml
# Logs / temp
*.log
tmp/
temp/
.cache/
# Dependencies
node_modules/
`;

export function mergeGitignore(cwd: string): { updated: boolean } {
  const gitignorePath = path.join(cwd, '.gitignore');
  let existing = '';
  if (fs.existsSync(gitignorePath)) {
    existing = fs.readFileSync(gitignorePath, 'utf8');
    if (existing.includes(MARKER)) return { updated: false };
    existing = existing.trimEnd() + '\n\n';
  }
  fs.writeFileSync(gitignorePath, existing + GITIGNORE_APPEND);
  return { updated: true };
}
