import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      db: 'error',
    }, { status: 500 });
  }
}
