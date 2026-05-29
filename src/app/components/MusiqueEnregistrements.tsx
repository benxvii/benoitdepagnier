import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { musique } from "../../config/site";

export default function MusiqueEnregistrements() {
  const page = musique.pages.find((p) => p.slug === "enregistrements");

  return (
    <div>
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={musique.indexPath}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)] mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à la musique
          </Link>
          <h1 className="text-5xl mb-4">{page?.title ?? "Enregistrements"}</h1>
          {page?.intro && (
            <p className="text-xl text-gray-700">{page.intro}</p>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {musique.recordings.map((recording) => (
            <Link
              key={recording.path}
              to={recording.path}
              className="group grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-6 p-6 border border-gray-100 hover:border-[var(--brand)] transition-colors"
            >
              <div className="overflow-hidden bg-white aspect-square sm:aspect-auto sm:h-[140px]">
                <ImageWithFallback
                  src={recording.coverImage}
                  alt={recording.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl mb-1 group-hover:text-[var(--brand)] transition-colors">
                  {recording.title}
                </h2>
                <p className="text-gray-600 mb-2">{recording.subtitle}</p>
                <p className="text-sm text-gray-500">{recording.artists}</p>
                <span className="inline-flex items-center gap-2 text-sm text-[var(--brand)] mt-4">
                  Voir le détail
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
