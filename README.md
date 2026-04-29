# AI-ассистент сопоставления регуляторных требований

AI-powered assistant for mapping regulatory requirements to SOPs and identifying compliance gaps.

## Описание проекта

Приложение помогает компаниям фармацевтической и медицинской отрасли сопоставлять регуляторные требования (FDA, EMA, ICH) с внутренними документами (SOP, Policies, Templates). Система автоматически анализирует контент, выявляет пробелы в соответствии и генерирует отчёты для подготовки к аудитам.

## Технический стек

### Frontend
- **Next.js** 14.2.15 — React framework с App Router
- **React** 18.3.1
- **TypeScript** 5.6.3
- **TailwindCSS** 3.4.14 — утилитарный CSS
- **shadcn/ui** — компоненты UI
- **TanStack Query** 5.59.0 — серверное состояние
- **React Hook Form** 7.53.0 — формы
- **Recharts** 2.13.0 — визуализация данных

### Backend
- **Next.js API Routes** — серверные endpoints
- **Prisma** 5.20.0 — ORM для PostgreSQL
- **OpenAI SDK** 4.67.0 — интеграция с OpenRouter AI
- **Prisma Client** — генерируется во время build на Vercel

### AI
- **OpenRouter** — доступ к GPT-4o-mini и другим моделям

### Тестирование
- **Vitest** 2.1.3 — юнит тесты
- **Playwright** 1.48.0 — E2E тесты
- **Testing Library** — тестирование компонентов

### DevOps
- **Docker** & **docker-compose** — контейнеризация (локальная разработка)
- **Vercel** — production деплой

## Архитектура

```
Next.js (App Router) + Prisma ORM + PostgreSQL + OpenRouter AI
```

- **Frontend**: React компоненты с использованием shadcn/ui
- **Backend**: Next.js API Routes для CRUD операций
- **Database**: PostgreSQL с Prisma ORM
- **AI**: OpenRouter Gateway для LLM запросов

## Структура проекта

```
├── src/
│   ├── app/              # Next.js App Router страницы и API routes
│   │   ├── api/          # API endpoints
│   │   │   ├── documents/ # CRUD для документов
│   │   │   └── health/    # Health check
│   │   └── documents/     # Страница управления документами
│   ├── components/       # React компоненты
│   ├── lib/             # Утилиты и конфигурация
│   │   ├── chunker.ts   # Разбивка документов на фрагменты
│   │   └── validators.ts # Zod схемы валидации
│   └── types/           # TypeScript типы
├── docs/
│   └── integrations/    # Паспорта интеграций
├── prisma/
│   ├── schema.prisma    # Схема базы данных
│   └── seed.ts          # Синтетические данные для разработки
├── tests/
│   ├── unit/            # Юнит тесты
│   └── e2e/             # E2E тесты
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Docker Compose конфигурация
└── package.json         # Зависимости и скрипты
```

## ENV-переменные

