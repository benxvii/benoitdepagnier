import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/cn";
import { useAuth } from "../../contexts/AuthContext";
import PoiLogin from "./PoiLogin";
import PoiForm from "./PoiForm";

export interface PoiItem {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  postal_code: string | null;
  city: string | null;
  url: string | null;
  comment: string | null;
  category: string[];
  amenities: string[];
  lat: number;
  lng: number;
  visibility: "public" | "private";
  tier: "gratuit" | "payant" | "abonne";
  created_at: string;
  profiles: { nickname: string } | null;
}

const GENEVA_CENTER: [number, number] = [46.2044, 6.1432];
const DEFAULT_ZOOM = 13;
const FOCUS_ZOOM = 16;

const categoryLabels: Record<string, string> = {
  coworking: "Coworking",
  cafe_sympa: "Café sympa",
  bibliotheque: "Bibliothèque",
  terrasse_exterieur: "Terrasse / extérieur",
  hotel_coworking: "Hôtel avec coworking",
  salle_reunion: "Salle de réunion",
};

function getCategoryLabel(category: string): string {
  return categoryLabels[category] ?? category;
}

const amenityLabels: Record<string, string> = {
  wifi: "Wifi",
  prises_electriques: "Prises électriques",
  calme: "Calme",
  parking: "Parking",
  accessible_pmr: "Accessible PMR",
  ouvert_weekend: "Ouvert le weekend",
};

const tierLabels: Record<string, string> = {
  gratuit: "Gratuit",
  payant: "Payant",
  abonne: "Abonné",
};

const tierColors: Record<string, string> = {
  gratuit: "bg-green-50 text-green-700 border-green-200",
  payant: "bg-amber-50 text-amber-700 border-amber-200",
  abonne: "bg-blue-50 text-blue-700 border-blue-200",
};

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

const newPoiIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
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

