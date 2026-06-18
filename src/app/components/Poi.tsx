import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import poiData from "../../data/poi.json";
import { cn } from "../../lib/cn";

export interface PoiItem {
  id: string;
  name: string;
  address: string;
  url: string;
  lat: number;
  lng: number;
  category: string;
}

const GENEVA_CENTER: [number, number] = [46.2044, 6.1432];
const DEFAULT_ZOOM = 13;
const FOCUS_ZOOM = 16;

const categoryLabels: Record<string, string> = {
  coworking: "Coworking",
};

function getCategoryLabel(category: string): string {
  return categoryLabels[category] ?? category;
}

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

const userLocationIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapFlyTo({
  position,
  zoom,
}: {
  position: [number, number] | null;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom);
    }
  }, [map, position, zoom]);

  return null;
}

export default function Poi() {
  const pois = poiData as PoiItem[];
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const categories = useMemo(
    () => [...new Set(pois.map((poi) => poi.category))].sort(),
    [pois],
  );

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );

  const filteredPois = useMemo(
    () =>
      categoryFilter === "all"
        ? pois
        : pois.filter((poi) => poi.category === categoryFilter),
    [pois, categoryFilter],
  );

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      () => {
        // Geneva stays the default center when permission is denied.
      },
    );
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    markerRefs.current[selectedId]?.openPopup();
  }, [selectedId, flyTo]);

  const handlePoiSelect = useCallback((poi: PoiItem) => {
    setSelectedId(poi.id);
    setFlyTo([poi.lat, poi.lng]);
  }, []);

  const mapCenter = userPosition ?? GENEVA_CENTER;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-light mb-8">Points d&apos;intérêt</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-1 h-[400px] lg:h-[600px] rounded-lg overflow-hidden border border-gray-100 z-0">
          <MapContainer
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFlyTo position={flyTo} zoom={FOCUS_ZOOM} />
            {filteredPois.map((poi) => (
              <Marker
                key={poi.id}
                position={[poi.lat, poi.lng]}
                ref={(ref) => {
                  if (ref) markerRefs.current[poi.id] = ref;
                }}
                eventHandlers={{
                  click: () => setSelectedId(poi.id),
                }}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{poi.name}</p>
                    <p className="text-gray-600">{poi.address}</p>
                    <a
                      href={poi.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--brand)] hover:underline"
                    >
                      Site web
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userPosition && (
              <Marker position={userPosition} icon={userLocationIcon}>
                <Popup>Votre position</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <aside className="lg:w-80 shrink-0">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Catégorie
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-colors",
                  categoryFilter === "all"
                    ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300",
                )}
              >
                Toutes
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition-colors",
                    categoryFilter === category
                      ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300",
                  )}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {filteredPois.map((poi) => (
              <li key={poi.id}>
                <button
                  type="button"
                  onClick={() => handlePoiSelect(poi)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border transition-colors",
                    selectedId === poi.id
                      ? "border-[var(--brand)] bg-gray-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <p className="font-medium text-sm">{poi.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{poi.address}</p>
                </button>
              </li>
            ))}
          </ul>

          {filteredPois.length === 0 && (
            <p className="text-sm text-gray-500 px-1">
              Aucun point dans cette catégorie.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
