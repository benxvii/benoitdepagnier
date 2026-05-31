import { ImageWithFallback } from "./figma/ImageWithFallback";
import { about } from "../../config/site";

type AboutPortraitsProps = {
  variant: "page" | "home";
};

export function AboutPortraits({ variant }: AboutPortraitsProps) {
  const isHome = variant === "home";

  return (
    <div className={isHome ? "space-y-6" : "space-y-8"}>
      {about.portraits.map((portrait) => (
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
