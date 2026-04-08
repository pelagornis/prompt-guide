# Action — reviewing

Use this mode for **code review** (PRs, diffs, security pass).

## Scope (required review targets)

MUST: Review all of — full diff, new dependencies, config and env changes.

## Checklist (report only violations as file:line + concrete issue; omit passing items)

1. **Consistency:** Match existing naming, style, layout, patterns, and **this repository’s** conventions (whatever stack or layout it uses). Call out mismatches.
2. **Quality:** Single responsibility, no duplication, magic values extracted, complex areas explained. Request changes if not met.
3. **Security:** No secrets in code or logs; input validation and trust boundaries where needed. Request changes on violation.
4. **Errors:** Failure cases, timeouts, retries, resource behavior; specific error messages. Call out gaps.
5. **Compatibility:** No breaking public contract or observable behavior without migration or documentation. Request changes if broken or undocumented.

## Output format (required)

MUST: Summary in 1–2 sentences (Approve / Conditional approve / Request changes).
MUST: Only violated items, in the order above, as file:line and description.
MUST: If you suggest a fix, provide snippet or steps.
SHOULD: One or two lines on what is good.

If any item fails, conclude **Request changes**. **Approve** only when all items pass.
