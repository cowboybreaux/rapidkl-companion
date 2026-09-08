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
      headers: { Accept: 'application/x-protobuf, application/octet-stream' },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `KTM vehicle feed returned ${response.status}` },
        { status: 502 },
      );
    }

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(await response.arrayBuffer()),
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
    console.error('Unable to decode KTM live vehicle feed:', error);
    return NextResponse.json(
      { error: 'Unable to retrieve live KTM vehicle positions' },
      { status: 502 },
    );
  }
}
