import type { Gallery, GalleryEquipmentItem } from "../config/site";
import { assetUrl } from "../config/assetUrl";
import type { GalleryImage, ManifestGallery } from "../types/galleries";
import { cloudinaryUrl } from "./cloudinary";

export function portfolioManifestSlug(slug: string, parentSlug?: string): string {
  return parentSlug ? `${parentSlug}/${slug}` : slug;
}

export function findManifestGallery(
  manifestGalleries: readonly ManifestGallery[],
  slug: string,
  parentSlug?: string,
): ManifestGallery | undefined {
  const key = portfolioManifestSlug(slug, parentSlug);
  return manifestGalleries.find((gallery) => gallery.slug === key);
}

export function galleryImageUrl(
  publicId: string,
  width = 1600,
): string | null {
  return cloudinaryUrl(publicId, { width, crop: "scale" });
}

export function galleryImageUrls(
  images: readonly { publicId: string }[],
  width = 1600,
): string[] {
  return images
    .map((image) => galleryImageUrl(image.publicId, width))
    .filter((url): url is string => Boolean(url));
}

export type GalleryImageEntry = {
  thumb: string;
  full: string;
  width: number;
  height: number;
};

export const GALLERY_THUMB_MAX = 300;

export function galleryGridThumbUrl(
  publicId: string,
  width: number,
  height: number,
): string | null {
  if (height > width) {
    return cloudinaryUrl(publicId, {
      width: GALLERY_THUMB_MAX,
      height: GALLERY_THUMB_MAX,
      crop: "limit",
    });
  }
  return cloudinaryUrl(publicId, { width: 500, crop: "scale" });
}

export function isPortraitGalleryImage(width: number, height: number): boolean {
  return height > width;
}

export function galleryOriginalUrl(
  publicId: string,
  originalWidth?: number,
): string | null {
  if (originalWidth) {
    return cloudinaryUrl(publicId, { width: originalWidth, crop: "scale" });
  }
  return cloudinaryUrl(publicId, {});
}

export function galleryImageEntries(
  images: readonly { publicId: string; width?: number; height?: number }[],
): GalleryImageEntry[] {
  return images
    .map((image) => {
      const thumb = galleryGridThumbUrl(
        image.publicId,
        image.width ?? 3,
        image.height ?? 2,
      );
      const full = galleryOriginalUrl(image.publicId, image.width);
      if (!thumb || !full) return null;
      return {
        thumb,
        full,
        width: image.width ?? 3,
        height: image.height ?? 2,
      };
    })
    .filter((entry): entry is GalleryImageEntry => Boolean(entry));
}

export function galleryThumbUrl(publicId: string): string | null {
  return cloudinaryUrl(publicId, { width: 800, height: 600, crop: "fill" });
}

/** Vignette config locale ou fichier Cloudinary nommé comme `item.id`. */
export function resolveEquipmentImageUrl(
  item: GalleryEquipmentItem,
  manifest?: ManifestGallery,
): string | null {
  if (item.image) {
    return /^https?:\/\//i.test(item.image) ? item.image : assetUrl(item.image);
  }
  if (!manifest?.images.length) return null;

  const match = manifest.images.find((image) => {
    const base = image.publicId.split("/").pop() ?? "";
    const normalized = base.replace(/\.(jpe?g|png|webp|heic)$/i, "");
    return normalized === item.id;
  });

  if (!match) return null;
  return (
    cloudinaryUrl(match.publicId, { width: 600, crop: "limit" }) ??
    galleryThumbUrl(match.publicId)
  );
}

function pickRandom<T>(items: readonly T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function allManifestImages(
  manifestGalleries: readonly ManifestGallery[],
): GalleryImage[] {
  return manifestGalleries.flatMap((gallery) => [...gallery.images]);
}

/** Photo paysage aléatoire pour le hero (toutes galeries du manifest). */
export function randomLandscapeHeroFromManifest(
  manifestGalleries: readonly ManifestGallery[],
): string | null {
  const landscapes = allManifestImages(manifestGalleries).filter(
    (image) => !isPortraitGalleryImage(image.width, image.height),
  );
  const image = pickRandom(landscapes);
  if (!image) return null;

  return (
    cloudinaryUrl(image.publicId, {
      width: 1920,
      height: 1080,
      crop: "fill",
    }) ?? galleryImageUrl(image.publicId, 1920)
  );
}

function manifestImageThumbUrl(image: GalleryImage): string | null {
  return galleryThumbUrl(image.publicId) ?? galleryImageUrl(image.publicId, 800);
}

/** Vignette de repli : paysage aléatoire, sinon n’importe quelle photo du manifest. */
function randomManifestCoverFallback(
  manifestGalleries: readonly ManifestGallery[],
): string | null {
  const landscapes = allManifestImages(manifestGalleries).filter(
    (image) => !isPortraitGalleryImage(image.width, image.height),
  );
  const image = pickRandom(landscapes) ?? pickRandom(allManifestImages(manifestGalleries));
  if (!image) return null;
  return manifestImageThumbUrl(image);
}

export function randomGalleryCoverFromManifest(
  gallery: Gallery,
  manifestGalleries: readonly ManifestGallery[],
): string | null {
  if (gallery.subGalleries?.length) {
    const subsWithImages = gallery.subGalleries
      .map((sub) => findManifestGallery(manifestGalleries, sub.slug, gallery.slug))
      .filter((entry): entry is ManifestGallery => Boolean(entry?.images.length));

    const sub = pickRandom(subsWithImages);
    if (sub?.images.length) {
      const image = pickRandom(sub.images);
      if (image) {
        return manifestImageThumbUrl(image);
      }
    }
  }

  const own = findManifestGallery(manifestGalleries, gallery.slug);
  if (own?.images.length) {
    const image = pickRandom(own.images);
    if (image) {
      return manifestImageThumbUrl(image);
    }
  }

  return randomManifestCoverFallback(manifestGalleries);
}
