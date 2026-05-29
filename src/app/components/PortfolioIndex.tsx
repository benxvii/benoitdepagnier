import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import SectionHub from "./SectionHub";
import { portfolio, randomGalleryCover } from "../../config/site";

export default function PortfolioIndex() {
  const location = useLocation();
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setRefreshSeed((seed) => seed + 1);
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const items = useMemo(
    () =>
      portfolio.galleries.map((g) => ({
        path: g.path,
        title: g.title,
        description: g.intro,
        image: randomGalleryCover(g),
      })),
    [location.key, refreshSeed],
  );

  return (
    <SectionHub
      title={portfolio.title}
      intro={portfolio.intro}
      items={items}
    />
  );
}