| Переменная | Обязательна | Описание |
|------------|-------------|----------|
| `NODE_ENV` | Нет | Окружение (development/production) |
| `NEXT_PUBLIC_APP_URL` | Нет | Public URL приложения |
| `DATABASE_URL` | **Да** | Строка подключения к PostgreSQL |
| `OPENROUTER_API_KEY` | **Да** | API ключ OpenRouter |
| `OPENROUTER_MODEL` | Нет | AI модель (default: openai/gpt-4o-mini) |
| `OPENROUTER_BASE_URL` | Нет | Base URL для OpenRouter (default: https://openrouter.ai/api/v1) |
| `AI_TIMEOUT_MS` | Нет | Таймаут AI запросов (default: 30000) |
| `AI_MAX_RETRIES` | Нет | Максимальное количество повторений (default: 2) |
| `MAX_DOCUMENT_CHARS` | Нет | Лимит символов в документе (default: 50000) |
| `MAX_REQUIREMENTS_PER_SET` | Нет | Лимит требований в наборе (default: 100) |
| `POSTGRES_USER` | Нет | Пользователь PostgreSQL (default: regmatch) |
| `POSTGRES_PASSWORD` | **Да** | Пароль PostgreSQL |
| `POSTGRES_DB` | Нет | Имя базы данных (default: regmatch) |
| `PRISMA_DATABASE_URL` | Нет | Альтернативная строка подключения для Prisma |

## Локальный запуск

### Предварительные требования
- Node.js 18+
- PostgreSQL 15+
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd ai-reg-assistant
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp .env.example .env.local
```
Отредактируйте `.env.local` и добавьте:
- `DATABASE_URL` — строка подключения к PostgreSQL
- `OPENROUTER_API_KEY` — API ключ для OpenRouter

4. **Инициализируйте базу данных**
```bash
npm run db:generate
npm run db:migrate
```

5. **Запустите разработческую среду**
```bash
npm run dev
```

Приложение доступно по адресу: http://localhost:3000

## Docker запуск

```bash
# Запустить базу данных и приложение
docker compose up --build

# Приложение доступно на порту 3000
# База данных доступна на порту 5432
```

## Деплой

### Vercel (Production)

Проект деплоится на Vercel с автоматической генерацией Prisma Client.

**URL приложения:** https://ai-regulatory-requirements-matcher.vercel.app

#### Требования для деплоя:

1. **Подключить GitHub репозиторий** в Vercel Dashboard
2. **Добавить переменные окружения:**
   - `DATABASE_URL` — строка подключения к PostgreSQL (Prisma Data Cloud или другая БД)
   - `OPENROUTER_API_KEY` — API ключ OpenRouter
   - `NEXT_PUBLIC_APP_URL` — URL приложения после деплоя
   - `OPENROUTER_MODEL` — модель (опционально, default: openai/gpt-4o-mini)

3. **Запустить миграции** после первого деплоя:
   ```bash
   npx prisma migrate deploy
   ```

4. **Загрузить seed-данные** (опционально):
   ```bash
   npx prisma db seed
   ```

#### Build Command

В `package.json` настроен:
```json
"build": "prisma generate && next build"
```

Это гарантирует, что Prisma Client генерируется во время build на Vercel.

### Dokploy (Self-hosted)

Для деплоя на Dokploy см. [DEPLOY.md](./DEPLOY.md)

## Скрипты

```bash
npm run dev          # Запуск разработческого сервера
npm run build        # Production build
npm run start        # Запуск production сервера
npm run lint         # ESLint проверка
npm run test         # Юнит тесты
npm run test:watch   # Юнит тесты в режиме watch
npm run test:e2e     # E2E тесты
npm run db:generate  # Генерация Prisma client
npm run db:migrate   # Запуск миграций
npm run db:seed      # Заполнение базы тестовыми данными
npm run db:studio    # Запуск Prisma Studio
```

## База данных

### Схема

Проект использует PostgreSQL с Prisma ORM. Основные модели:

- **Document** — внутренние документы (SOP, Policy, ICH Guidelines)
- **DocumentChunk** — фрагменты документов для анализа
- **RequirementSet** — наборы регуляторных требований
- **Requirement** — отдельные требования с категорией и критичностью
- **Mapping** — сопоставления требований с документами
- **GapReport** — отчёты о пробелах в соответствии
- **GapItem** — элементы отчёта о пробелах

### Enums

- `DocumentType`: SOP, Policy, Template, ICHGuideline
- `Criticality`: Critical, High, Medium, Low
- `RequirementCategory`: Safety, Efficacy, Quality, Labeling, Administrative, Other
- `CoverageStatus`: Covered, Partial, Gap, Unmapped
- `GapType`: Missing, Contradictory, Partial, Outdated
- `GapSeverity`: Critical, High, Medium, Low
- `GapItemStatus`: Open, InProgress, Resolved

### Seed данные

Для разработки проект поставляется с синтетическими данными:

## Synthetic Demo Data

Приложение включает расширенный набор синтетических данных для демонстрации различных сценариев сопоставления регуляторных требований:

### Внутренние документы (10 документов)
- **СОП-001** — Валидация аналитических методов (Контроль качества)
- **СОП-002** — Управление отклонениями и CAPA (Система качества)
- **СОП-003** — Управление поставщиками и квалификация API (Управление поставщиками)
- **СОП-004** — Обучение и оценка компетентности GMP-персонала (Управление персоналом)
- **СОП-005** — Управление документацией и контроль версий (Управление документацией)
- **СОП-006** — Расследование OOS и OOT результатов (Контроль качества)
- **СОП-007** — Управление рисками качества (Система качества)
- **POL-001** — Политика управления изменениями (Система качества)
- **POL-002** — Политика целостности данных и электронных записей (Целостность данных)
- **ICH Q10** — Фармацевтическая система качества (Международные руководства)

### Наборы регуляторных требований (3 набора, 32 требования)

1. **FDA Pre-Approval Inspection Checklist 2024** (12 требований, статус: Mapped)
   - Критические параметры процесса (CPP)
   - Управление отклонениями
   - Квалификация поставщиков API
   - Целостность данных (ALCOA+)
   - Программа стабильности
   - Обучение персонала
   - Управление изменениями
   - Валидация лабораторных методов
   - Валидация уборки
   - Управление жалобами
   - Валидация компьютерных систем (CSV)
   - Внутренние GMP-аудиты

2. **EMA GMP Annex 11 — Компьютеризированные системы 2023** (8 требований, статус: Draft)
   - Валидация компьютеризированных систем
   - Управление доступом
   - Электронный аудит трейл
   - Резервное копирование
   - Аудит поставщиков систем
   - Управление инцидентами
   - Обучение пользователей
   - Миграция данных

3. **ICH Q9 Quality Risk Management** (12 требований, статус: Draft)
   - Полное покрытие (4 требования): обучение, CAPA, управление изменениями, контроль версий
   - Частичное покрытие (4 требования): periodic review CAPA, retraining, independent review систем, audit trail review
   - Без покрытия (4 требования): data integrity escalation, vendor risk scoring, AI risk policy, cross-site trend analysis

### Сценарии покрытия (25 маппингов)
- **Covered (полное покрытие)**: 10 маппингов
- **Partial (частичное покрытие)**: 7 маппингов
- **Gap (отсутствие покрытия)**: 8 маппингов

### Gap Analysis
- 1 Gap Report с 7 Gap Items для FDA PAI набора
- Executive summary с ключевыми выводами и планом обновления процедур
- Критические пробелы: программа стабильности, валидация уборки
- Системные несоответствия: противоречие между POL-002 и СОП-001

Загрузка seed данных:
```bash
npm run db:seed
```

Просмотр данных:
```bash
npm run db:studio
```

## API Endpoints

### Documents

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/documents` | Список документов | `?type=SOP&search=валидация&limit=20&offset=0` |
| POST | `/api/documents` | Создать документ | Body: `{ title, type, category, version, content }` |
| GET | `/api/documents/[id]` | Получить документ с chunks | Path: `id` |
| PATCH | `/api/documents/[id]` | Обновить документ | Path: `id`, Body: частичное обновление |
| DELETE | `/api/documents/[id]` | Удалить документ | Path: `id` |

### Health

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/health` | Проверка состояния | `{ status, timestamp, db }` |

### Примеры запросов

```bash
# Проверка состояния
curl http://localhost:3000/api/health

# Получить все документы
curl http://localhost:3000/api/documents

# Создать документ
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title":"Test SOP","type":"SOP","category":"Quality","content":"Test content..."}'

# Получить документ с chunks
curl http://localhost:3000/api/documents/{id}

# Обновить документ
curl -X PATCH http://localhost:3000/api/documents/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated SOP Title"}'

# Удалить документ
curl -X DELETE http://localhost:3000/api/documents/{id}
```

## Known Limitations

- **No authentication**: Приложение не имеет системы аутентификации
- **No file upload**: Поддержка загрузки файлов (PDF, Word) в Phase 2
- **No embeddings**: Векторные embeddings для semantic search в Phase 2
- **Basic AI**: AI-анализ использует простые prompt templates без fine-tuning

## License

Proprietary
