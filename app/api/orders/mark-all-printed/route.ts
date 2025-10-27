import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { orders } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Invalid order IDs' }, { status: 400 });
    }

    await db
      .update(orders)
      .set({
        status: 'printed',
        printDate: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(orders.id, orderIds),
          eq(orders.status, 'pending')
        )
      );

    return NextResponse.json({ success: true, updated: orderIds.length });
  } catch (error) {
    console.error('Error marking orders as printed:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

