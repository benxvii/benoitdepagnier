import type { Bbox, LatLng, ShoreSegment } from "./geo";
import { bboxAround } from "./geo";

export const SHORE_CACHE_KEY = "coteLeman_shore";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const BBOX_RADIUS_KM = 6;

export type ShoreCache = {
  bbox: Bbox;
  segments: ShoreSegment[];
  fetchedAt: number;
};

type OverpassNode = { lat: number; lon: number };
type OverpassWay = { geometry?: OverpassNode[] };

type OverpassResponse = {
  elements?: OverpassWay[];
};

function buildOverpassQuery(bbox: Bbox): string {
  const { south, west, north, east } = bbox;
  return `[out:json][timeout:25];
(
  way["natural"="water"]["name"~"Léman",i](${south},${west},${north},${east});
  way["natural"="coastline"]["name"~"Léman",i](${south},${west},${north},${east});
);
out geom;`;
}

function waysToSegments(ways: OverpassWay[]): ShoreSegment[] {
  const segments: ShoreSegment[] = [];

  for (const way of ways) {
    const geom = way.geometry;
    if (!geom || geom.length < 2) continue;

    for (let i = 0; i < geom.length - 1; i += 1) {
      segments.push({
        a: [geom[i].lat, geom[i].lon],
        b: [geom[i + 1].lat, geom[i + 1].lon],
      });
    }
  }

  return segments;
}

export function readShoreCache(): ShoreCache | null {
  try {
    const raw = localStorage.getItem(SHORE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShoreCache;
    if (!parsed.bbox || !Array.isArray(parsed.segments)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeShoreCache(cache: ShoreCache): void {
  try {
    localStorage.setItem(SHORE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or unavailable — ignore.
  }
}

export async function fetchShoreSegments(
  lat: number,
  lng: number,
): Promise<ShoreCache> {
  const bbox = bboxAround(lat, lng, BBOX_RADIUS_KM);
  const query = buildOverpassQuery(bbox);

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass ${response.status}`);
  }

  const data = (await response.json()) as OverpassResponse;
  const segments = waysToSegments(data.elements ?? []);
  const cache: ShoreCache = {
    bbox,
    segments,
    fetchedAt: Date.now(),
  };

  if (segments.length > 0) {
    writeShoreCache(cache);
  }

  return cache;
}

/** Flat list of coordinates for Leaflet polyline rendering. */
export function segmentsToPolylines(segments: ShoreSegment[]): LatLng[][] {
  const chains = new Map<string, LatLng[]>();

  for (const { a, b } of segments) {
    const keyA = `${a[0].toFixed(6)},${a[1].toFixed(6)}`;
    const keyB = `${b[0].toFixed(6)},${b[1].toFixed(6)}`;

    const chainA = chains.get(keyA);
    const chainB = chains.get(keyB);

    if (chainA && chainB && chainA !== chainB) {
      chainA.push(...chainB.slice(1));
      chains.delete(keyB);
      chains.set(keyB, chainA);
      continue;
    }

    if (chainA) {
      chainA.push(b);
      chains.set(keyB, chainA);
      continue;
    }

    if (chainB) {
      chainB.unshift(a);
      chains.set(keyA, chainB);
      continue;
    }

    const chain: LatLng[] = [a, b];
    chains.set(keyA, chain);
    chains.set(keyB, chain);
  }

  return [...new Set(chains.values())];
}
