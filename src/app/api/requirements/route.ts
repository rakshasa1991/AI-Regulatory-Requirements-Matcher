import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createRequirementSetSchema } from '@/lib/validators';
import { parseRequirements } from '@/lib/requirement-parser';

export async function GET(request: NextRequest) {
  try {
    const requirementSets = await db.requirementSet.findMany({
      select: {
        id: true,
        title: true,
        source: true,
        status: true,
        importDate: true,
        createdAt: true,
        updatedAt: true,
        requirements: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { importDate: 'desc' },
    });

    const result = requirementSets.map((set) => ({
      ...set,
      requirementsCount: set.requirements.length,
      requirements: undefined,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createRequirementSetSchema.parse(body);

    const parsedRequirements = parseRequirements(validatedData.rawText);

    const set = await db.requirementSet.create({
      data: {
        title: validatedData.title,
        source: validatedData.source,
        rawText: validatedData.rawText,
        status: 'Draft',
        requirements: {
          create: parsedRequirements.map((text, index) => ({
            orderIndex: index,
            text,
            category: 'Other',
            criticality: 'Medium',
            status: 'Unmapped',
          })),
        },
      },
      select: {
        id: true,
        title: true,
        source: true,
        status: true,
        importDate: true,
        createdAt: true,
        updatedAt: true,
        requirements: {
          select: {
            id: true,
            orderIndex: true,
            text: true,
            category: true,
            criticality: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: {
          ...set,
          requirementsCount: set.requirements.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
