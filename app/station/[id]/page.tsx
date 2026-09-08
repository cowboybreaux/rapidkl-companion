import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import LineBadge from '@/components/LineBadge';
import { NEARBY_STATIONS } from '@/lib/data';
import { fetchStations } from '@/lib/fetchStations';
import type { LineId } from '@/lib/types';

type StationView = {
  name: string;
  code: string;
  lineId: LineId;
  location: string;
  details: string;
  latitude: number;
  longitude: number;
  status: string;
};

export default async function StationPage({ params }: { params: { id: string } }) {
  const stationId = decodeURIComponent(params.id);
  const directoryStation = (await fetchStations()).find(({ stopId }) => stopId === stationId);
  const legacyStation = NEARBY_STATIONS.find(({ id }) => id === stationId);

  let station: StationView | undefined;
  if (directoryStation) {
    station = {
      name: directoryStation.name,
      code: directoryStation.code,
      lineId: directoryStation.lineId,
      location: `${directoryStation.structure} station · ${directoryStation.district}`,
      details: directoryStation.connections,
      latitude: directoryStation.latitude,
      longitude: directoryStation.longitude,
      status: 'OPERATING NORMALLY',
    };
  } else if (legacyStation) {
    station = {
      name: legacyStation.name,
      code: legacyStation.code,
      lineId: legacyStation.lineId,
      location: legacyStation.address,
      details: legacyStation.statusDetail,
      latitude: legacyStation.latitude,
      longitude: legacyStation.longitude,
      status: legacyStation.status.toUpperCase(),
    };
  }

  if (!station) notFound();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${station.latitude},${station.longitude}&zoom=17`
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary"><ArrowLeft size={16} />Back to Hub</Link>
      <div className="rounded-lg border border-hairline bg-surface p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <LineBadge lineId={station.lineId} />
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink-primary">{station.name}</h1>
            <p className="mt-1 text-sm text-ink-tertiary">{station.code}</p>
          </div>
          <span className="rounded-full bg-line-monorail/15 px-3 py-1 text-xs font-bold tracking-wide text-line-mrt">{station.status}</span>
        </div>

        <div className="mt-6 grid gap-4 border-t border-hairline pt-5 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary">Location</p>
            <p className="mt-1 flex gap-2 text-sm leading-6 text-ink-primary"><MapPin size={17} className="mt-1 shrink-0 text-accent" />{station.location}</p>
            <p className="mt-2 text-xs leading-5 text-ink-secondary">{station.details}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary">Official GTFS coordinates</p>
            <p className="mt-1 font-display text-sm text-ink-primary">{station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-hairline">
          {mapUrl ? (
            <iframe title={`Map showing ${station.name} station`} src={mapUrl} className="h-[380px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          ) : (
            <div className="flex h-[280px] items-center justify-center bg-elevated/40 p-6 text-center text-sm text-accent">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to display this station map.</div>
          )}
        </div>
      </div>
    </div>
  );
}
