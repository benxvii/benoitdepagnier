import { useEffect, useState } from "react";
import { getManifestUrls } from "../lib/galleryManifest";
import type { GalleriesManifest, ManifestGallery } from "../types/galleries";

let memoryCache: GalleriesManifest | null = null;
let inflight: Promise<GalleriesManifest> | null = null;

function manifestUrls(): string[] {
  return getManifestUrls();
}

async function fetchManifestFromUrl(url: string): Promise<GalleriesManifest> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Manifest HTTP ${response.status} (${url})`);
  }
  const data = (await response.json()) as GalleriesManifest;
  if (!Array.isArray(data.galleries)) {
    throw new Error("Manifest invalide (galleries manquant)");
  }
  return data;
}

async function fetchManifest(): Promise<GalleriesManifest> {
  const urls = manifestUrls();
  if (urls.length === 0) {
    throw new Error(
      "Variables Cloudinary absentes (.env). Redémarre npm run dev après modification du .env.",
    );
  }

  if (memoryCache) {
    return memoryCache;
  }

  if (!inflight) {
    inflight = (async () => {
      let lastError: Error | null = null;
      for (const url of urls) {
        try {
          const data = await fetchManifestFromUrl(url);
          memoryCache = data;
          return data;
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error("Erreur chargement manifest");
        }
      }
      throw lastError ?? new Error("Impossible de charger le manifest galeries");
    })();
  }

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export type UseGalleriesResult = {
  galleries: ManifestGallery[];
  loading: boolean;
  error: string | null;
};

export function useGalleries(): UseGalleriesResult {
  const [state, setState] = useState<UseGalleriesResult>(() => ({
    galleries: memoryCache?.galleries ?? [],
    loading: !memoryCache && manifestUrls().length > 0,
    error: null,
  }));

  useEffect(() => {
    if (manifestUrls().length === 0) {
      setState({
        galleries: [],
        loading: false,
        error:
          "Variables Cloudinary absentes (.env). Ajoute VITE_CLOUDINARY_CLOUD_NAME ou VITE_MANIFEST_URL, puis redémarre npm run dev.",
      });
      return;
    }

    if (memoryCache) {
      setState({
        galleries: memoryCache.galleries,
        loading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;

    fetchManifest()
      .then((manifest) => {
        if (cancelled) return;
        setState({
          galleries: manifest.galleries,
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Erreur chargement manifest";
        setState({ galleries: [], loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
