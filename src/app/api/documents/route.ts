import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createDocumentSchema, updateDocumentSchema } from '@/lib/validators';
import { chunkText } from '@/lib/chunker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const documents = await db.document.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);

    const chunks = chunkText(validatedData.content, 800, 100);

    const document = await db.document.create({
      data: {
        title: validatedData.title,
        type: validatedData.type,
        category: validatedData.category,
        version: validatedData.version,
        content: validatedData.content,
        chunks: {
          create: chunks.map((chunk, index) => ({
            chunkIndex: index,
            content: chunk,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
