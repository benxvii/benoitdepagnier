import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import PageHero from "./PageHero";

type HubItem = {
  path: string;
  title: string;
  description: string;
  image?: string;
};

type SectionHubProps = {
  title: string;
  intro: string;
  items: readonly HubItem[];
  linkLabel?: string;
  /** `icon` : vignette carrée (projets, musique). */
  imageLayout?: "cover" | "icon";
  /** Avec `icon` : `contain` pour logos, `cover` pour photos. */
  imageFit?: "cover" | "contain";
};

export default function SectionHub({
  title,
  intro,
  items,
  linkLabel = "Voir le projet",
  imageLayout = "cover",
  imageFit = "contain",
}: SectionHubProps) {
  return (
    <div>
      <PageHero title={title} intro={intro} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <HubGrid
          items={items}
          linkLabel={linkLabel}
          imageLayout={imageLayout}
          imageFit={imageFit}
        />
      </section>
    </div>
  );
}

function HubGrid({
  items,
  linkLabel,
  imageLayout,
  imageFit,
}: {
  items: readonly HubItem[];
  linkLabel: string;
  imageLayout: "cover" | "icon";
  imageFit: "cover" | "contain";
}) {
  const isIcon = imageLayout === "icon";
  const isCover = imageFit === "cover";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {items.map((item) => (
        <Link key={item.path} to={item.path} className="group block">
          <div
            className={
              isIcon
                  ? "relative aspect-square overflow-hidden mb-4"
                  : "relative aspect-square overflow-hidden mb-4"
            }
          >
            {item.image ? (
              <ImageWithFallback
                src={item.image}
                alt={item.title}
                className={
                  isIcon && isCover
                    ? "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    : "w-full h-full object-contain p-12 group-hover:scale-105 transition-transform duration-500"
                }
              />
            ) : null}
          </div>
          <h2 className="text-2xl mb-2 group-hover:text-[var(--brand)] transition-colors">
            {item.title}
          </h2>
          {item.description ? (
            <p className="text-gray-600 mb-4">{item.description}</p>
          ) : null}
          <span className="inline-flex items-center gap-2 text-sm text-[var(--brand)]">
            {linkLabel}
            <ArrowRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
