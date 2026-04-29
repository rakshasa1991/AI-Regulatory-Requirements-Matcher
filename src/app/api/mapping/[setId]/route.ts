import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { setId: string } }) {
  try {
    const mappings = await db.mapping.findMany({
      where: {
        requirement: {
          setId: params.setId,
        },
      },
        include: {
        requirement: {
          select: {
            text: true,
            criticality: true,
          },
        },
        document: {
          select: {
            title: true,
          },
        },
        chunk: {
          select: {
            chunkIndex: true,
          },
        },
      },
      orderBy: {
        requirement: {
          orderIndex: 'asc',
        },
      },
    })

    const result = mappings.map((m) => ({
      id: m.id,
      requirementId: m.requirementId,
      requirementText: m.requirement.text,
      documentId: m.documentId,
      documentTitle: m.document.title,
      chunkId: m.chunkId,
      chunkIndex: m.chunk?.chunkIndex ?? null,
      coverageStatus: m.coverageStatus,
      matchScore: m.matchScore,
      aiRationale: m.aiRationale,
      createdAt: m.createdAt,
      criticality: m.requirement.criticality,
    }))

    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
