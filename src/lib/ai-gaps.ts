import { db } from './db'
import { openrouter, MODEL, TIMEOUT_MS, MAX_RETRIES } from './openrouter'
import { GAP_SYSTEM_PROMPT, DRAFT_SYSTEM_PROMPT } from './prompts'
import { GapType, GapSeverity } from '@prisma/client'

export interface GapReportData {
  requirementId: string
  gapType: GapType
  severity: GapSeverity
  recommendation: string
}

export interface GapReport {
  id: string
  requirementSetId: string
  executiveSummary: string | null
  createdAt: Date
  items: GapItem[]
}

export interface GapItem {
  id: string
  reportId: string
  requirementId: string
  gapType: GapType
  severity: GapSeverity
  recommendation: string | null
  draftResponseText: string | null
  status: string
  requirementText: string
}

async function callGapAI(requirements: Array<{ id: string; text: string }>): Promise<GapReportData[]> {
  const userPrompt = `Для каждого требования определи пробел:
gapType: Missing|Contradictory|Partial|Outdated,
severity: Critical|High|Medium|Low,
recommendation: краткая рекомендация на русском.

Верни JSON array с requirementId из входных данных:
[{"requirementId":"id","gapType":"Missing","severity":"Critical","recommendation":"текст"}]

Требования:
${requirements.map((req, i) => `[Требование ${i + 1}] ID: ${req.id}\n${req.text}`).join('\n\n')}`

  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await openrouter.chat.completions.create(
        {
          model: MODEL,
          messages: [
            { role: 'system', content: GAP_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 2000,
        },
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in response')
      }

      const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      let parsed = JSON.parse(jsonStr)
      // LLM sometimes returns single object instead of array
      if (!Array.isArray(parsed)) {
        parsed = [parsed]
      }
      return parsed as GapReportData[]
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Gap analysis failed after retries')
}

async function callExecutiveSummaryAI(requirementsText: string[], gapAnalysis: GapReportData[]): Promise<string> {
  const userPrompt = `На основе следующего анализа пробелов напиши исполнительное резюме (executive summary) на русском языке.

Требования с пробелами:
${requirementsText.map((text, i) => `[${i + 1}] ${text}`).join('\n')}

Анализ пробелов:
${gapAnalysis.map((gap, i) => `[${i + 1}] Тип: ${gap.gapType}, Серьёзность: ${gap.severity}, Рекомендация: ${gap.recommendation}`).join('\n')}

Формат резюме:
- Краткое описание общей ситуации (2-3 предложения)
- Количество пробелов по типам и серьёзности
- Ключевые приоритеты для устранения
- Общий вывод о готовности к регуляторному аудиту

Обязательно включи раздел "ПЛАН ОБНОВЛЕНИЯ ПРОЦЕДУР":
- Перечисли внутренние документы (СОП, Политики), которые требуют обновления
- Для каждого укажи: что изменить, приоритет (Критический/Высокий/Средний)
- Используй формат нумерованного списка
Примерный объём этого раздела: 100-150 слов.

Объём: 200-300 слов.`

  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await openrouter.chat.completions.create(
        {
          model: MODEL,
          messages: [
            { role: 'system', content: 'Ты эксперт в области GxP-регуляторики. Пиши профессиональные исполнительные резюме для руководства компании.' },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 800,
        },
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in response')
      }

      return content.trim()
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Executive summary generation failed after retries')
}

async function callDraftResponseAI(requirementText: string, relatedDocs: string[]): Promise<string> {
  const userPrompt = `Напиши профессиональный ответ регулятору на требование.

Требование:
${requirementText}

Связанные внутренние документы компании:
${relatedDocs.length > 0 ? relatedDocs.map((doc, i) => `[Документ ${i + 1}]: ${doc}`).join('\n') : 'Нет связанных документов'}

Стиль: формальный, GxP-соответствующий, на русском языке.
Ответ должен ссылаться на внутренние процедуры компании.
Объём: 150-250 слов.`

  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await openrouter.chat.completions.create(
        {
          model: MODEL,
          messages: [
            { role: 'system', content: DRAFT_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 600,
        },
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in response')
      }

      return content.trim()
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Draft response generation failed after retries')
}

const VALID_GAP_TYPES = ['Missing', 'Contradictory', 'Partial', 'Outdated'] as const
const VALID_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'] as const

function normalizeGapType(raw: string): GapType {
  const found = VALID_GAP_TYPES.find(v => v.toLowerCase() === String(raw).toLowerCase())
  return (found ?? 'Missing') as GapType
}

function normalizeSeverity(raw: string): GapSeverity {
  const found = VALID_SEVERITIES.find(v => v.toLowerCase() === String(raw).toLowerCase())
  return (found ?? 'Medium') as GapSeverity
}

export async function generateGapReport(requirementSetId: string): Promise<{ reportId: string; itemsCount: number; criticalCount: number }> {
  const requirementSet = await db.requirementSet.findUnique({
    where: { id: requirementSetId },
    select: { status: true },
  })
  if (requirementSet?.status !== 'Mapped') {
    throw new Error('MAPPING_NOT_RUN')
  }

  const requirements = await db.requirement.findMany({
    where: {
      setId: requirementSetId,
      status: {
        in: ['Partial', 'Gap'],
      },
    },
    orderBy: { orderIndex: 'asc' },
  })

  if (requirements.length === 0) {
    const report = await db.gapReport.create({
      data: {
        requirementSetId,
        executiveSummary: 'Нет незакрытых требований. Все требования покрыты документами компании.',
      },
    })
    return { reportId: report.id, itemsCount: 0, criticalCount: 0 }
  }

  const batchSize = 10
  const allGapItems: Array<{ requirementId: string; gapType: GapType; severity: GapSeverity; recommendation: string }> = []

  for (let i = 0; i < requirements.length; i += batchSize) {
    const batch = requirements.slice(i, i + batchSize)
    const batchWithIds = batch.map(req => ({ id: req.id, text: req.text }))

    const gapAnalysis = await callGapAI(batchWithIds)

    gapAnalysis.forEach((item) => {
      allGapItems.push({
        requirementId: item.requirementId,
        gapType: item.gapType,
        severity: item.severity,
        recommendation: item.recommendation,
      })
    })
  }

  const report = await db.gapReport.create({
    data: {
      requirementSetId,
    },
  })

  let criticalCount = 0

  for (const item of allGapItems) {
    const requirement = requirements.find(r => r.id === item.requirementId)
    if (!requirement) continue

    if (item.severity === 'Critical') criticalCount++

    await db.gapItem.create({
      data: {
        reportId: report.id,
        requirementId: item.requirementId,
        gapType: normalizeGapType(item.gapType as string),
        severity: normalizeSeverity(item.severity as string),
        recommendation: item.recommendation ?? '',
      },
    })
  }

  if (allGapItems.length > 0) {
    const requirementsText = allGapItems.map(item => {
      const req = requirements.find(r => r.id === item.requirementId)
      return req?.text || ''
    }).filter(Boolean)

    try {
      const executiveSummary = await callExecutiveSummaryAI(requirementsText as string[], allGapItems)
      await db.gapReport.update({
        where: { id: report.id },
        data: { executiveSummary },
      })
    } catch (error) {
      console.error('Failed to generate executive summary:', error)
    }
  }

  return { reportId: report.id, itemsCount: allGapItems.length, criticalCount }
}

export async function generateDraftResponse(gapItemId: string): Promise<string> {
  const gapItem = await db.gapItem.findUnique({
    where: { id: gapItemId },
    include: {
      requirement: {
        include: {
          mappings: {
            include: {
              document: true,
              chunk: true,
            },
          },
        },
      },
    },
  })

  if (!gapItem) {
    throw new Error('Gap item not found')
  }

  const relatedDocs = gapItem.requirement.mappings
    .filter(m => m.document && (m.coverageStatus === 'Covered' || m.coverageStatus === 'Partial'))
    .map(m => `${m.document.title} (${m.document.type})${m.chunk ? ` - Чанк ${m.chunk.chunkIndex}` : ''}`)

  const draftResponseText = await callDraftResponseAI(gapItem.requirement.text, relatedDocs)

  await db.gapItem.update({
    where: { id: gapItemId },
    data: { draftResponseText },
  })

  return draftResponseText
}

export async function getGapReport(reportId: string): Promise<GapReport | null> {
  const report = await db.gapReport.findUnique({
    where: { id: reportId },
    include: {
      items: {
        include: {
          requirement: {
            select: {
              id: true,
              text: true,
              category: true,
              criticality: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      },
    },
  })

  if (!report) return null

  return {
    id: report.id,
    requirementSetId: report.requirementSetId,
    executiveSummary: report.executiveSummary,
    createdAt: report.createdAt,
    items: report.items.map(item => ({
      id: item.id,
      reportId: item.reportId,
      requirementId: item.requirementId,
      gapType: item.gapType,
      severity: item.severity,
      recommendation: item.recommendation,
      draftResponseText: item.draftResponseText,
      status: item.status,
      requirementText: item.requirement.text,
    })),
  }
}
