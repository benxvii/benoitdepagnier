import { useMemo } from "react";
import { useLocation } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { about } from "../../config/site";
import { useRandomGalleryCoverSeed } from "./useRandomGalleryCovers";

type AboutPortraitsProps = {
  variant: "page" | "home";
};

function pickRandomPortrait() {
  return about.portraits[Math.floor(Math.random() * about.portraits.length)];
}

export function AboutPortraits({ variant }: AboutPortraitsProps) {
  const location = useLocation();
  const refreshSeed = useRandomGalleryCoverSeed();
  const isHome = variant === "home";

  const portraits = useMemo(
    () => (isHome ? [pickRandomPortrait()] : about.portraits),
    [isHome, location.key, refreshSeed],
  );

  return (
    <div className={isHome ? "space-y-6" : "space-y-8"}>
      {portraits.map((portrait) => (
        <div key={portrait.caption}>
          {isHome ? (
            <div className="relative aspect-square overflow-hidden bg-gray-50 mb-3">
              <ImageWithFallback
                src={portrait.image}
                alt={portrait.caption}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <ImageWithFallback
              src={portrait.image}
              alt={portrait.caption}
              className="w-full h-auto aspect-[4/5] object-cover"
            />
          )}
          <p
            className={
              isHome
                ? "text-center text-sm text-gray-500 leading-snug min-h-[3.25rem]"
                : "mt-3 text-sm text-gray-500 text-center"
            }
          >
            {portrait.caption}
          </p>
        </div>
      ))}
    </div>
  );
}
