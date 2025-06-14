import type { GetItemsResponse } from '@/lib/types/api/items';

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getItems, getItemsByDestination, getItemsBySource } from '@/lib/db-service';

export async function GET(req: NextRequest): Promise<NextResponse<GetItemsResponse>> {
  try {
    const { searchParams } = req.nextUrl;
    const destinationId = searchParams.get('destinationId');
    const sourceId = searchParams.get('sourceId');
    console.log('[API] /api/items GET called', {
      destinationId,
      sourceId,
      allParams: req.nextUrl.searchParams.toString(),
    });

    if (destinationId) {
      const { data, error } = await getItemsByDestination(destinationId);
      if (error) {
        return NextResponse.json({ error: error.message } as any, { status: 500 });
      }
      return NextResponse.json(data as GetItemsResponse);
    }
    if (sourceId) {
      const { data, error } = await getItemsBySource(sourceId);
      if (error) {
        return NextResponse.json({ error: error.message } as any, { status: 500 });
      }
      return NextResponse.json(data as GetItemsResponse);
    }
    // パラメータ無し→全品目
    const { data, error } = await getItems();
    if (error) {
      return NextResponse.json({ error: error.message } as any, { status: 500 });
    }
    return NextResponse.json(data as GetItemsResponse);
  } catch (error: any) {
    throw error;
  }
}
