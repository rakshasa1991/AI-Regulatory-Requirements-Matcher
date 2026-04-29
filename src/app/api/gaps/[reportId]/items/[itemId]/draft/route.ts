import { NextRequest, NextResponse } from 'next/server'
import { generateDraftResponse } from '@/lib/ai-gaps'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { reportId: string; itemId: string } }) {
  try {
    const { itemId } = params

    const draftResponseText = await generateDraftResponse(itemId)

    return NextResponse.json({
      data: {
        draftResponseText,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Gap item not found') {
      return NextResponse.json({ error: 'Gap item not found' }, { status: 404 })
    }
    console.error('Draft response generation failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
