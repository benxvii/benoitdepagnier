import { Navigate, useParams } from "react-router";
import { Download } from "lucide-react";
import BackLink from "./BackLink";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { installation, projets, type Projet } from "../../config/site";

export default function ProjetDetail() {
  const { slug } = useParams<{ slug: string }>();
  const projet = projets.items.find((p) => p.slug === slug);

  if (!projet) {
    return <Navigate to={projets.indexPath} replace />;
  }

  return <ProjetPage projet={projet} />;
}

function DownloadButtons({ projet }: { projet: Projet }) {
  if (projet.downloads && projet.downloads.length > 0) {
    return (
      <div className="flex flex-wrap gap-4 mt-6">
        {projet.downloads.map((download) => (
          <a
            key={download.label}
            href={download.url}
            {...(/\.(zip|exe)$/i.test(download.url)
              ? { download: true }
              : undefined)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--brand)] text-white hover:opacity-90 transition-opacity"
          >
            <Download size={18} />
            {download.label}
          </a>
        ))}
      </div>
    );
  }

  if (projet.downloadUrl) {
    return (
      <a
        href={projet.downloadUrl}
        className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-[var(--brand)] text-white hover:opacity-90 transition-opacity"
      >
        <Download size={18} />
        {projet.downloadLabel ?? "Télécharger"}
      </a>
    );
  }

  return null;
}

function ProjetPage({ projet }: { projet: Projet }) {
  return (
    <div>
      <BackLink to={projets.indexPath} label="Retour aux projets" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="overflow-hidden aspect-square max-w-sm">
              <ImageWithFallback
                src={projet.image}
                alt={projet.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl mb-4">{projet.title}</h1>
              <p className="text-lg text-gray-700 mb-4">{projet.description}</p>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line space-y-4">
                {projet.body.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <DownloadButtons projet={projet} />
              {(projet.downloads?.length ?? 0) > 0 || projet.downloadUrl ? (
                <p className="text-xs text-gray-400 mt-3">
                  Problème au lancement ?{" "}
                  <a
                    href={installation.path}
                    className="underline hover:text-gray-600"
                  >
                    Instructions d'installation →
                  </a>
                </p>
              ) : null}
              {projet.notice && (
                <p className="mt-8 text-gray-600 leading-relaxed border-l-2 border-[var(--brand)] pl-4">
                  {projet.notice}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
