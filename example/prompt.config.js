/**
 * Prompt Guide config — sample for testing (example folder)
 * Run `prompt-guide install` to generate tool-specific rules.
 */
module.exports = {
  tool: 'cursor',
  platform: 'web',

  model: {
    default: 'claude-sonnet-4',
    options: ['claude-sonnet-4', 'claude-opus-4', 'gpt-4o', 'gpt-4o-mini'],
  },

  context: {
    include: ['src/**', 'lib/**', 'app/**', 'packages/**'],
    exclude: [
      '**/.env', '**/.env.*', '**/secrets/**', '**/*secret*', '**/*credentials*',
      '**/*.pem', '**/*.key', '**/node_modules/**', '**/dist/**', '**/build/**',
      '**/.next/**', '**/out/**', '**/.git/**', '**/.cache/**', '**/vendor/**',
    ],
    max_files: 50,
    max_tokens: 8000,
  },

  prompts: {
    default: 'prompts/system.core.yml',
    review: 'prompts/review.yml',
  },

  taskPresets: {
    default: { description: 'General coding with full system rules', prompt: 'prompts/system.core.yml' },
    review: { description: 'Code review with checklist', prompt: 'prompts/review.yml', model: 'claude-sonnet-4' },
    refactor: { description: 'Refactor only; preserve behavior', prompt: 'prompts/system.core.yml', rules_extra: ['Change behavior only when requested; preserve semantics.', 'Prefer small, incremental steps.'] },
    implement: { description: 'Implement from spec/ticket', prompt: 'prompts/system.core.yml', rules_extra: ['Implement exactly what is specified.', 'Add tests or test plan.'] },
    fix_bug: { description: 'Locate and fix with minimal change', prompt: 'prompts/system.core.yml', rules_extra: ['Identify root cause before changing code.', 'Minimal diff; no refactors unless required.'] },
    security_audit: { description: 'Security-focused review', prompt: 'prompts/review.yml', rules_extra: ['Focus on: secrets, input validation, auth, sensitive data in logs.'] },
  },

  platforms: {
    ios: { label: 'iOS', context: { include: ['ios/**', '*.xcodeproj/**', 'Shared/**', 'src/**'] }, rules_key: 'ios' },
    android: { label: 'Android', context: { include: ['android/**', 'app/**', 'lib/**', 'src/**'] }, rules_key: 'android' },
    flutter: { label: 'Flutter', context: { include: ['lib/**', 'ios/**', 'android/**', 'test/**', 'pubspec.yaml'] }, rules_key: 'flutter' },
    web: { label: 'Web', context: { include: ['src/**', 'public/**', 'app/**', '*.config.js', '*.config.ts'] }, rules_key: 'web' },
    server: { label: 'Server', context: { include: ['src/**', 'lib/**', 'app/**', 'internal/**', 'cmd/**'] }, rules_key: 'server' },
  },

  rules: {
    no_auto_scan: true,
    deterministic: true,
    strict: true,
    no_hallucination: true,
    cite_sources: true,
    require_file_refs: true,
    stay_in_scope: true,
    no_unsolicited_changes: true,
  },
};
