import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShoreAlarms } from "../../lib/marine/alarms";
import {
  distanceToShoreMeters,
  distanceZone,
  msToKmh,
  shouldRefetchShore,
  speedFromPositions,
  type DistanceZone,
  type LatLng,
} from "../../lib/marine/geo";
import {
  fetchShoreSegments,
  readShoreCache,
  segmentsToPolylines,
  type ShoreCache,
} from "../../lib/marine/overpass";
import {
  clearSimulatedWatch,
  isSimulationEnabled,
  startSimulatedWatch,
} from "../../lib/marine/geoSimulator";
import { cn } from "../../lib/cn";

const MarineMap = lazy(() => import("./MarineMap"));

type GeoFix = {
  lat: number;
  lng: number;
  time: number;
  speedKmh: number | null;
};

const zoneStyles: Record<
  DistanceZone,
  { bg: string; text: string; label: string }
> = {
  safe: {
    bg: "bg-[#5eead4]/15 border-[#5eead4]/40",
    text: "text-[#5eead4]",
    label: "Zone sûre",
  },
  watch: {
    bg: "bg-[#fb923c]/15 border-[#fb923c]/40",
    text: "text-[#fb923c]",
    label: "Vigilance",
  },
  danger: {
    bg: "bg-[#f87171]/20 border-[#f87171]/50",
    text: "text-[#f87171]",
    label: "Danger",
  },
};

function formatSpeed(speedKmh: number | null): string {
  if (speedKmh == null) return "—";
  return `${speedKmh.toFixed(1)}`;
}

function formatDistance(distanceM: number | null): string {
  if (distanceM == null) return "—";
  if (distanceM >= 1000) return `${(distanceM / 1000).toFixed(2)} km`;
  return `${Math.round(distanceM)} m`;
}

