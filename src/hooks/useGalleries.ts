import { useEffect, useState } from "react";
import { getManifestUrl } from "../lib/galleryManifest";
import type { GalleriesManifest, ManifestGallery } from "../types/galleries";

let memoryCache: GalleriesManifest | null = null;
let inflight: Promise<GalleriesManifest> | null = null;

function manifestUrl(): string | undefined {
  return getManifestUrl();
}

async function fetchManifest(): Promise<GalleriesManifest> {
  const url = manifestUrl();
  if (!url) {
    throw new Error(
      "Variables Cloudinary absentes (.env). Redémarre npm run dev après modification du .env.",
    );
  }

  if (memoryCache) {
    return memoryCache;
  }

  if (!inflight) {
    inflight = fetch(url).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Manifest HTTP ${response.status}`);
      }
      const data = (await response.json()) as GalleriesManifest;
      if (!Array.isArray(data.galleries)) {
        throw new Error("Manifest invalide (galleries manquant)");
      }
      memoryCache = data;
      return data;
    });
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
    loading: !memoryCache && Boolean(manifestUrl()),
    error: null,
  }));

  useEffect(() => {
    if (!manifestUrl()) {
      setState({
        galleries: [],
        loading: false,
        error: "Variables Cloudinary absentes (.env). Ajoute VITE_CLOUDINARY_CLOUD_NAME ou VITE_MANIFEST_URL, puis redémarre npm run dev.",
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
