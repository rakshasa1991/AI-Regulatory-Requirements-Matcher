import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bulkUpdateRequirementsSchema } from '@/lib/validators';
import { CoverageStatus, Criticality, RequirementCategory } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as CoverageStatus | null;
    const criticality = searchParams.get('criticality') as Criticality | null;
    const category = searchParams.get('category') as RequirementCategory | null;

    const set = await db.requirementSet.findUnique({
      where: { id: params.id },
      include: {
        requirements: {
          where: {
            ...(status && { status }),
            ...(criticality && { criticality }),
            ...(category && { category }),
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!set) {
      return NextResponse.json({ error: 'Requirement set not found' }, { status: 404 });
    }

    return NextResponse.json({ data: set.requirements });
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
    const validatedData = bulkUpdateRequirementsSchema.parse(body);

    const results = await Promise.all(
      validatedData.updates.map(async (update) => {
        const updated = await db.requirement.update({
          where: { id: update.id },
          data: {
            ...(update.category && { category: update.category }),
            ...(update.criticality && { criticality: update.criticality }),
          },
          select: {
            id: true,
            orderIndex: true,
            text: true,
            category: true,
            criticality: true,
            status: true,
          },
        });
        return updated;
      })
    );

    return NextResponse.json({ data: results });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
