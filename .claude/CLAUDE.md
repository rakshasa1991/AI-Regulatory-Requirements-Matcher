# CLAUDE.md

Security policy: follow `.claude/rules/security.md` without exception.
Permissions: enforced via `.claude/settings.json` — do not weaken `permissions.deny`.
Project conventions: see `AGENTS.md` in repository root.

## Rule sources and precedence

1. Explicit user instructions.
2. Security and governance rules from `.cursor/rules/*.mdc`.
3. Repository conventions from `AGENTS.md`.
4. This file and rules under `.claude/rules/`.

If any conflict appears, prioritize security and compliance first.

## Working principles

- Operate as an enterprise coding assistant: safety and reliability over speed.
- Do not suggest unsafe shortcuts; provide a safe alternative.
- Never hardcode secrets, log PII/secrets, or disable TLS/HTTPS verification.
- For code changes, keep clear layering, explicit error handling, tests, and updated docs.
- For skills/rules/hooks/commands documentation updates, avoid full rewrites by default; preserve current style and language, and apply additive or targeted edits unless a direct contradiction requires replacing existing text.

## Mandatory `.cursor/rules` alignment

Treat the following `.cursor/rules` files as source of truth when relevant:

- `00-security.mdc`
- `10-secure-app-architecture-and-dependencies.mdc`
- `15-architect-escalation-and-prohibited-patterns.mdc`
- `16-integration-passport-and-reliability-gate.mdc`
- `17-deploy-containerization-and-runtime-config.mdc`
- `20-project-bootstrap-and-registration.mdc`
- `25-code-quality-tests-docs-logging.mdc`
- `91-no-legacy-converters.mdc`
- `92-docs-no-input-links.mdc`
- `93-folder-transfer-script-and-risk-gate.mdc`
- `94-dotdocs-source-of-docs-artifacts.mdc`
- `11-incremental-governance-edits.mdc`

## Mandatory skill usage from `.cursor/skills`

Before execution, read and apply matching skill instructions from:

- `.cursor/skills/c4-and-sequence-diagrams/SKILL.md`
- `.cursor/skills/architecture-requirements-interviewer/SKILL.md`
- `.cursor/skills/project-folder-layout/SKILL.md`
- `.cursor/skills/dotdocs-documentation-source/SKILL.md`
- `.cursor/skills/dotnet-csharp-standards/SKILL.md`
- `.cursor/skills/authoring-high-quality-skills/SKILL.md`

## Integration and architecture escalation minimum

- For any external integration, state architect approval/escalation is required before implementation.
- Create/update passport: `docs/integrations/integration-passport.{integration-name}.md` from `.docs/integrations/_integration-passport-template.md`.
- Maintain integration log: `docs/integrations/integration-log.{project-name}.md`; active integrations require a passport, removed integrations keep passport history with deletion mark.
- External calls must include timeout, retry (exponential backoff), error handling, safe structured logging, and circuit breaker for critical paths.
- Escalation is mandatory for new storage, public API exposure, sensitive data handling, or ambiguous architecture.

## Documentation and structure constraints

- Keep `docs/` self-contained with no links to `input/` or `.docs/`.
- Use `.docs/` as internal source/templates; use `docs/` as final consumer-facing documentation.
- For modules using `input/docs/output`, follow `project-folder-layout` guidance.

## Claude artifacts sync requirement

When `.cursor` rules/skills change in a task, also review and sync:

- `/.claude/CLAUDE.md`
- Relevant files in `/.claude/rules/`
- Claude references to rules/skills that must match `.cursor`

Enforcement rule: `/.claude/rules/90-sync-claude-with-cursor-skills.md`.