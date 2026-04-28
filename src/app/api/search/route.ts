import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(20).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, limit } = searchSchema.parse(body)

    const results = await db.$queryRaw<
      Array<{
        id: string
        title: string
        type: string
        category: string
        excerpt: string
      }>
    >`
      SELECT id, title, type, category,
             ts_headline('russian', content, plainto_tsquery('russian', ${query}),
               'MaxWords=50, MinWords=20') as excerpt
      FROM documents
      WHERE to_tsvector('russian', content || ' ' || title)
            @@ plainto_tsquery('russian', ${query})
      LIMIT ${limit ?? 5}
    `

    return NextResponse.json({
      data: results.map(row => ({
        id: row.id,
        title: row.title,
        type: row.type,
        category: row.category,
        excerpt: row.excerpt || '',
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
