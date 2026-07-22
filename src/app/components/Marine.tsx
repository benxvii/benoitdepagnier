import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShoreAlarms } from "../../lib/marine/alarms";
import {
  distanceZone,
  headingFromPositions,
  msToKmh,
  nearestShorePoint as computeNearestShorePoint,
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

function formatBearing(deg: number | null): string {
  if (deg == null) return "—";
  return `${Math.round(deg).toString().padStart(3, "0")}°`;
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
  const [headingDeg, setHeadingDeg] = useState<number | null>(null);
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [shoreBearingDeg, setShoreBearingDeg] = useState<number | null>(null);
  const [nearestShorePoint, setNearestShorePoint] = useState<LatLng | null>(null);
  const [shoreLines, setShoreLines] = useState<LatLng[][]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [shoreStatus, setShoreStatus] = useState<
    "loading" | "ready" | "cached" | "error"
  >("loading");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testDistanceM, setTestDistanceM] = useState(700);
  const [testSpeedKmh, setTestSpeedKmh] = useState(15);

  const displayDistanceM = testMode ? testDistanceM : distanceM;
  const displaySpeedKmh = testMode ? testSpeedKmh : speedKmh;

  const zone = useMemo(
    () => distanceZone(displayDistanceM, displaySpeedKmh),
    [displayDistanceM, displaySpeedKmh],
  );
  const styles = zoneStyles[zone];

  const recalcDistance = useCallback((lat: number, lng: number, speed: number | null) => {
    const shore = shoreRef.current;
    if (!shore || shore.segments.length === 0) {
      setDistanceM(null);
      setShoreBearingDeg(null);
      setNearestShorePoint(null);
      return;
    }

    const nearest = computeNearestShorePoint(lat, lng, shore.segments);
    setDistanceM(nearest?.distanceM ?? null);
    setShoreBearingDeg(nearest?.bearingDeg ?? null);
    setNearestShorePoint(nearest?.point ?? null);
    alarmsRef.current.update(nearest?.distanceM ?? null, speed);
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

  const enableAudio = useCallback(() => {
    void alarmsRef.current.ensureAudio().then(() => {
      setAudioUnlocked(alarmsRef.current.isAudioRunning());
    });
  }, []);

  const handleGeoUpdate = useCallback(
    (
      lat: number,
      lng: number,
      speedMs: number | null,
      heading: number | null,
      time: number,
    ) => {
      positionRef.current = [lat, lng];
      setPosition([lat, lng]);
      setGeoError(null);
      enableAudio();

      const gpsSpeed = msToKmh(speedMs);
      const prev = prevFixRef.current;
      let computedSpeed = gpsSpeed;

      if (computedSpeed == null && prev) {
        computedSpeed = speedFromPositions(prev, { lat, lng, time });
      }

      let computedHeading = heading;
      if (computedHeading == null && prev) {
        computedHeading = headingFromPositions(prev, { lat, lng });
      }

      setSpeedKmh(computedSpeed);
      setHeadingDeg(computedHeading);
      prevFixRef.current = { lat, lng, time, speedKmh: computedSpeed };

      recalcDistance(lat, lng, computedSpeed);

      void loadShore(lat, lng);
    },
    [enableAudio, loadShore, recalcDistance],
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
          fix.coords.heading,
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
          fix.coords.heading,
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

  useEffect(() => {
    if (!testMode) return;
    alarmsRef.current.update(testDistanceM, testSpeedKmh);
  }, [testMode, testDistanceM, testSpeedKmh]);

  const toggleTestMode = useCallback(() => {
    enableAudio();
    alarmsRef.current.reset();
    setTestMode((prev) => {
      const next = !prev;
      if (next) {
        setTestDistanceM(700);
        setTestSpeedKmh(15);
      }
      return next;
    });
  }, [enableAudio]);

  useEffect(() => {
    if (audioUnlocked) return;

    // Capture phase so a tap on the map (which may stop propagation) still unlocks audio.
    const events: Array<keyof DocumentEventMap> = [
      "pointerdown",
      "touchstart",
      "click",
      "keydown",
    ];
    events.forEach((event) =>
      document.addEventListener(event, enableAudio, { capture: true }),
    );

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, enableAudio, { capture: true }),
      );
    };
  }, [audioUnlocked, enableAudio]);

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
            <div className="flex flex-col gap-y-1">
              <div className="flex items-baseline gap-x-1.5">
                <span
                  className={cn(
                    "text-5xl sm:text-6xl font-bold tabular-nums",
                    styles.text,
                  )}
                >
                  {formatSpeed(displaySpeedKmh)}
                </span>
                <span className="text-sm text-slate-400">km/h</span>
              </div>
              <div className="flex items-baseline gap-x-1.5">
                <span
                  className={cn(
                    "text-[2.25rem] sm:text-[2.8125rem] font-bold tabular-nums",
                    styles.text,
                  )}
                >
                  {formatBearing(testMode ? null : headingDeg)}
                </span>
                <span className="text-sm text-slate-400">cap</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Rive
            </p>
            <div className="ml-auto flex flex-col items-end gap-y-1">
              <div className="flex items-baseline gap-x-1.5">
                <span
                  className={cn(
                    "text-5xl sm:text-6xl font-bold tabular-nums",
                    styles.text,
                  )}
                >
                  {displayDistanceM != null && displayDistanceM >= 1000
                    ? (displayDistanceM / 1000).toFixed(2)
                    : formatDistance(displayDistanceM).replace(" m", "").replace(" km", "")}
                </span>
                <span className="text-sm text-slate-400">
                  {displayDistanceM != null && displayDistanceM >= 1000 ? "km" : "m"}
                </span>
              </div>
              <div className="flex items-baseline gap-x-1.5">
                <span
                  className={cn(
                    "text-[2.25rem] sm:text-[2.8125rem] font-bold tabular-nums",
                    styles.text,
                  )}
                >
                  {formatBearing(testMode ? null : shoreBearingDeg)}
                </span>
                <span className="text-sm text-slate-400">rel.</span>
              </div>
            </div>
          </div>

          <p className={cn("col-span-2 text-center text-sm font-medium", styles.text)}>
            {styles.label}
            {testMode && " · mode test"}
            {!testMode && shoreStatus === "loading" && " · tracé en cours…"}
            {!testMode && shoreStatus === "cached" && " · tracé en cache"}
            {!testMode && shoreStatus === "error" && " · tracé indisponible"}
          </p>
        </div>

        {geoError && (
          <p className="text-center text-sm text-[#f87171]">{geoError}</p>
        )}

        {!audioUnlocked && (
          <button
            type="button"
            onClick={enableAudio}
            className="w-full rounded-xl border border-[#fb923c]/40 bg-[#fb923c]/15 px-4 py-2.5 text-sm font-medium text-[#fb923c] active:scale-[0.99] transition-transform"
          >
            🔇 Son désactivé — touchez pour activer l&apos;alarme
          </button>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleTestMode}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              testMode
                ? "border-[#5eead4]/50 bg-[#5eead4]/15 text-[#5eead4]"
                : "border-slate-600 text-slate-400",
            )}
          >
            🧪 {testMode ? "Quitter le mode test" : "Mode test (sans GPS)"}
          </button>
        </div>

        {testMode && (
          <div className="rounded-2xl border border-slate-600/60 bg-slate-800/40 p-4 space-y-4">
            <p className="text-xs text-slate-400">
              Déplace les curseurs pour simuler l&apos;approche de la côte et
              vérifier que le son et les vibrations se déclenchent bien sur
              cet appareil.
            </p>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Distance simulée</span>
                <span className={cn("font-semibold tabular-nums", styles.text)}>
                  {formatDistance(testDistanceM)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={800}
                step={5}
                value={testDistanceM}
                onChange={(e) => setTestDistanceM(Number(e.target.value))}
                className="w-full accent-[#5eead4]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Vitesse simulée</span>
                <span className={cn("font-semibold tabular-nums", styles.text)}>
                  {testSpeedKmh} km/h
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={testSpeedKmh}
                onChange={(e) => setTestSpeedKmh(Number(e.target.value))}
                className="w-full accent-[#5eead4]"
              />
            </div>
          </div>
        )}

        <div className="h-[45vh] sm:h-[50vh] rounded-2xl overflow-hidden border border-slate-500/50 ring-1 ring-white/10">
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Carte…
              </div>
            }
          >
            <MarineMap
              position={position}
              shoreLines={shoreLines}
              nearestShorePoint={nearestShorePoint}
            />
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
