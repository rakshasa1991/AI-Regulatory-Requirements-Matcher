import { NextRequest, NextResponse } from 'next/server'
import { generateGapReport } from '@/lib/ai-gaps'
import { z } from 'zod'

const generateGapSchema = z.object({
  requirementSetId: z.string().cuid(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requirementSetId } = generateGapSchema.parse(body)
    console.log('DEBUG: Starting gap generation for', requirementSetId)

    const { reportId, itemsCount, criticalCount } = await generateGapReport(requirementSetId)
    console.log('DEBUG: Gap generation completed', { reportId, itemsCount, criticalCount })

    return NextResponse.json({
      data: {
        reportId,
        itemsCount,
        criticalCount,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'MAPPING_NOT_RUN') {
      return NextResponse.json(
        { error: 'Сначала выполните AI-сопоставление требований' },
        { status: 422 }
      )
    }
    if (error instanceof Error && error.message === 'NO_DOCUMENTS') {
      return NextResponse.json(
        { error: 'Нет документов в библиотеке. Добавьте документы перед сопоставлением.' },
        { status: 422 }
      )
    }
    console.error('Gap report generation failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