function MapClickHandler({
  active,
  onClick,
}: {
  active: boolean;
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (active) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Poi() {
  const { user, signOut } = useAuth();
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const [pois, setPois] = useState<PoiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(pois.flatMap((poi) => poi.category))].sort(),
    [pois],
  );

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newPosition, setNewPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | "public" | "private"
  >("all");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [nicknameFilter, setNicknameFilter] = useState<string>("all");

  const nicknames = useMemo(
    () =>
      [
        ...new Set(
          pois
            .map((poi) => poi.profiles?.nickname)
            .filter((n): n is string => Boolean(n)),
        ),
      ].sort(),
    [pois],
  );

  const toggleAmenityFilter = (amenity: string) => {
    setAmenityFilter((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const filteredPois = useMemo(
    () =>
      pois.filter((poi) => {
        const matchesCategory =
          categoryFilter === "all" || poi.category.includes(categoryFilter);
        const matchesVisibility =
          visibilityFilter === "all" || poi.visibility === visibilityFilter;
        const matchesAmenities = amenityFilter.every((a) =>
          poi.amenities.includes(a),
        );
        const matchesNickname =
          nicknameFilter === "all" ||
          poi.profiles?.nickname === nicknameFilter;
        return (
          matchesCategory &&
          matchesVisibility &&
          matchesAmenities &&
          matchesNickname
        );
      }),
    [pois, categoryFilter, visibilityFilter, amenityFilter, nicknameFilter],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPois() {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from("poi")
        .select("*, profiles(nickname)")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setLoadError(error.message);
      } else {
        setPois((data ?? []) as PoiItem[]);
      }

      setLoading(false);
    }

    loadPois();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleAddPoi = async (
    data: Omit<PoiItem, "id" | "owner_id" | "created_at">,
  ) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from("poi")
      .insert({ ...data, owner_id: user.id })
      .select()
      .single();
    if (error) {
      console.error(error);
      return;
    }
    setPois((prev) => [inserted as PoiItem, ...prev]);
    setIsAdding(false);
    setNewPosition(null);
  };

  const handleEditPoi = async (
    data: Omit<PoiItem, "id" | "owner_id" | "created_at">,
  ) => {
    if (!editingId) return;
    const { data: updated, error } = await supabase
      .from("poi")
      .update(data)
      .eq("id", editingId)
      .select()
      .single();
    if (error) {
      console.error(error);
      return;
    }
    setPois((prev) =>
      prev.map((poi) => (poi.id === editingId ? (updated as PoiItem) : poi)),
    );
    setEditingId(null);
    setEditingPosition(null);
  };

  const handleDeletePoi = async (id: string) => {
    const { error } = await supabase.from("poi").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    setPois((prev) => prev.filter((poi) => poi.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const editingPoi = editingId
    ? (pois.find((poi) => poi.id === editingId) ?? null)
    : null;

  const mapCenter = userPosition ?? GENEVA_CENTER;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-light mb-8">Points d&apos;intérêt</h1>

      {user ? (
        <div className="flex items-center justify-between max-w-sm border border-gray-100 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm text-gray-600">{user.email}</p>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <PoiLogin />
      )}

      {user &&
        (editingPoi ? (
          <PoiForm
            position={editingPosition}
            onPositionChange={setEditingPosition}
            initialData={editingPoi}
            submitLabel="Enregistrer les modifications"
            onCancel={() => {
              setEditingId(null);
              setEditingPosition(null);
            }}
            onSubmit={handleEditPoi}
          />
        ) : isAdding ? (
          <PoiForm
            position={newPosition}
            onPositionChange={setNewPosition}
            onCancel={() => {
              setIsAdding(false);
              setNewPosition(null);
            }}
            onSubmit={handleAddPoi}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mb-8 px-4 py-2 text-sm rounded-md bg-[var(--brand)] text-white hover:opacity-90 transition-opacity"
          >
            + Ajouter un point
          </button>
        ))}

      {loading ? (
        <p className="text-sm text-gray-500">Chargement des points...</p>
      ) : loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : (
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
              <MapClickHandler
                active={isAdding}
                onClick={(lat, lng) => setNewPosition({ lat, lng })}
              />
              <MapClickHandler
                active={editingId !== null}
                onClick={(lat, lng) => setEditingPosition({ lat, lng })}
              />
              {isAdding && newPosition && (
                <Marker
                  position={[newPosition.lat, newPosition.lng]}
                  icon={newPoiIcon}
                >
                  <Popup>Nouveau point</Popup>
                </Marker>
              )}
              {editingId !== null && editingPosition && (
                <Marker
                  position={[editingPosition.lat, editingPosition.lng]}
                  icon={newPoiIcon}
                >
                  <Popup>Point en édition</Popup>
                </Marker>
              )}
              {filteredPois.map((poi) => (
                <Marker
                  key={poi.id}
                  position={[poi.lat, poi.lng]}
                  ref={(ref) => {
                    if (ref) markerRefs.current[poi.id] = ref;
                  }}
                  eventHandlers={{
                    click: () => setSelectedId(poi.id),
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                  }}
                >
                  <Popup>
                    <div className="text-sm space-y-2 relative pr-16">
                      <div className="absolute top-0 right-0 flex flex-col items-end gap-1">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 text-xs rounded-full border",
                            tierColors[poi.tier],
                          )}
                        >
                          {tierLabels[poi.tier]}
                        </span>
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full border bg-sky-50 text-sky-700 border-sky-200">
                          {poi.profiles?.nickname ?? "Inconnu"}
                        </span>
                      </div>
                      <div className="font-medium">{poi.name}</div>
                      <div className="text-gray-600">{poi.address}</div>
                      <div className="text-gray-500 text-xs">
                        {poi.category.map(getCategoryLabel).join(", ")}
                      </div>
                      {poi.amenities.length > 0 && (
                        <div className="text-gray-600 text-xs">
                          {poi.amenities
                            .map((a) => amenityLabels[a])
                            .join(", ")}
                        </div>
                      )}
                      {poi.comment && (
                        <div className="italic text-gray-500 text-xs whitespace-pre-wrap">
                          {poi.comment}
                        </div>
                      )}
                      <a
                        href={poi.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--brand)] hover:underline"
                      >
                        Site web
                      </a>
                      {poi.owner_id === user?.id && (
                        <div className="flex gap-3 pt-1 mt-1 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAdding(false);
                              setNewPosition(null);
                              setEditingId(poi.id);
                              setEditingPosition({ lat: poi.lat, lng: poi.lng });
                            }}
                            className="text-xs text-[var(--brand)] hover:underline"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Supprimer "${poi.name}" ?`)) {
                                handleDeletePoi(poi.id);
                              }
                            }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
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

            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Visibilité
              </p>
              <div className="flex flex-wrap gap-2">
                {(["all", "public", "private"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibilityFilter(v)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full border transition-colors",
                      visibilityFilter === v
                        ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300",
                    )}
                  >
                    {v === "all" ? "Toutes" : v === "public" ? "Public" : "Privé"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Équipements
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(amenityLabels).map(([slug, label]) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggleAmenityFilter(slug)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full border transition-colors",
                      amenityFilter.includes(slug)
                        ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Ajouté par
              </p>
              <select
                value={nicknameFilter}
                onChange={(e) => setNicknameFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600"
              >
                <option value="all">Tous</option>
                {nicknames.map((nickname) => (
                  <option key={nickname} value={nickname}>
                    {nickname}
                  </option>
                ))}
              </select>
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
                    <p className="text-xs text-gray-500 mt-0.5">
                      {poi.address}
                    </p>
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
      )}
    </div>
  );
}
