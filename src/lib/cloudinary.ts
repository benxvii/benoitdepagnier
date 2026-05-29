type CloudinaryTransform = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale";
  quality?: "auto";
  format?: "auto";
};

/**
 * Construit une URL Cloudinary à partir d'un public_id.
 * Configure VITE_CLOUDINARY_CLOUD_NAME dans .env (voir .env.example).
 */
export function cloudinaryUrl(
  publicId: string,
  options: CloudinaryTransform = {},
): string | null {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return null;

  const transforms: string[] = [];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  transforms.push("q_auto", "f_auto");

  const transformSegment =
    transforms.length > 0 ? `${transforms.join(",")}/` : "";
  const folder = import.meta.env.VITE_CLOUDINARY_FOLDER;
  const path = folder ? `${folder}/${publicId}` : publicId;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformSegment}${path}`;
}

/** URL Cloudinary ou image de repli (placeholder local / Unsplash). */
export function resolveImageUrl(
  publicId: string | undefined,
  fallbackUrl: string,
  options?: CloudinaryTransform,
): string {
  if (publicId) {
    const url = cloudinaryUrl(publicId, options);
    if (url) return url;
  }
  return fallbackUrl;
}
