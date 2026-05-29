import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  galleryCover,
  homeIntro,
  musique,
  portfolio,
  projets,
  site,
} from "../../config/site";

const heroImage =
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&h=1080&fit=crop";

const homeSections = [
  ...portfolio.galleries.map((g) => ({
    path: g.path,
    title: g.title,
    image: galleryCover(g),
  })),
  {
    path: projets.indexPath,
    title: projets.title,
    image: projets.items[0]?.image ?? heroImage,
  },
  {
    path: musique.indexPath,
    title: musique.title,
    image: heroImage,
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gray-50">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={heroImage}
            alt={`${site.name} — photographie`}
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl mb-6 tracking-tight">
            {site.name}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed">
            {homeIntro.quote}
          </p>
          <Link
            to={portfolio.indexPath}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--brand)] text-white hover:opacity-90 transition-opacity"
          >
            Voir le portfolio
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl mb-12 text-center">Explorer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homeSections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className="group relative aspect-[4/3] overflow-hidden"
            >
              <ImageWithFallback
                src={section.image}
                alt={section.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <CardOverlay title={section.title} />
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6">Qui suis-je ?</h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Passionné de photographie depuis l'enfance, saxophoniste et
            développeur d'applications.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition-colors"
          >
            En savoir plus
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function CardOverlay({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
      <h3 className="text-2xl text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {title}
      </h3>
    </div>
  );
}
