import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { status } = await req.json()

    const updated = await db.gapItem.update({
      where: { id: params.itemId },
      data: { status },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Update gap item status failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
