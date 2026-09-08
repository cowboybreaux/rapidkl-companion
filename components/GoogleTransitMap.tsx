'use client';

import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import type { LiveVehicle } from '@/app/api/transit/live-vehicles/route';
import type { GtfsStation } from '@/lib/types';

type Position = { lat: number; lng: number };
type GoogleTransitMapProps = { vehicles: LiveVehicle[] };

const KUALA_LUMPUR: Position = { lat: 3.140853, lng: 101.693207 };
const containerStyle = { width: '100%', height: '460px' };

const stationFetcher = async (url: string): Promise<GtfsStation[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Station coordinates are unavailable');
  return response.json();
};

function LoadedMap({ vehicles, apiKey }: GoogleTransitMapProps & { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({ id: 'rapidkl-google-map', googleMapsApiKey: apiKey });
  const { data: stations, error: stationError } = useSWR<GtfsStation[]>('/api/transit/stations', stationFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1_000,
  });
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [locationMessage, setLocationMessage] = useState('Requesting your location…');
  const [selectedStation, setSelectedStation] = useState<GtfsStation | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition({ lat: coords.latitude, lng: coords.longitude });
        setLocationMessage('Map centred on your location.');
      },
      () => setLocationMessage('Location access was unavailable. Showing central Kuala Lumpur.'),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const center = userPosition ?? KUALA_LUMPUR;

  if (loadError) return <div className="flex h-[460px] items-center justify-center bg-elevated/40 p-6 text-center text-sm text-accent">Google Maps could not be loaded. Check the API key and its domain restrictions.</div>;
  if (!isLoaded) return <div className="flex h-[460px] items-center justify-center bg-elevated/40 text-sm text-ink-secondary">Loading Google Maps…</div>;

  return (
    <div className="relative">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13} options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: true }}>
        {userPosition && <MarkerF position={userPosition} title="Your location" label={{ text: '●', color: '#102A43', fontSize: '18px' }} />}
        {(stations ?? []).map((station) => (
          <MarkerF key={station.stopId} position={{ lat: station.latitude, lng: station.longitude }} title={station.name} onClick={() => setSelectedStation(station)} label={{ text: 'S', color: '#FFFFFF', fontWeight: '700' }} />
        ))}
        {vehicles.map((vehicle) => (
          <MarkerF key={vehicle.vehicleId} position={{ lat: vehicle.latitude, lng: vehicle.longitude }} title={`KTM ${vehicle.vehicleId}`} label={{ text: '🚆', fontSize: '17px' }} />
        ))}
        {selectedStation && (
          <InfoWindowF position={{ lat: selectedStation.latitude, lng: selectedStation.longitude }} onCloseClick={() => setSelectedStation(null)}>
            <div className="max-w-52 text-sm text-[#102A43]"><strong>{selectedStation.name}</strong><br />{selectedStation.code} · {selectedStation.district}</div>
          </InfoWindowF>
        )}
      </GoogleMap>
      <p className="absolute bottom-2 left-2 rounded bg-white/90 px-2.5 py-1.5 text-xs text-ink-primary shadow">
        {stationError ? 'Station feed unavailable; retrying automatically.' : `${locationMessage} · ${stations?.length ?? 0} station-line locations`}
      </p>
    </div>
  );
}

export default function GoogleTransitMap(props: GoogleTransitMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return <div className="flex h-[460px] items-center justify-center bg-elevated/40 p-6 text-center text-sm text-accent">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to display the map.</div>;
  return <LoadedMap {...props} apiKey={apiKey} />;
}
