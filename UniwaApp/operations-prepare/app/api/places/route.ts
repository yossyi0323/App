import type { GetPlacesResponse } from '@/lib/types/api/places';

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getPlaces } from '@/lib/db-service';

export async function GET(): Promise<ReturnType<typeof NextResponse.json<GetPlacesResponse>>> {
  try {
    const { data, error } = await getPlaces();
    if (error) {
      return NextResponse.json({ error: error.message } as any, { status: 500 });
    }
    return NextResponse.json(data as GetPlacesResponse);
  } catch (error: any) {
    console.error('[API] /api/places: unexpected error', error);
    throw error;
  }
}
