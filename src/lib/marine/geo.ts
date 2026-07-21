export type LatLng = [number, number];

export type Bbox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type ShoreSegment = {
  a: LatLng;
  b: LatLng;
};

const EARTH_RADIUS_M = 6_371_000;

export function bboxAround(lat: number, lng: number, radiusKm: number): Bbox {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    south: lat - latDelta,
    west: lng - lngDelta,
    north: lat + latDelta,
    east: lng + lngDelta,
  };
}

export function bboxCenter(bbox: Bbox): LatLng {
  return [(bbox.north + bbox.south) / 2, (bbox.east + bbox.west) / 2];
}

/** Refetch when the boat leaves the inner 70% of the current bbox. */
export function shouldRefetchShore(lat: number, lng: number, bbox: Bbox): boolean {
  const innerRatio = 0.7;
  const halfLat = ((bbox.north - bbox.south) / 2) * innerRatio;
  const halfLng = ((bbox.east - bbox.west) / 2) * innerRatio;
  const [centerLat, centerLng] = bboxCenter(bbox);

  return (
    Math.abs(lat - centerLat) > halfLat || Math.abs(lng - centerLng) > halfLng
  );
}

function latLngToLocalMeters(
  lat: number,
  lng: number,
  refLat: number,
  refLng: number,
): { x: number; y: number } {
  const refLatRad = (refLat * Math.PI) / 180;
  const x =
    ((lng - refLng) * Math.PI) / 180 * EARTH_RADIUS_M * Math.cos(refLatRad);
  const y = ((lat - refLat) * Math.PI) / 180 * EARTH_RADIUS_M;
  return { x, y };
}

function pointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { distance: number; cx: number; cy: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return { distance: Math.hypot(px - ax, py - ay), cx: ax, cy: ay };
  }

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return { distance: Math.hypot(px - cx, py - cy), cx, cy };
}

function localMetersToLatLng(
  x: number,
  y: number,
  refLat: number,
  refLng: number,
): LatLng {
  const refLatRad = (refLat * Math.PI) / 180;
  const lat = refLat + (y / EARTH_RADIUS_M) * (180 / Math.PI);
  const lng =
    refLng + (x / (EARTH_RADIUS_M * Math.cos(refLatRad))) * (180 / Math.PI);
  return [lat, lng];
}

export type NearestShore = {
  distanceM: number;
  point: LatLng;
  bearingDeg: number;
};

/** Bearing from point A to B, degrees clockwise from north (0–360). */
export function bearingDegrees(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

/** Shortest distance from a point to any shoreline segment, in metres. */
export function distanceToShoreMeters(
  lat: number,
  lng: number,
  segments: ShoreSegment[],
): number | null {
  return nearestShorePoint(lat, lng, segments)?.distanceM ?? null;
}

/** Nearest point on the shoreline and bearing to reach it. */
export function nearestShorePoint(
  lat: number,
  lng: number,
  segments: ShoreSegment[],
): NearestShore | null {
  if (segments.length === 0) return null;

  const { x: px, y: py } = latLngToLocalMeters(lat, lng, lat, lng);
  let minDist = Infinity;
  let closest: LatLng | null = null;

  for (const { a, b } of segments) {
    const pointA = latLngToLocalMeters(a[0], a[1], lat, lng);
    const pointB = latLngToLocalMeters(b[0], b[1], lat, lng);
    const { distance, cx, cy } = pointToSegment(
      px,
      py,
      pointA.x,
      pointA.y,
      pointB.x,
      pointB.y,
    );

    if (distance < minDist) {
      minDist = distance;
      closest = localMetersToLatLng(cx, cy, lat, lng);
    }
  }

  if (closest == null || minDist === Infinity) return null;

  return {
    distanceM: minDist,
    point: closest,
    bearingDeg: bearingDegrees(lat, lng, closest[0], closest[1]),
  };
}

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/** Course over ground from two successive GPS fixes, degrees (0–360). */
export function headingFromPositions(
  prev: { lat: number; lng: number },
  next: { lat: number; lng: number },
): number | null {
  const meters = haversineMeters(prev.lat, prev.lng, next.lat, next.lng);
  if (meters < 0.5) return null;
  return bearingDegrees(prev.lat, prev.lng, next.lat, next.lng);
}

/** Speed in km/h from two successive GPS fixes. */
export function speedFromPositions(
  prev: { lat: number; lng: number; time: number },
  next: { lat: number; lng: number; time: number },
): number | null {
  const dt = (next.time - prev.time) / 1000;
  if (dt <= 0) return null;

  const meters = haversineMeters(prev.lat, prev.lng, next.lat, next.lng);
  return (meters / dt) * 3.6;
}

export function msToKmh(speedMs: number | null | undefined): number | null {
  if (speedMs == null || Number.isNaN(speedMs)) return null;
  return speedMs * 3.6;
}

export type DistanceZone = "safe" | "watch" | "danger";

export const DANGER_SPEED_KMH = 10;

export function distanceZone(
  distanceM: number | null,
  speedKmh: number | null,
): DistanceZone {
  if (distanceM == null) return "safe";
  if (distanceM > 500) return "safe";
  if (distanceM <= 300 && speedKmh != null && speedKmh > DANGER_SPEED_KMH) {
    return "danger";
  }
  if (distanceM > 300) return "watch";
  return "safe";
}
