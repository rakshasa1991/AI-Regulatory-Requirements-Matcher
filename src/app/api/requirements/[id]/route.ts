import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateRequirementSetSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const set = await db.requirementSet.findUnique({
      where: { id: params.id },
      include: {
        requirements: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!set) {
      return NextResponse.json({ error: 'Requirement set not found' }, { status: 404 });
    }

    return NextResponse.json({ data: set });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateRequirementSetSchema.parse(body);

    const set = await db.requirementSet.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        title: true,
        source: true,
        status: true,
        importDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: set });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.requirementSet.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Requirement set not found' }, { status: 404 });
    }

    await db.requirementSet.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { message: 'Requirement set deleted successfully' } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
