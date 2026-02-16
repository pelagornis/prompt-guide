# Per-platform rules (human-readable)

The actual text used for injection is in **YAML**.  
→ `prompts/rules.by-platform.yml` (tools use `platforms.<name>.prompt`)

- **When applied**: When `platform` in `ai.config.yml` is set to ios, android, flutter, web, or server, that platform’s block is merged after the system role. If `platform: null`, these rules are not applied.
- **When forking**: Use only the blocks for your target platform(s); merge blocks if the project spans multiple platforms.

---

## iOS (Swift / SwiftUI / UIKit)

- Follow project style for Swift naming, indentation, optionals, and error handling. Keep Podfile, SPM, or Carthage lock; do not change versions arbitrarily.
- Consider accessibility (VoiceOver, Dynamic Type), dark mode, and localization. **UI updates on main thread only.**
- Do not store secrets in code or plist. Use Keychain or env only. No PII or tokens in logs.

## Android (Kotlin / Java)

- Follow Kotlin/Java conventions and package layout. Keep Gradle and version catalog in sync; do not change versions arbitrarily.
- Consider a11y (contentDescription, TalkBack), settings, localization, themes. **UI work on Main dispatcher only.**
- Do not store secrets in code or resources. Use Keystore, BuildConfig, or env. No PII in logs or crash reports.

## Flutter (Dart)

- Follow effective_dart and project analysis options. Keep pubspec.lock and version ranges; do not change arbitrarily.
- Consider accessibility (Semantics, labels), responsive layout, localization. Use async/await and Future for async; **keep build synchronous.**
- Do not store secrets in code. Use flutter_dotenv, --dart-define, or native secrets. No secrets or PII in logs.

## Web (JS/TS · React/Vue/Svelte etc.)

- Follow project framework, bundler, and lint rules. Keep package-lock, yarn.lock, or pnpm-lock; do not change arbitrarily.
- Consider a11y (semantics, ARIA, keyboard, focus), responsive layout, i18n. Keep CSR/SSR and hydration consistent.
- Do not ship secrets in client code or build output. Use env or build-time injection. Consider XSS, CORS, CSP. No PII in logs or errors.

## Server (Node/Go/Rust/Java/Python etc.)

- Follow project conventions and directory layout. Keep lockfile, go.sum, Cargo.lock, requirements.txt, etc.; do not change arbitrarily.
- Use a consistent API response shape (e.g. `{ success, data?, error? }`). Apply HTTP 2xx/4xx/5xx, timeouts, rate limits. Long work in queue/background only.
- Do not store secrets in code. Use env or a secret manager. Do not skip input validation, auth, or authorization. No secrets or PII in logs.

## Common (all platforms)

- Add **unit tests** for public API and utilities. Test names: “condition → expected”. Mock only external dependencies.
- Commits: “verb + object”. **One commit = one logical change.** PRs must state reason, how to test, and whether there are breaking changes.
