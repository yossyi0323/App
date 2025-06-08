export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getItems, getItemsByDestination, getItemsBySource } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const destinationId = searchParams.get('destinationId');
  const sourceId = searchParams.get('sourceId');
  console.log('[API] /api/items GET called', {
    destinationId,
    sourceId,
    allParams: req.nextUrl.searchParams.toString(),
  });

  if (destinationId) {
    console.log('[API] /api/items: getItemsByDestination called', { destinationId });
    const { data, error } = await getItemsByDestination(destinationId);
    if (error) {
      console.error('[API] /api/items: getItemsByDestination error', { destinationId, error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }
  if (sourceId) {
    console.log('[API] /api/items: getItemsBySource called', { sourceId });
    const { data, error } = await getItemsBySource(sourceId);
    if (error) {
      console.error('[API] /api/items: getItemsBySource error', { sourceId, error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }
  // パラメータ無し→全品目
  console.log('[API] /api/items: getItems called (all items)');
  const { data, error } = await getItems();
  if (error) {
    console.error('[API] /api/items: getItems error', { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
} 