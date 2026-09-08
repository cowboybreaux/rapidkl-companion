'use client';

import dynamic from 'next/dynamic';
import useSWR from 'swr';
import type { LiveVehicle } from '@/app/api/transit/live-vehicles/route';

const GoogleTransitMap = dynamic(() => import('@/components/GoogleTransitMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center rounded-md bg-elevated/40 text-sm text-ink-secondary">
      Loading Google Maps…
    </div>
  ),
});

const fetcher = async (url: string): Promise<LiveVehicle[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Live vehicle positions are unavailable');
  return response.json();
};

export default function MapPage() {
  const { data: vehicles, error, isLoading } = useSWR<LiveVehicle[]>(
    '/api/transit/live-vehicles',
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true },
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start justify-between">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl font-semibold text-ink-primary">
            KTM Live Map
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Live train positions on the KTM Komuter line.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ink-tertiary md:mt-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {error ? 'Live feed unavailable' : isLoading ? 'Loading live feed…' : `Live · ${vehicles?.length ?? 0} vehicles`}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-lg border border-hairline bg-surface p-2">
          <GoogleTransitMap vehicles={vehicles ?? []} />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Active vehicles
          </h2>
          {(vehicles ?? []).slice(0, 8).map((vehicle) => (
            <div
              key={vehicle.vehicleId}
              className="rounded-lg border border-hairline bg-surface p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-primary">{vehicle.vehicleId}</span>
                <span className="text-xs text-ink-tertiary">
                  {vehicle.speed === null ? 'Speed unavailable' : `${(vehicle.speed * 3.6).toFixed(0)} km/h`}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary">{vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}</p>
            </div>
          ))}
          {!isLoading && !error && !vehicles?.length && (
            <p className="rounded-lg border border-hairline bg-surface p-3.5 text-sm text-ink-secondary">No active KTM vehicles were returned.</p>
          )}
          {error && <p className="rounded-lg border border-accent/40 bg-accent/10 p-3.5 text-sm text-ink-primary">The KTM feed could not be reached. The map will retry automatically.</p>}
        </div>
      </div>
    </div>
  );
}
