---
description: Применять набор governance-правил и skill-триггеров из .cursor как обязательный baseline для Claude
alwaysApply: true
---

# Выравнивание Claude с `.cursor`

Claude в этом репозитории обязан рассматривать правила и скиллы Cursor как основной нормативный baseline.

## Правила (обязательные источники)

Всегда учитывай содержимое:

- `.cursor/rules/00-security.mdc`
- `.cursor/rules/10-secure-app-architecture-and-dependencies.mdc`
- `.cursor/rules/11-incremental-governance-edits.mdc`
- `.cursor/rules/15-architect-escalation-and-prohibited-patterns.mdc`
- `.cursor/rules/16-integration-passport-and-reliability-gate.mdc`
- `.cursor/rules/17-deploy-containerization-and-runtime-config.mdc`
- `.cursor/rules/20-project-bootstrap-and-registration.mdc`
- `.cursor/rules/25-code-quality-tests-docs-logging.mdc`
- `.cursor/rules/91-no-legacy-converters.mdc`
- `.cursor/rules/92-docs-no-input-links.mdc`
- `.cursor/rules/93-folder-transfer-script-and-risk-gate.mdc`
- `.cursor/rules/94-dotdocs-source-of-docs-artifacts.mdc`

## Скиллы (обязательные триггеры)

Если задача попадает в область одного из скиллов, сначала прочитай и примени `SKILL.md`:

- `.cursor/skills/c4-and-sequence-diagrams/SKILL.md`
- `.cursor/skills/architecture-requirements-interviewer/SKILL.md`
- `.cursor/skills/project-folder-layout/SKILL.md`
- `.cursor/skills/dotdocs-documentation-source/SKILL.md`
- `.cursor/skills/dotnet-csharp-standards/SKILL.md`
- `.cursor/skills/authoring-high-quality-skills/SKILL.md`

## Конфликт правил

Если правила конфликтуют, приоритет:

1. Безопасность и compliance (`00-security.mdc`).
2. Остальные `.cursor/rules/*`.
3. Локальные уточнения Claude в `.claude/`.
4. Явная инструкция пользователя.
