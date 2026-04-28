# AGENTS.md

Security policy is defined in `.cursor/rules/00-security.mdc` and `.claude/rules/security.md`.
Follow it without exception. Do not commit secrets. Do not run `git push` without explicit request.

**`.gitlab-ci.yml` immutable security block:** the first 9 lines of `.gitlab-ci.yml` (include directives for `secret-detection` and `kics`, stages `[secrets, lint]`, and surrounding comment delimiters) are **read-only**. Never delete, edit, reorder, or comment out any of these lines. Only append new content below the block. See `.cursor/rules/01-gitlab-ci-immutable-security-block.mdc` for details.

## Project

<!-- Fill in: brief project description, business context -->

## Tech stack

<!-- Fill in: languages, frameworks, databases, key libraries -->

## Commands

<!-- Fill in: build, test, lint, migration commands -->

## Code conventions

- Validate inputs at boundaries. Use parameterized DB queries. Escape HTML output.
- No `eval()` / `exec()` / `Function()` with dynamic data. No secrets in code.
- Small focused functions and files. No debug output in commits. Tests before or with implementation.
- Conventional commits: `feat` `fix` `refactor` `docs` `test` `chore` `perf` `ci`.

## Architecture and documentation workflow

- Before creating or editing C4 diagrams (context, container, component, deployment) and UML sequence diagrams (including Mermaid `sequenceDiagram`), read and follow `.cursor/skills/c4-and-sequence-diagrams/SKILL.md`.
- Use `.cursor/skills/c4-and-sequence-diagrams/reference.md` for notation details, labeling patterns, and palette guidance.
- Apply these diagram rules to all architecture artifacts in the repository, including outputs from `generate-architecture-artifacts-from-spec`.
- After generating `docs/` with `generate-architecture-artifacts-from-spec`, use `.cursor/skills/architecture-requirements-interviewer/SKILL.md` to close requirement gaps when needed.
- Survey file naming and path follow repository conventions (often `interviewer-survey.md`). For each interview round, create `input/proposals/<theme>-proposal.md`, ask the user to fill it, then after explicit completion confirmation merge answers into the survey file and update requirements in `docs/` (and source spec files outside `docs/` when needed).
- For modules structured as `input/`, `docs/`, and `output/`, follow `.cursor/skills/project-folder-layout/SKILL.md` and `.cursor/skills/project-folder-layout/reference.md`.
- In markdown files under `docs/`, do not add links to `input/` paths (including `../input/...` and any equivalent references). Keep `docs/` self-contained; if needed, place source-path references outside `docs/` content (e.g. module README or user response) or duplicate required wording inside `docs/`.
- Exception: only allow `docs/` links to `input/` if the repository explicitly overrides this rule. For docs-only changes, also follow `.cursor/rules/92-docs-no-input-links.mdc`.
