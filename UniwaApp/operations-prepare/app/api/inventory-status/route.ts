import type {
  SaveInventoryStatusRequest,
  SaveInventoryStatusResponse,
  GetInventoryStatusByDateResponse,
} from '@/lib/types/api/inventory-status';

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getInventoryStatusByDate, saveInventoryStatusesBulk } from '@/lib/db-service';

export async function GET(
  req: NextRequest
): Promise<NextResponse<GetInventoryStatusByDateResponse>> {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date is required' } as any, { status: 400 });
  const { data, error } = await getInventoryStatusByDate(date);
  if (error) return NextResponse.json({ error: error.message } as any, { status: 500 });
  return NextResponse.json(data as GetInventoryStatusByDateResponse);
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SaveInventoryStatusResponse>> {
  try {
    const body = (await request.json()) as SaveInventoryStatusRequest;
    const { data, error } = await saveInventoryStatusesBulk(body.statuses);

    if (error) {
      return NextResponse.json(
        { success: false, savedCount: 0, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, savedCount: 0, error: 'save failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, savedCount: data.length });
  } catch (error: any) {
    console.error('在庫ステータス保存エラー:', error);
    return NextResponse.json(
      { success: false, savedCount: 0, error: error?.message ?? 'unexpected error' },
      { status: 500 }
    );
  }
}
