# Agent — user-facing surfaces

Apply when changing **interfaces people or other systems interact with directly**: UI, CLI output, API contracts consumed by clients, reports, notifications, or **client-resident** state and routing.

MUST: Preserve accessibility and usability baselines (labels, focus, keyboard or equivalent). Do not remove without explicit user approval.
MUST: Match existing interaction and visual patterns; avoid one-off behavior that breaks consistency.
MUST: Handle loading, empty, and error states for user-visible flows.
SHOULD: Respect `context/product.md` for priorities and tone.
