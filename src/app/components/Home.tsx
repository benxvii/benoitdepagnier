import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  about,
  homeIntro,
  musique,
  musiquePageImage,
  portfolio,
  visiblePortfolioGalleries,
  projets,
  site,
} from "../../config/site";
import {
  useRandomGalleryHubItems,
  useRandomHeroImage,
} from "./useRandomGalleryCovers";

type HomeCard = {
  path: string;
  title: string;
  image?: string;
};

type ImageFit = "cover" | "contain";

export default function Home() {
  const heroImage = useRandomHeroImage();
  const portfolioCards = useRandomGalleryHubItems(visiblePortfolioGalleries());

  const projetCards: HomeCard[] = projets.items.map((p) => ({
    path: p.path,
    title: p.title,
    image: p.image,
  }));

  const musiqueCards: HomeCard[] = musique.pages.map((page) => ({
    path: page.path,
    title: page.title,
    image: musiquePageImage(page),
  }));

  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50">
        {heroImage ? (
          <div className="absolute inset-0 z-0">
            <ImageWithFallback
              src={heroImage}
              alt={`${site.name} — photographie`}
              className="w-full h-full object-cover opacity-40"
            />
          </div>
        ) : null}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl mb-6 tracking-tight">
            {site.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
            {homeIntro.quote}
          </p>
        </div>
      </section>

      <HomeSection
        title={portfolio.title}
        cards={portfolioCards}
        imageFit="cover"
      />

      <HomeSection
        title={projets.title}
        cards={projetCards}
        imageFit="contain"
      />

      <HomeSection
        title={musique.title}
        cards={musiqueCards}
        imageFit="cover"
      />

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl mb-12 text-center">{about.title}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            <div className="flex flex-col max-w-sm mx-auto lg:max-w-none w-full">
              <div className="relative aspect-square overflow-hidden bg-gray-50 mb-3">
                <ImageWithFallback
                  src={about.portraitImage}
                  alt={site.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {about.portraitCaption ? (
                <p className="text-center text-sm text-gray-500 leading-snug min-h-[3.25rem]">
                  {about.portraitCaption}
                </p>
              ) : null}
            </div>
            <div className="lg:col-span-3 flex flex-col justify-center text-center lg:text-left">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {about.paragraphs[0]}
              </p>
              <Link
                to={about.path}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition-colors self-center lg:self-start"
              >
                En savoir plus
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeSection({
  title,
  cards,
  imageFit,
}: {
  title: string;
  cards: readonly HomeCard[];
  imageFit: ImageFit;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 first:pt-24">
      <h2 className="text-4xl mb-12 text-center">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => (
          <HomeCardLink key={card.path} card={card} imageFit={imageFit} />
        ))}
      </div>
    </section>
  );
}

function HomeCardLink({
  card,
  imageFit,
}: {
  card: HomeCard;
  imageFit: ImageFit;
}) {
  const isContain = imageFit === "contain";

  return (
    <Link to={card.path} className="group flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-gray-50 mb-3">
        {card.image ? (
          <ImageWithFallback
            src={card.image}
            alt={card.title}
            className={
              isContain
                ? "w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                : "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            }
          />
        ) : null}
      </div>
      <h3 className="text-center text-lg leading-snug min-h-[3.25rem] flex items-start justify-center group-hover:text-[var(--brand)] transition-colors">
        {card.title}
      </h3>
    </Link>
  );
}
