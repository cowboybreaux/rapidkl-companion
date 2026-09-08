'use client';

import { divIcon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { LiveVehicle } from '@/app/api/transit/live-vehicles/route';

type KtmLiveMapProps = {
  vehicles: LiveVehicle[];
};

const KUALA_LUMPUR: [number, number] = [3.140853, 101.693207];
const trainIcon = divIcon({
  className: 'ktm-train-marker',
  html: '<span aria-hidden="true">&#128646;</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

export default function KtmLiveMap({ vehicles }: KtmLiveMapProps) {
  return (
    <MapContainer
      center={KUALA_LUMPUR}
      zoom={12}
      scrollWheelZoom
      className="h-[460px] w-full rounded-md"
      aria-label="Live KTM train map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.vehicleId}
          position={[vehicle.latitude, vehicle.longitude]}
          icon={trainIcon}
        >
          <Popup>
            <strong>{vehicle.vehicleId}</strong>
            <br />
            {vehicle.speed === null
              ? 'Speed unavailable'
              : `${(vehicle.speed * 3.6).toFixed(1)} km/h`}
            {vehicle.timestamp && <><br />Updated {new Date(vehicle.timestamp).toLocaleTimeString()}</>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
