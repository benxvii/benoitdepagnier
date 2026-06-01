import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import MusiqueTwoColumnLayout from "./MusiqueTwoColumnLayout";
import { musique, musiquePageImage } from "../../config/site";

export default function MusiqueEnregistrements() {
  const page = musique.pages.find((p) => p.slug === "enregistrements");

  return (
    <div>
      <section className="py-6 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={musique.indexPath}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)] transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à la musique
          </Link>
        </div>
      </section>

      <MusiqueTwoColumnLayout
        title={page?.title ?? "Enregistrements"}
        image={page ? musiquePageImage(page) : undefined}
        imageAlt={page?.title ?? "Enregistrements"}
      >
        {page?.intro ? (
          <p className="text-xl text-gray-700 whitespace-pre-line">{page.intro}</p>
        ) : null}
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
      </MusiqueTwoColumnLayout>
    </div>
  );
}
