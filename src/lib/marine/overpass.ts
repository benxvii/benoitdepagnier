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
type OverpassWay = {
  type?: string;
  geometry?: OverpassNode[];
};

type OverpassResponse = {
  elements?: OverpassWay[];
};

const LAKE_NAME_FILTER =
  '"name"~"Léman|Leman|Lake Geneva|Genfersee|lac léman|lac leman",i';

function buildOverpassQuery(bbox: Bbox, broad = false): string {
  const { south, west, north, east } = bbox;

  if (broad) {
    return `[out:json][timeout:25];
(
  relation["natural"="water"](${south},${west},${north},${east});
  way["natural"="water"](${south},${west},${north},${east});
);
(._;>;);
out geom;`;
  }

  return `[out:json][timeout:25];
(
  relation["natural"="water"][${LAKE_NAME_FILTER}](${south},${west},${north},${east});
  way["natural"="water"][${LAKE_NAME_FILTER}](${south},${west},${north},${east});
  way["natural"="coastline"][${LAKE_NAME_FILTER}](${south},${west},${north},${east});
);
(._;>;);
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

function elementsToSegments(elements: OverpassWay[]): ShoreSegment[] {
  const ways = elements.filter(
    (el) => el.type === "way" && el.geometry && el.geometry.length >= 2,
  );
  return waysToSegments(ways);
}

async function queryOverpass(query: string): Promise<OverpassResponse> {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass ${response.status}`);
  }

  return (await response.json()) as OverpassResponse;
}

export function readShoreCache(): ShoreCache | null {
  try {
    const raw = localStorage.getItem(SHORE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShoreCache;
    if (!parsed.bbox || !Array.isArray(parsed.segments)) return null;
    if (parsed.segments.length === 0) return null;
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

  let segments: ShoreSegment[] = [];

  try {
    const named = await queryOverpass(buildOverpassQuery(bbox));
    segments = elementsToSegments(named.elements ?? []);
  } catch {
    // Retry below with broader query or cache fallback.
  }

  if (segments.length === 0) {
    try {
      const broad = await queryOverpass(buildOverpassQuery(bbox, true));
      segments = elementsToSegments(broad.elements ?? []);
    } catch {
      // Overpass unavailable — caller falls back to cache.
    }
  }

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
