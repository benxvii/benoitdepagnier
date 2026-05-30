import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import GalleryPage from "./GalleryPage";
import SectionHub from "./SectionHub";
import { findPortfolioGallery, portfolio } from "../../config/site";
import { useRandomGalleryHubItems } from "./useRandomGalleryCovers";

export default function PortfolioGallery() {
  const { slug, parentSlug } = useParams<{
    slug: string;
    parentSlug?: string;
  }>();
  const gallery = slug ? findPortfolioGallery(slug, parentSlug) : undefined;
  const subItems = useRandomGalleryHubItems(gallery?.subGalleries ?? []);

  if (!gallery) {
    return <Navigate to={portfolio.indexPath} replace />;
  }

  if (gallery.subGalleries && gallery.subGalleries.length > 0) {
    return (
      <div>
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to={portfolio.indexPath}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)] mb-8 transition-colors"
            >
              <ArrowLeft size={18} />
              Retour au portfolio
            </Link>
          </div>
        </section>
        <SectionHub
          title={gallery.title}
          intro={gallery.intro}
          items={subItems}
          linkLabel="Voir la galerie"
        />
      </div>
    );
  }

  const backPath = parentSlug
    ? portfolio.galleries.find((g) => g.slug === parentSlug)?.path ??
      portfolio.indexPath
    : portfolio.indexPath;

  return (
    <div>
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)] transition-colors"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>
        </div>
      </section>
      <GalleryPage
        title={gallery.title}
        intro={gallery.intro}
        images={gallery.images ?? []}
      />
    </div>
  );
}
