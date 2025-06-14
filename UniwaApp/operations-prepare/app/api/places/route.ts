export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getPlaces } from '@/lib/db-service';

export async function GET() {
  const { data, error } = await getPlaces();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
