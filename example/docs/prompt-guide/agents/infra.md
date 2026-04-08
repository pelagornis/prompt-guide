# Agent — operations and delivery

Apply when changing **how the system is built, deployed, observed, or operated**: CI/CD, containers, cloud or bare-metal resources, networking, feature flags, monitoring, logging pipelines, or **operational** secrets handling.

MUST: Secrets only via approved stores and patterns for this org; never commit credentials.
MUST: Changes are reproducible (automation, IaC, or documented runbooks).
MUST: Consider rollback, health checks, blast radius, and cost.
SHOULD: Align with `memory/decisions.md` for platform and tooling choices.
