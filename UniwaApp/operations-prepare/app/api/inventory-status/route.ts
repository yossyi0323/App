export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getInventoryStatusByDate, saveInventoryStatusesBulk } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 });
  const { data, error } = await getInventoryStatusByDate(date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await saveInventoryStatusesBulk(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