export default function Marine() {
  const alarmsRef = useRef(new ShoreAlarms());
  const prevFixRef = useRef<GeoFix | null>(null);
  const shoreRef = useRef<ShoreCache | null>(null);
  const positionRef = useRef<LatLng | null>(null);
  const fetchInFlightRef = useRef(false);

  const [position, setPosition] = useState<LatLng | null>(null);
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [shoreLines, setShoreLines] = useState<LatLng[][]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [shoreStatus, setShoreStatus] = useState<
    "loading" | "ready" | "cached" | "error"
  >("loading");

  const zone = useMemo(
    () => distanceZone(distanceM, speedKmh),
    [distanceM, speedKmh],
  );
  const styles = zoneStyles[zone];

  const recalcDistance = useCallback((lat: number, lng: number, speed: number | null) => {
    const shore = shoreRef.current;
    if (!shore || shore.segments.length === 0) {
      setDistanceM(null);
      return;
    }

    const dist = distanceToShoreMeters(lat, lng, shore.segments);
    setDistanceM(dist);
    alarmsRef.current.update(dist, speed);
  }, []);

  const applyShoreCache = useCallback(
    (cache: ShoreCache) => {
      shoreRef.current = cache;
      setShoreLines(segmentsToPolylines(cache.segments));

      const pos = positionRef.current;
      if (pos) {
        recalcDistance(pos[0], pos[1], prevFixRef.current?.speedKmh ?? null);
      }
    },
    [recalcDistance],
  );

  const loadShore = useCallback(
    async (lat: number, lng: number, force = false) => {
      if (fetchInFlightRef.current) return;

      const current = shoreRef.current;
      if (!force && current && !shouldRefetchShore(lat, lng, current.bbox)) {
        return;
      }

      fetchInFlightRef.current = true;
      setShoreStatus("loading");

      try {
        const cache = await fetchShoreSegments(lat, lng);
        if (cache.segments.length > 0) {
          applyShoreCache(cache);
          setShoreStatus("ready");
        } else {
          setShoreStatus("error");
        }
      } catch {
        const cached = readShoreCache();
        if (cached) {
          applyShoreCache(cached);
          setShoreStatus("cached");
        } else {
          setShoreStatus("error");
        }
      } finally {
        fetchInFlightRef.current = false;
      }
    },
    [applyShoreCache],
  );

  const handleGeoUpdate = useCallback(
    (lat: number, lng: number, speedMs: number | null, time: number) => {
      positionRef.current = [lat, lng];
      setPosition([lat, lng]);
      setGeoError(null);
      alarmsRef.current.ensureAudio();

      const gpsSpeed = msToKmh(speedMs);
      const prev = prevFixRef.current;
      let computedSpeed = gpsSpeed;

      if (computedSpeed == null && prev) {
        computedSpeed = speedFromPositions(prev, { lat, lng, time });
      }

      setSpeedKmh(computedSpeed);
      prevFixRef.current = { lat, lng, time, speedKmh: computedSpeed };

      recalcDistance(lat, lng, computedSpeed);

      void loadShore(lat, lng);
    },
    [loadShore, recalcDistance],
  );

  useEffect(() => {
    const cached = readShoreCache();
    if (cached) {
      applyShoreCache(cached);
      setShoreStatus("cached");
    }

    if (isSimulationEnabled()) {
      const watchId = startSimulatedWatch((fix) => {
        handleGeoUpdate(
          fix.coords.latitude,
          fix.coords.longitude,
          fix.coords.speed,
          fix.timestamp,
        );
      });

      return () => clearSimulatedWatch(watchId);
    }

    if (!navigator.geolocation) {
      setGeoError("Géolocalisation indisponible sur cet appareil.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (fix) => {
        handleGeoUpdate(
          fix.coords.latitude,
          fix.coords.longitude,
          fix.coords.speed,
          fix.timestamp,
        );
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Autorisez la géolocalisation pour utiliser cette page."
            : "Impossible d'obtenir la position GPS.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [applyShoreCache, handleGeoUpdate]);

  const enableAudio = useCallback(() => {
    alarmsRef.current.ensureAudio();
  }, []);

  return (
    <div
      className="min-h-[calc(100vh-5rem)] bg-[#0a1628] text-slate-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6"
      onPointerDown={enableAudio}
    >
      <div className="max-w-7xl mx-auto space-y-4">
        <div
          className={cn(
            "grid grid-cols-2 gap-3 rounded-2xl border p-4 sm:p-6 transition-colors",
            styles.bg,
          )}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Vitesse
            </p>
            <p className={cn("text-5xl sm:text-6xl font-bold tabular-nums", styles.text)}>
              {formatSpeed(speedKmh)}
            </p>
            <p className="text-sm text-slate-400 mt-1">km/h</p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Rive
            </p>
            <p className={cn("text-5xl sm:text-6xl font-bold tabular-nums", styles.text)}>
              {distanceM != null && distanceM >= 1000
                ? (distanceM / 1000).toFixed(2)
                : formatDistance(distanceM).replace(" m", "").replace(" km", "")}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {distanceM != null && distanceM >= 1000 ? "km" : "m"}
            </p>
          </div>

          <p className={cn("col-span-2 text-center text-sm font-medium", styles.text)}>
            {styles.label}
            {shoreStatus === "loading" && " · tracé en cours…"}
            {shoreStatus === "cached" && " · tracé en cache"}
            {shoreStatus === "error" && " · tracé indisponible"}
          </p>
        </div>

        {geoError && (
          <p className="text-center text-sm text-[#f87171]">{geoError}</p>
        )}

        <div className="h-[45vh] sm:h-[50vh] rounded-2xl overflow-hidden border border-slate-500/50 ring-1 ring-white/10">
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Carte…
              </div>
            }
          >
            <MarineMap position={position} shoreLines={shoreLines} />
          </Suspense>
        </div>

        <div className="flex justify-center gap-6 text-xs text-slate-500 pb-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#5eead4]" />
            &gt; 500 m
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#fb923c]" />
            300–500 m
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#f87171]" />
            ≤ 300 m si &gt; 10 km/h
          </span>
        </div>
      </div>
    </div>
  );
}
