# Action — debugging

Use this mode for **incidents, flakes, and regressions**.

MUST: Reproduce or narrow before large refactors.
MUST: Identify root cause; avoid symptom-only fixes.
MUST: Minimal fix that addresses the cause; avoid unrelated cleanup in the same change unless necessary.
MUST: Add a guard (test, assertion, log) when the bug class is likely to recur.
SHOULD: Document the failure mode in `memory/bugs.md` if it was non-obvious.

Prefer evidence: logs, stack traces, failing test, bisect. State hypotheses and how you falsified them.
