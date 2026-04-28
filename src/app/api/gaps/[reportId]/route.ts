import { NextRequest, NextResponse } from 'next/server'
import { getGapReport } from '@/lib/ai-gaps'

export async function GET(req: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const { reportId } = params

    const report = await getGapReport(reportId)

    if (!report) {
      return NextResponse.json({ error: 'Gap report not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: report.id,
        requirementSetId: report.requirementSetId,
        executiveSummary: report.executiveSummary,
        createdAt: report.createdAt.toISOString(),
        items: report.items.map(item => ({
          id: item.id,
          requirementId: item.requirementId,
          requirementText: item.requirementText,
          gapType: item.gapType,
          severity: item.severity,
          recommendation: item.recommendation,
          draftResponseText: item.draftResponseText,
          status: item.status,
        })),
      },
    })
  } catch (error) {
    console.error('Get gap report failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
