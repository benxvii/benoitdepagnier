import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { type Gallery } from "../../config/site";
import { useGalleries } from "../../hooks/useGalleries";
import {
  randomGalleryCoverFromManifest,
  randomLandscapeHeroFromManifest,
} from "../../lib/galleryImages";

/** Incrémenté au retour depuis le cache navigateur (bfcache). */
export function useRandomGalleryCoverSeed(): number {
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setRefreshSeed((seed) => seed + 1);
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return refreshSeed;
}

export function useRandomHeroImage(): string | null {
  const location = useLocation();
  const refreshSeed = useRandomGalleryCoverSeed();
  const { galleries: manifestGalleries } = useGalleries();

  return useMemo(
    () => randomLandscapeHeroFromManifest(manifestGalleries),
    [manifestGalleries, location.key, refreshSeed],
  );
}

export function useRandomGalleryHubItems(galleries: readonly Gallery[]) {
  const location = useLocation();
  const refreshSeed = useRandomGalleryCoverSeed();
  const { galleries: manifestGalleries } = useGalleries();

  return useMemo(
    () =>
      galleries.map((g) => ({
        path: g.path,
        title: g.title,
        description: g.intro,
        image: randomGalleryCoverFromManifest(g, manifestGalleries) ?? undefined,
      })),
    [galleries, manifestGalleries, location.key, refreshSeed],
  );
}
