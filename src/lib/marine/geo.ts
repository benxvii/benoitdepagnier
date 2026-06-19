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

function pointToSegmentMeters(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.hypot(px - ax, py - ay);
  }

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/** Shortest distance from a point to any shoreline segment, in metres. */
export function distanceToShoreMeters(
  lat: number,
  lng: number,
  segments: ShoreSegment[],
): number | null {
  if (segments.length === 0) return null;

  const { x: px, y: py } = latLngToLocalMeters(lat, lng, lat, lng);
  let min = Infinity;

  for (const { a, b } of segments) {
    const pointA = latLngToLocalMeters(a[0], a[1], lat, lng);
    const pointB = latLngToLocalMeters(b[0], b[1], lat, lng);
    const dist = pointToSegmentMeters(
      px,
      py,
      pointA.x,
      pointA.y,
      pointB.x,
      pointB.y,
    );
    if (dist < min) min = dist;
  }

  return min === Infinity ? null : min;
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

export function distanceZone(distanceM: number | null): DistanceZone {
  if (distanceM == null) return "safe";
  if (distanceM <= 150) return "danger";
  if (distanceM <= 500) return "watch";
  return "safe";
}
