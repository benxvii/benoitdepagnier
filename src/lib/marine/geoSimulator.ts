import { bearingDegrees } from "./geo";

const UPDATE_INTERVAL_MS = 1000;

type SimPoint = { lat: number; lng: number };

function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const earthRadiusM = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusM * Math.asin(Math.sqrt(h));
}

function segmentDurationMs(from: SimPoint, to: SimPoint, speedKmh: number): number {
  const distance = haversineMeters(from, to);
  return (distance / (speedKmh / 3.6)) * 1000;
}

export function isSimulationEnabled(): boolean {
  return localStorage.getItem("marineSimRoute") != null;
}

export function startSimulatedWatch(
  success: (position: GeolocationPosition) => void,
): number {
  const route = JSON.parse(
    localStorage.getItem("marineSimRoute")!,
  ) as SimPoint[];
  const speedKmh = Number(localStorage.getItem("marineSimSpeedKmh")) || 40;
  const speedMs = speedKmh / 3.6;

  let segmentIndex = 0;
  let progress = 0;
  let segmentDuration = segmentDurationMs(
    route[segmentIndex],
    route[(segmentIndex + 1) % route.length],
    speedKmh,
  );

  const emit = () => {
    const from = route[segmentIndex];
    const to = route[(segmentIndex + 1) % route.length];
    const lat = from.lat + (to.lat - from.lat) * progress;
    const lng = from.lng + (to.lng - from.lng) * progress;

    const heading = bearingDegrees(from.lat, from.lng, to.lat, to.lng);

    const coords: GeolocationCoordinates = {
      latitude: lat,
      longitude: lng,
      accuracy: 5,
      speed: speedMs,
      altitude: null,
      altitudeAccuracy: null,
      heading,
      toJSON() {
        return { ...this };
      },
    };

    success({ coords, timestamp: Date.now() } as GeolocationPosition);
  };

  emit();

  return window.setInterval(() => {
    progress += UPDATE_INTERVAL_MS / segmentDuration;

    if (progress >= 1) {
      progress = 0;
      segmentIndex = (segmentIndex + 1) % route.length;
      segmentDuration = segmentDurationMs(
        route[segmentIndex],
        route[(segmentIndex + 1) % route.length],
        speedKmh,
      );
    }

    emit();
  }, UPDATE_INTERVAL_MS);
}

export function clearSimulatedWatch(id: number): void {
  clearInterval(id);
}
