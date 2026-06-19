import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "../../lib/marine/geo";

const LEMAN_CENTER: LatLng = [46.45, 6.55];
const DEFAULT_ZOOM = 13;

const boatIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#5eead4;border:3px solid #0f172a;border-radius:50%;box-shadow:0 0 8px rgba(94,234,212,0.8);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapFollow({
  position,
}: {
  position: LatLng | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true });
    }
  }, [map, position]);

  return null;
}

export interface MarineMapProps {
  position: LatLng | null;
  shoreLines: LatLng[][];
}

export default function MarineMap({ position, shoreLines }: MarineMapProps) {
  const center = position ?? LEMAN_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapFollow position={position} />
      {shoreLines.map((line, index) => (
        <Polyline
          key={index}
          positions={line}
          pathOptions={{ color: "#5eead4", weight: 2, opacity: 0.85 }}
        />
      ))}
      {position && (
        <Marker position={position} icon={boatIcon} />
      )}
    </MapContainer>
  );
}
