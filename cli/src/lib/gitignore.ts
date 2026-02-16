import fs from 'node:fs';
import path from 'node:path';
import type { Platform } from '../schemas.js';

const MARKER = '# prompt-guide (added by prompt-guide-cli)';

const COMMON = `# prompt-guide common
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
prompt.config.local.js
*.local.yml
# Logs / temp
*.log
tmp/
temp/
.cache/
# Dependencies
node_modules/
`;

const BY_PLATFORM: Record<Platform, string> = {
  ios: `# prompt-guide (iOS)
# Xcode / CocoaPods
Pods/
build/
DerivedData/
*.xcworkspace/xcuserdata/
*.xcodeproj/xcuserdata/
*.xcodeproj/project.xcworkspace/xcuserdata/
Carthage/Build/
`,
  android: `# prompt-guide (Android)
# Gradle / Android
build/
.gradle/
local.properties
*.iml
.cxx/
capture/
`,
  flutter: `# prompt-guide (Flutter)
# Dart / Flutter
.dart_tool/
.packages
build/
.flutter-plugins
.flutter-plugins-dependencies
*.iml
`,
  web: `# prompt-guide (Web)
# Build output
dist/
.next/
out/
.nuxt/
.output/
.vuepress/dist
.parcel-cache/
.vite/
*.local
`,
  server: `# prompt-guide (Server)
# Python
venv/
.venv/
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/
# Go
vendor/
# Rust
target/
# Terraform
.terraform/
*.tfstate*
`,
};

export function getGitignoreForPlatform(platform: Platform): string {
  return `${MARKER}\n${COMMON}\n${BY_PLATFORM[platform]}`;
}

export function mergeGitignore(cwd: string, platform: Platform): { updated: boolean } {
  const gitignorePath = path.join(cwd, '.gitignore');
  let existing = '';
  if (fs.existsSync(gitignorePath)) {
    existing = fs.readFileSync(gitignorePath, 'utf8');
    if (existing.includes(MARKER)) return { updated: false };
    existing = existing.trimEnd() + '\n\n';
  }
  fs.writeFileSync(gitignorePath, existing + getGitignoreForPlatform(platform));
  return { updated: true };
}
