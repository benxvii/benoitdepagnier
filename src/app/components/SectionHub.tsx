import { Link } from "react-router";
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
  /** `contain` pour logos, `cover` pour photos. */
  imageFit?: "cover" | "contain";
};

export default function SectionHub({
  title,
  intro,
  items,
  imageFit = "contain",
}: SectionHubProps) {
  return (
    <div>
      <PageHero title={title} intro={intro} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <HubGrid items={items} imageFit={imageFit} />
      </section>
    </div>
  );
}

function HubGrid({
  items,
  imageFit,
}: {
  items: readonly HubItem[];
  imageFit: "cover" | "contain";
}) {
  const isCover = imageFit === "cover";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {items.map((item) => (
        <Link key={item.path} to={item.path} className="group block">
          <div
            className={
              isCover
                ? "relative aspect-square overflow-hidden mb-4"
                : "relative mx-auto aspect-square w-full max-w-[13.5rem] overflow-hidden"
            }
          >
            {item.image ? (
              <ImageWithFallback
                src={item.image}
                alt={item.title}
                className={
                  isCover
                    ? "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    : "w-full h-full object-contain object-top group-hover:scale-105 transition-transform duration-500"
                }
              />
            ) : null}
          </div>
          <h2
            className={
              isCover
                ? "text-2xl mb-2 group-hover:text-[var(--brand)] transition-colors"
                : "text-2xl mb-2 mt-1 text-center group-hover:text-[var(--brand)] transition-colors"
            }
          >
            {item.title}
          </h2>
          {item.description ? (
            <p className="text-gray-600">{item.description}</p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
