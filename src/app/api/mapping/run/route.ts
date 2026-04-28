import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MappingRunSchema } from '@/lib/validators'
import { runMapping } from '@/lib/ai-mapping'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let setIdForLog = 'unknown'
  
  try {
    const body = await request.json()
    setIdForLog = body.requirementSetId ?? 'unknown'
    const validatedData = MappingRunSchema.parse(body)

    const stats = await runMapping(validatedData.requirementSetId)

    const duration_ms = Date.now() - startTime

    console.log(JSON.stringify({
      op: 'mapping_run',
      setId: validatedData.requirementSetId,
      duration_ms,
      status: 'success',
    }))

    return NextResponse.json({ data: stats }, { status: 200 })
  } catch (error) {
    const duration_ms = Date.now() - startTime

    console.log(JSON.stringify({
      op: 'mapping_run',
      setId: setIdForLog,
      duration_ms,
      status: 'error',
    }))

    if (error instanceof Error && error.message.startsWith('NO_DOCUMENTS')) {
      return NextResponse.json({ error: 'Добавьте документы в библиотеку перед запуском сопоставления' }, { status: 422 })
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
