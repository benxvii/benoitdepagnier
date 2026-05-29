import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { type Gallery, randomGalleryCover } from "../../config/site";

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

export function useRandomGalleryHubItems(galleries: readonly Gallery[]) {
  const location = useLocation();
  const refreshSeed = useRandomGalleryCoverSeed();

  return useMemo(
    () =>
      galleries.map((g) => ({
        path: g.path,
        title: g.title,
        description: g.intro,
        image: randomGalleryCover(g),
      })),
    [galleries, location.key, refreshSeed],
  );
}
