import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const latestReport = await db.gapReport.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        requirementSet: { select: { title: true } },
        items: {
          include: {
            requirement: { select: { text: true, criticality: true } },
          },
          orderBy: { id: 'asc' },
        },
      },
    })

    if (!latestReport) {
      return NextResponse.json({ data: null })
    }

    const severityOrder: Record<string, number> = {
      Critical: 0, High: 1, Medium: 2, Low: 3,
    }

    const sortedItems = [...latestReport.items].sort(
      (a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
    )

    const criticalCount = sortedItems.filter(i => i.severity === 'Critical').length
    const highCount = sortedItems.filter(i => i.severity === 'High').length

    return NextResponse.json({
      data: {
        id: latestReport.id,
        requirementSetTitle: latestReport.requirementSet.title,
        createdAt: latestReport.createdAt,
        criticalCount,
        highCount,
        items: sortedItems.slice(0, 7).map(item => ({
          id: item.id,
          requirementText: item.requirement.text,
          severity: item.severity,
          gapType: item.gapType,
          recommendation: item.recommendation,
          status: item.status,
        })),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
