import { db } from './db'
import { openrouter, MODEL, TIMEOUT_MS, MAX_RETRIES } from './openrouter'
import { MAPPING_SYSTEM_PROMPT } from './prompts'
import { CoverageStatus } from '@prisma/client'

export interface MappingResult {
  requirementId: string
  coverageStatus: CoverageStatus
  matchScore: number
  rationale: string
  documentId: string
  chunkId?: string
  chunkIndex?: number | null
}

export interface MappingRunStats {
  covered: number
  partial: number
  gap: number
  total: number
  duration_ms: number
}

function scoreChunks(requirementText: string, chunks: Array<{ id: string; documentId: string; documentTitle: string; chunkIndex: number; content: string }>): Array<{ id: string; documentId: string; documentTitle: string; chunkIndex: number; content: string; score: number }> {
  const requirementWords = requirementText.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  
  return chunks.map(chunk => {
    const chunkWords = chunk.content.toLowerCase().split(/\s+/)
    const matches = requirementWords.filter(w => chunkWords.includes(w)).length
    const score = requirementWords.length > 0 ? matches / requirementWords.length : 0
    return { ...chunk, score }
  }).sort((a, b) => b.score - a.score)
}

async function callAI(requirementText: string, contextText: string): Promise<{ coverageStatus: CoverageStatus; matchScore: number; rationale: string; bestChunkIndex: number | null }> {
  const userPrompt = `Требование:
${requirementText}

Контекст из документов:
${contextText}

Проанализируй соответствие и верни JSON.`

  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await openrouter.chat.completions.create(
        {
          model: MODEL,
          messages: [
            { role: 'system', content: MAPPING_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 500,
        },
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in response')
      }

      const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const parsed = JSON.parse(jsonStr)

      return {
        coverageStatus: parsed.coverageStatus as CoverageStatus,
        matchScore: Math.min(1, Math.max(0, parsed.matchScore)),
        rationale: parsed.rationale,
        bestChunkIndex: parsed.bestChunkIndex ?? null,
      }
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('AI mapping failed after retries')
}

export async function runMapping(requirementSetId: string): Promise<MappingRunStats> {
  const startTime = Date.now()

  const requirements = await db.requirement.findMany({
    where: { setId: requirementSetId },
    orderBy: { orderIndex: 'asc' },
  })

  const documents = await db.document.findMany({
    include: {
      chunks: {
        orderBy: { chunkIndex: 'asc' },
      },
    },
  })

  if (documents.length === 0) {
    throw new Error('NO_DOCUMENTS')
  }

  const allChunks = documents.flatMap(doc =>
    doc.chunks.map(chunk => ({
      id: chunk.id,
      documentId: doc.id,
      documentTitle: doc.title,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
    }))
  )

  await db.mapping.deleteMany({
    where: { requirement: { setId: requirementSetId } },
  })

  await db.requirement.updateMany({
    where: { setId: requirementSetId },
    data: { status: 'Unmapped' },
  })

  let covered = 0
  let partial = 0
  let gap = 0

  for (const req of requirements) {
    const scoredChunks = scoreChunks(req.text, allChunks)
    const topChunks = scoredChunks.slice(0, 3)

    const contextText = topChunks
      .map((c, i) => `[Документ ${i + 1}: ${c.documentTitle}, Чанк ${c.chunkIndex}]\n${c.content}`)
      .join('\n\n---\n\n')

    let aiResult: { coverageStatus: CoverageStatus; matchScore: number; rationale: string; bestChunkIndex: number | null }
    let bestChunk: typeof topChunks[0] | undefined

    try {
      aiResult = await callAI(req.text, contextText)
      
      if (aiResult.bestChunkIndex !== null && aiResult.bestChunkIndex !== undefined) {
        const matchingChunk = topChunks.find(c => c.chunkIndex === aiResult.bestChunkIndex)
        if (matchingChunk) {
          bestChunk = matchingChunk
        }
      } else if (topChunks.length > 0) {
        bestChunk = topChunks[0]
      }
    } catch (error) {
      console.error(`Mapping failed for requirement ${req.id}:`, error)
      aiResult = {
        coverageStatus: 'Gap',
        matchScore: 0,
        rationale: 'AI mapping failed - manual review required',
        bestChunkIndex: null,
      }
    }

    const mapping = await db.mapping.create({
      data: {
        requirementId: req.id,
        documentId: bestChunk?.documentId || documents[0]?.id || '',
        chunkId: bestChunk?.id,
        coverageStatus: aiResult.coverageStatus,
        matchScore: aiResult.matchScore,
        aiRationale: aiResult.rationale,
      },
    })

    await db.requirement.update({
      where: { id: req.id },
      data: { status: aiResult.coverageStatus },
    })

    if (aiResult.coverageStatus === 'Covered') covered++
    else if (aiResult.coverageStatus === 'Partial') partial++
    else gap++
  }

  await db.requirementSet.update({
    where: { id: requirementSetId },
    data: { status: 'Mapped' },
  })

  const duration_ms = Date.now() - startTime

  return {
    covered,
    partial,
    gap,
    total: requirements.length,
    duration_ms,
  }
}
