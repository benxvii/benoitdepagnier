import type { Gallery } from "../config/site";
import type { ManifestGallery } from "../types/galleries";
import { cloudinaryUrl } from "./cloudinary";

const placeholderImage =
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop";

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

export function galleryThumbUrl(publicId: string): string | null {
  return cloudinaryUrl(publicId, { width: 800, height: 600, crop: "fill" });
}

function pickRandom<T>(items: readonly T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export function randomGalleryCoverFromManifest(
  gallery: Gallery,
  manifestGalleries: readonly ManifestGallery[],
): string {
  if (gallery.subGalleries?.length) {
    const subsWithImages = gallery.subGalleries
      .map((sub) => findManifestGallery(manifestGalleries, sub.slug, gallery.slug))
      .filter((entry): entry is ManifestGallery => Boolean(entry?.images.length));

    const sub = pickRandom(subsWithImages);
    if (sub?.images.length) {
      const image = pickRandom(sub.images);
      if (image) {
        return galleryThumbUrl(image.publicId) ?? placeholderImage;
      }
    }
  }

  const own = findManifestGallery(manifestGalleries, gallery.slug);
  if (own?.images.length) {
    const image = pickRandom(own.images);
    if (image) {
      return galleryThumbUrl(image.publicId) ?? placeholderImage;
    }
  }

  return placeholderImage;
}
