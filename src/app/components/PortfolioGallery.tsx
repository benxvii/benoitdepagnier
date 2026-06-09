import { Navigate, useParams } from "react-router";
import BackLink from "./BackLink";
import EquipmentGalleryPage from "./EquipmentGalleryPage";
import GalleryPage from "./GalleryPage";
import SectionHub from "./SectionHub";
import { findPortfolioGallery, portfolio } from "../../config/site";
import { useGalleries } from "../../hooks/useGalleries";
import {
  findManifestGallery,
  galleryImageEntries,
  resolveEquipmentImageUrl,
} from "../../lib/galleryImages";
import { useRandomGalleryHubItems } from "./useRandomGalleryCovers";

export default function PortfolioGallery() {
  const { slug, parentSlug } = useParams<{
    slug: string;
    parentSlug?: string;
  }>();
  const gallery = slug ? findPortfolioGallery(slug, parentSlug) : undefined;
  const { galleries: manifestGalleries, loading, error } = useGalleries();
  const subItems = useRandomGalleryHubItems(gallery?.subGalleries ?? []);

  if (!gallery) {
    return <Navigate to={portfolio.indexPath} replace />;
  }

  if (gallery.subGalleries && gallery.subGalleries.length > 0) {
    return (
      <div>
        <BackLink to={portfolio.indexPath} label="Retour au portfolio" />
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
    ? (portfolio.galleries.find((g) => g.slug === parentSlug)?.path ??
      portfolio.indexPath)
    : portfolio.indexPath;

  const manifestEntry =
    slug && findManifestGallery(manifestGalleries, slug, parentSlug);

  if (gallery.equipment?.length) {
    const equipmentItems = gallery.equipment.map((item) => ({
      ...item,
      imageUrl: resolveEquipmentImageUrl(item, manifestEntry),
    }));

    return (
      <div>
        <BackLink to={backPath} label="Retour" />
        <EquipmentGalleryPage
          title={gallery.title}
          intro={gallery.intro}
          items={equipmentItems}
          footnote={gallery.equipmentFootnote}
        />
      </div>
    );
  }

  const images = manifestEntry
    ? galleryImageEntries(manifestEntry.images)
    : [];

  return (
    <div>
      <BackLink to={backPath} label="Retour" />
      <GalleryPage
        title={gallery.title}
        intro={gallery.intro}
        images={images}
        loading={loading}
        error={error}
        emptyMessage={
          !loading && images.length === 0
            ? "Aucune photo pour cette galerie. Upload sur Cloudinary puis lance le workflow « Sync galleries from Cloudinary »."
            : undefined
        }
      />
    </div>
  );
}
