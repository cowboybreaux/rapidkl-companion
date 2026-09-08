import { NextResponse } from 'next/server';
import { fetchStations } from '@/lib/fetchStations';

export const runtime = 'nodejs';
export const revalidate = 21_600;

export async function GET() {
  try {
    const stations = await fetchStations();
    return NextResponse.json(stations, {
      headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('Unable to load the Klang Valley station directory:', error);
    return NextResponse.json(
      { error: 'Unable to load RapidKL and KTMB station coordinates' },
      { status: 502 },
    );
  }
}
