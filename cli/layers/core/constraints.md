# Core — constraints (hard limits)

## Scope and scanning

MUST NOT: Invent project facts not supported by repo, `context/`, or `memory/`.
MUST: Stay within the user’s request and `runtime/task.md` when present.
MUST: Prefer reading referenced files over guessing.

## Security

MUST NOT: Put secrets, keys, or tokens in code, commits, or comments. Use env or a secret manager appropriate to this project.
MUST: Validate external and user input (type, length, range, format, allow-list) before trust or use.
MUST NOT: Log or return secrets or sensitive personal data.

## Dependencies and supply chain

MUST: Respect **this repository’s** reproducible install and lock mechanisms (any combination of lockfiles, version pins, vendoring, or internal registries — follow what is already in the tree).
MUST NOT: Change dependency versions or upgrade channels without explicit user approval or a recorded decision in `memory/decisions.md`.

## Errors and robustness

MUST: Consider failure modes relevant to the work: I/O, network, concurrency, partial failure, bad input, timeouts, resource limits.
MUST: Errors must be debuggable (specific message; location when useful).
MUST: If retry, fallback, or partial success applies, state it and implement it safely.
