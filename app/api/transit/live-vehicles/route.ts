import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KTM_VEHICLE_POSITIONS_URL =
  'https://api.data.gov.my/gtfs-realtime/vehicle-position/ktmb';

export type LiveVehicle = {
  vehicleId: string;
  latitude: number;
  longitude: number;
  /** GTFS-Realtime reports speed in metres per second. */
  speed: number | null;
  /** ISO-8601 timestamp supplied by the feed, when available. */
  timestamp: string | null;
};

export async function GET() {
  try {
    const response = await fetch(KTM_VEHICLE_POSITIONS_URL, {
      cache: 'no-store',
      headers: { 
        'Accept': 'application/x-protobuf, application/octet-stream',
        // This User-Agent prevents Vercel from being blocked by government firewalls
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
    });

    if (!response.ok) {
      console.error(`Fetch failed: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `KTM vehicle feed blocked or down. Status: ${response.status} ${response.statusText}` },
        { status: response.status === 403 ? 403 : 502 },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(arrayBuffer),
    );

    const vehicles: LiveVehicle[] = feed.entity.flatMap((entity) => {
      const vehicle = entity.vehicle;
      const position = vehicle?.position;
      const vehicleId = vehicle?.vehicle?.id ?? entity.id;
      const speed = position?.speed;

      if (
        !vehicleId ||
        !position ||
        !Number.isFinite(position.latitude) ||
        !Number.isFinite(position.longitude)
      ) {
        return [];
      }

      const seconds = Number(vehicle.timestamp ?? feed.header.timestamp ?? 0);
      return [{
        vehicleId,
        latitude: position.latitude,
        longitude: position.longitude,
        speed: typeof speed === 'number' && Number.isFinite(speed) ? speed : null,
        timestamp: seconds > 0 ? new Date(seconds * 1_000).toISOString() : null,
      }];
    });

    return NextResponse.json(vehicles, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown decoding error';
    console.error('Unable to decode KTM live vehicle feed:', errorMessage);
    
    return NextResponse.json(
      { error: `Unable to process live KTM data: ${errorMessage}` },
      { status: 500 },
    );
  }
}