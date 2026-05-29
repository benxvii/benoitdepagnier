import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type HubItem = {
  path: string;
  title: string;
  description: string;
  image: string;
};

type SectionHubProps = {
  title: string;
  intro: string;
  items: readonly HubItem[];
};

export default function SectionHub({ title, intro, items }: SectionHubProps) {
  return (
    <div>
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl mb-6">{title}</h1>
          <p className="text-xl text-gray-700">{intro}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <HubGrid items={items} />
      </section>
    </div>
  );
}

function HubGrid({ items }: { items: readonly HubItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {items.map((item) => (
        <Link key={item.path} to={item.path} className="group block">
          <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-white">
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h2 className="text-2xl mb-2 group-hover:text-[var(--brand)] transition-colors">
            {item.title}
          </h2>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <span className="inline-flex items-center gap-2 text-sm text-[var(--brand)]">
            Voir le projet
            <ArrowRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
