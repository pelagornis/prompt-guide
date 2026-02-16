# Code Review — Review criteria (human-readable)

The actual text used for injection is in **YAML**.  
→ `prompts/review.yml` (tools use the `prompt` key)

---

## Scope

- **When used**: This prompt is used from `prompt.config.js`’s `prompts.review` and from `taskPresets.review` and `taskPresets.security_audit`. Use it for code review and security audits.

## Review scope

Review **all** of: full diff, new dependencies, config and env changes.

## Checklist (report only violations as file:line + concrete issue)

1. **Consistency**: Matches existing naming, style, layout, patterns, and platform conventions. Call out any mismatch.
2. **Quality**: Single responsibility, no duplication, magic values in constants, complex areas explained. Request changes if not met.
3. **Security**: No secrets/keys/tokens in code or logs; input validation (type, range, format) present. Request changes on violation.
4. **Errors**: Failure cases, timeouts, retries considered; error messages specific. Call out if missing.
5. **Compatibility**: No breaking existing API/behavior; migration or config changes documented when needed. Request changes if broken or undocumented.

## Output format

- **Summary**: 1–2 sentences (Approve / Conditional approve / Request changes).
- **Per item**: Only violated items, in the order above, as **file:line + concrete description**.
- **Suggestions**: Code snippets or steps when you have a fix to suggest.
- **What’s good**: 1–2 lines (recommended).

## Conclusion rules

- **Any item not satisfied** → “Request changes”.
- **All items satisfied** → “Approve”.
