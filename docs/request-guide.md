# Request list writing guide

How to **phrase requests** when asking the AI to do work: per-preset tips, how to fill `prompts/guide.template.yml`, and spec/ticket-style requests for the **implement** preset.

---

## Table of contents

- [Request writing principles](#request-writing-principles)
- [Per-preset request tips](#per-preset-request-tips)
- [Template field guide (guide.template.yml)](#template-field-guide-guidetemplateyml)
- [Spec / ticket writing (for implement)](#spec--ticket-writing-for-implement)
- [Examples](#examples)

---

## Request writing principles

| Principle | Description |
|-----------|-------------|
| **Use clear verbs** | Be specific about what to do (e.g. “Add API call on login button click”, “Add null check in this function”) rather than “add something” or “fix it”. |
| **Limit scope** | One logical task per request. Split large work into steps. |
| **Give context** | When useful: file path/line, stack/platform, which rules to follow (e.g. platform rules). |
| **Specify output format** | Saying “code only”, “explanation + code”, or “checklist then code” helps. |

---

## Per-preset request tips

**taskPresets** in `prompt.config.js` change which rules the AI uses. Use the following when phrasing requests.

### default — General coding / editing

- **When to use**: Routine edits, small improvements, behavior-only changes without refactor.
- **How to request**: Name **target (file/function) + task**, e.g. “In this file change ~ to ~”, “Add ~ feature”.

### implement — Implement from spec / ticket

- **When to use**: Implementing a **new feature exactly as specified** in a spec or ticket.
- **How to request**: Paste the **spec/ticket body** or write “Implement the following spec” plus conditions, I/O, and exceptions.
- **Rule of thumb**: Request tests or a test plan as well.

### refactor — Refactoring

- **When to use**: Changing structure/style only; behavior stays the same.
- **How to request**: Explicitly say **behavior must not change**, e.g. “Refactor only ~ without changing behavior”, “Split this module into ~”.

### fix_bug — Bug fix

- **When to use**: **Minimal fix** after finding the cause.
- **How to request**: Describe what happens and expected behavior, e.g. “When ~, ~ happens. Find the cause and fix with minimal change.” Include repro steps if possible.

### review — Code review

- **When to use**: Reviewing a diff/PR.
- **How to request**: “Review this change” or “Apply the checklist (consistency, quality, security, errors, compatibility) to the diff below and give approve / request-changes”.

---

## Template field guide (guide.template.yml)

`prompts/guide.template.yml` defines **structured fields** for task prompts. Copy it, fill the values, and combine them in the `prompt_example` format before sending to the AI.

| Field | Description | Example |
|-------|-------------|---------|
| **platform** | Target platform. | `iOS`, `Web`, `Server` |
| **role** | One-line role for the AI. | “Modify the iOS app in this repo” |
| **context.project** | Project/app name and purpose. | “Member login iOS app” |
| **context.path** | Paths to work in. | `ios/App/`, `src/features/auth/` |
| **context.stack** | Stack in use. | “SwiftUI, Combine” / “React, TypeScript” |
| **context.rules_ref** | Rules to follow. | “rules.by-platform iOS block” |
| **task** | What to do. **Use a clear verb.** | “Show error message in a toast on login failure” |
| **constraints** | Optional constraints. | [“Keep existing API signatures”, “Add tests”] |
| **output.format** | Output format. | “code only” / “explanation + code” / “checklist then code” |
| **output.include** | What to include in output. | “Usage, how to test, caveats” |
| **example** | Optional example. | Existing code snippet or similar screen |

**Example** (after filling fields):

```
Platform: iOS
Role: Modify the iOS app in this repo
Context: Project member app, path ios/App/, stack SwiftUI. Rules: rules.by-platform iOS block
Task: Show error message in a toast on login failure
Constraints: Keep existing API signatures, add tests
Output: format explanation+code, include usage and how to test
Example: (if any)
```

---

## Spec / ticket writing (for implement)

For the **implement** preset, a short spec or ticket works well.

| Item | Content |
|------|---------|
| **Summary** | One line: what you’re building. |
| **Conditions / input** | When it runs (e.g. “On login failure”, “When this API returns 401”). |
| **Expected behavior** | What should happen from the user/system perspective. |
| **Constraints** | Must-haves (e.g. keep existing API, use specific library). |
| **Tests** | “Add unit tests” or “Verify manually with this scenario”. |

For long specs, paste the body and add one line like “Implement the above spec. Add tests.”

---

## Examples

### 1. implement — Single feature

```
[Select implement preset]

Implement the following:

- Summary: Show error message in a toast when login fails
- Condition: When AuthAPI returns 401 or an error message
- Expected: Toast at bottom with server message, auto-dismiss after 3s
- Constraints: Keep existing LoginView structure, reuse existing API call code
- Tests: One unit test for the failure scenario
```

### 2. refactor — Refactor only

```
[Select refactor preset]

Without changing behavior, refactor ios/App/Login/LoginViewModel.swift
into separate methods for: network call, state, input validation.
Ensure existing tests still pass.
```

### 3. fix_bug — Minimal fix

```
[Select fix_bug preset]

App sometimes crashes when going to home after login. Find the cause and fix with minimal change.
Repro: Login success → tap Home tab (roughly 10% of the time).
```

### 4. Using guide.template — Single block

```
Platform: Web
Role: Modify the frontend in this repo
Context: Project dashboard, path src/features/dashboard/, stack React + TypeScript
Task: Add an “today’s tasks” count badge at the top of the dashboard (use existing API /tasks/count)
Constraints: Reuse existing components, keep a11y
Output: explanation + code, include usage and how to test
```

---

This guide works best **together with** the prompt rules (system.core, review, rules-by-platform).  
See [system.core.md](system.core.md), [review.md](review.md), and [rules-by-platform.md](rules-by-platform.md) for rule summaries.
