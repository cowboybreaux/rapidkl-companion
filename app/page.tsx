'use client';

import Link from 'next/link';
import { ChevronDown, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import LineBadge from '@/components/LineBadge';
import { LINES } from '@/lib/data';
import { haversineDistanceKm } from '@/lib/distance';
import { LINE_META } from '@/lib/lines';
import { STATION_LINE_BY_KEY, STATION_LINE_OPTIONS } from '@/lib/stationDirectory';
import { GtfsStation, LineId, LineOperationalStatus, StationLineKey } from '@/lib/types';

const STATUS_META: Record<LineOperationalStatus, { label: string; overviewLabel: string; dot: string; pill: string }> = {
  normal: {
    label: 'On time',
    overviewLabel: 'OPERATING NORMALLY',
    dot: 'bg-line-monorail shadow-[0_0_4px_1px_rgba(35,200,117,0.72),0_0_11px_rgba(35,200,117,0.55)]',
    pill: 'bg-line-monorail/15 text-line-mrt',
  },
  delayed: {
    label: 'Delayed',
    overviewLabel: 'MINOR DELAYS',
    dot: 'bg-line-putrajaya shadow-[0_0_4px_1px_rgba(244,196,48,0.75),0_0_11px_rgba(244,196,48,0.55)]',
    pill: 'bg-line-putrajaya/20 text-[#8A6500]',
  },
  disrupted: {
    label: 'Disrupted',
    overviewLabel: 'SERVICE DISRUPTION',
    dot: 'bg-line-ktm shadow-[0_0_4px_1px_rgba(242,61,79,0.75),0_0_11px_rgba(242,61,79,0.55)]',
    pill: 'bg-line-ktm/15 text-line-ktm',
  },
};

const LINE_TERMINI: Record<StationLineKey, [string, string]> = {
  kelana: ['Gombak', 'Putra Heights'],
  ampang: ['Sentul Timur', 'Ampang'],
  mrt: ['Kwasa Damansara', 'Kajang'],
  monorail: ['KL Sentral', 'Titiwangsa'],
  putrajaya: ['Kwasa Damansara', 'Putrajaya Sentral'],
  'ktm-batu': ['Batu Caves', 'Pulau Sebang / Tampin'],
  'ktm-port': ['Tanjung Malim', 'Port Klang'],
};

const stationFetcher = async (url: string): Promise<GtfsStation[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Station coordinates are unavailable');
  return response.json();
};

export default function HubPage() {
  const [openLine, setOpenLine] = useState<LineId | null>(null);
  const [selectedLineKey, setSelectedLineKey] = useState<StationLineKey>('kelana');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { data: gtfsStations, error: stationError, isLoading: stationsLoading } = useSWR<GtfsStation[]>('/api/transit/stations', stationFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1_000,
  });
  const stationOptions = useMemo(
    () => (gtfsStations ?? [])
      .filter(({ lineKey }) => lineKey === selectedLineKey)
      .sort((left, right) => left.sequence - right.sequence),
    [gtfsStations, selectedLineKey],
  );
  const selectedStation = stationOptions.find(({ stopId }) => stopId === selectedStationId) ?? stationOptions[0];
  const selectedLine = STATION_LINE_BY_KEY[selectedLineKey];
  const selectedLineStatus = LINES.find(({ id }) => id === selectedLine.lineId) ?? LINES[0];
  const selectedStatusMeta = STATUS_META[selectedLineStatus.status];
  const selectedTermini = LINE_TERMINI[selectedLineKey];

  const selectLine = (lineKey: StationLineKey) => {
    setSelectedLineKey(lineKey);
    setSelectedStationId('');
  };

  useEffect(() => {
    if (stationOptions.length && !stationOptions.some(({ stopId }) => stopId === selectedStationId)) {
      setSelectedStationId(stationOptions[0].stopId);
    }
  }, [selectedStationId, stationOptions]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserPosition({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setLocationError('Allow location access to find the closest stations.'),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const closestStations = useMemo(() => {
    if (!userPosition || !gtfsStations) return [];
    const uniqueStations = Array.from(
      new Map(gtfsStations.map((station) => [station.sourceStopId, station])).values(),
    );
    return uniqueStations
      .map((station) => ({ station, distanceKm: haversineDistanceKm(userPosition, station) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
  }, [gtfsStations, userPosition]);

  const toggleLine = (lineId: LineId) => {
    setOpenLine((current) => current === lineId ? null : lineId);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 hidden md:block">
        <h1 className="font-display text-2xl font-semibold text-ink-primary">RapidKL Hub</h1>
        <p className="mt-1 text-sm text-ink-secondary">Live line status and nearby departures across Klang Valley rail.</p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-ink-primary">Line Status</h2>
        <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-3">
          {LINES.map((line) => {
            const meta = LINE_META[line.id];
            const status = STATUS_META[line.status];
            const isOpen = openLine === line.id;
            const isOtherLine = openLine !== null && !isOpen;
            return (
              <div
                key={line.id}
                className={`overflow-hidden rounded-lg border border-hairline border-l-4 ${meta.leftBorder} bg-surface transition-opacity duration-300 ease-out ${isOtherLine ? 'opacity-50' : 'opacity-100'}`}
              >
                <button type="button" onClick={() => toggleLine(line.id)} aria-expanded={isOpen} aria-controls={`line-status-${line.id}`} className="w-full p-3.5 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <LineBadge lineId={line.id} />
                    <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
                      <span className={`h-2 w-2 rounded-full motion-safe:animate-pulse ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink-primary">{meta.name}</p>
                      <p className="mt-0.5 text-xs text-ink-tertiary">{line.headway} headway</p>
                    </div>
                    <ChevronDown size={18} className={`shrink-0 text-ink-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <div id={`line-status-${line.id}`} className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="border-t border-hairline/50 bg-elevated/35 px-3.5 py-3 text-sm leading-6 text-ink-secondary">{line.statusDetail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-ink-primary">Nearby Stations</h2>
        <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
          {closestStations.map(({ station, distanceKm }, index) => {
            return (
              <Link key={station.stopId} href={`/station/${encodeURIComponent(station.stopId)}`} className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-elevated/35 ${index !== closestStations.length - 1 ? 'border-b border-hairline' : ''}`}>
                <span className="flex w-12 shrink-0 justify-start">
                  <LineBadge lineId={station.lineId} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-left text-sm font-medium leading-5 text-ink-primary">{station.name}</p>
                  <p className="text-left text-xs leading-5 text-ink-tertiary">{station.code}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 font-display text-sm font-semibold tabular-nums text-ink-primary">
                  <MapPin size={16} className="text-ink-primary" />
                  {distanceKm.toFixed(1)} km
                </span>
              </Link>
            );
          })}
          {stationsLoading && <p className="px-4 py-5 text-sm text-ink-secondary">Loading RapidKL stations…</p>}
          {!stationsLoading && !userPosition && !locationError && <p className="px-4 py-5 text-sm text-ink-secondary">Finding your location…</p>}
          {(locationError || stationError) && <p className="px-4 py-5 text-sm text-accent">{locationError ?? 'The RapidKL station feed is temporarily unavailable.'}</p>}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3">
          <h2 className="text-xl font-bold text-ink-primary">Station Overview</h2>
          <p className="mt-1 text-xs text-ink-tertiary">Choose a train line, then select a station to see its current mock arrivals.</p>
        </div>
        <div className="grid gap-3 md:max-w-3xl md:grid-cols-2">
          <div>
            <label htmlFor="line-select" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">Train line</label>
            <div className="group relative w-full">
              <select
                id="line-select"
                value={selectedLineKey}
                onChange={(event) => selectLine(event.target.value as StationLineKey)}
                className="w-full appearance-none rounded-2xl border border-hairline/50 bg-surface py-3.5 pl-4 pr-14 text-sm font-medium text-ink-primary shadow-[0_8px_24px_rgba(27,58,87,0.08)] transition duration-200 hover:border-hairline focus:border-accent focus:ring-4 focus:ring-accent/10"
              >
                {STATION_LINE_OPTIONS.map((line) => {
                  const stationCount = gtfsStations?.filter(({ lineKey }) => lineKey === line.key).length;
                  return <option key={line.key} value={line.key}>{line.code} · {line.name}{stationCount ? ` (${stationCount})` : ''}</option>;
                })}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-elevated text-ink-primary transition-colors group-hover:bg-elevated/70"><ChevronDown size={17} /></span>
            </div>
          </div>

          <div>
            <label htmlFor="station-select" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary">Station</label>
            <div className="group relative w-full">
              <select
                id="station-select"
                value={selectedStationId}
                onChange={(event) => setSelectedStationId(event.target.value)}
                disabled={!stationOptions.length}
                className="w-full appearance-none rounded-2xl border border-hairline/50 bg-surface py-3.5 pl-4 pr-14 text-sm font-medium text-ink-primary shadow-[0_8px_24px_rgba(27,58,87,0.08)] transition duration-200 hover:border-hairline focus:border-accent focus:ring-4 focus:ring-accent/10"
              >
                {!stationOptions.length && <option value="">Loading stations…</option>}
                {stationOptions.map((station) => <option key={station.stopId} value={station.stopId}>{station.name} ({station.code})</option>)}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-elevated text-ink-primary transition-colors group-hover:bg-elevated/70"><ChevronDown size={17} /></span>
            </div>
          </div>
        </div>

        {selectedStation ? (
          <div className="mt-3 rounded-lg border border-hairline bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg font-semibold text-ink-primary">{selectedStation.name}</p>
                  <span className="text-xs font-semibold text-ink-tertiary">{selectedStation.code}</span>
                </div>
                <p className="mt-1 text-sm text-ink-secondary">{selectedLineStatus.statusDetail}</p>
                <p className="mt-1.5 text-xs text-ink-tertiary">{selectedStation.structure} · {selectedStation.district}</p>
                <Link href={`/station/${encodeURIComponent(selectedStation.stopId)}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
                  <MapPin size={14} /> View exact station map
                </Link>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${selectedStatusMeta.pill}`}>{selectedStatusMeta.overviewLabel}</span>
            </div>
            <div className="mt-4 divide-y divide-hairline border-t border-hairline">
              {selectedTermini.map((destination, index) => (
                <div key={destination} className="flex items-center gap-3 py-3">
                  <LineBadge lineId={selectedLine.lineId} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-primary">Towards {destination}</p>
                    <p className="text-xs text-ink-tertiary">Platform {index + 1} · Mock arrival</p>
                  </div>
                  <p className="font-display text-sm font-semibold tabular-nums text-ink-primary">{index === 0 ? 4 : 9} min</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-hairline bg-surface p-5 text-sm text-ink-secondary">
            {stationError ? 'The official station directory is temporarily unavailable.' : 'Loading the complete station directory…'}
          </div>
        )}
      </section>
    </div>
  );
}
