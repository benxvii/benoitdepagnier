/** URL(s) du manifest galeries Cloudinary (_galleries.json). */
export function getManifestUrls(): string[] {
  const urls: string[] = [];

  const explicit = import.meta.env.VITE_MANIFEST_URL?.trim();
  if (explicit) urls.push(explicit);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const folder =
    import.meta.env.VITE_CLOUDINARY_FOLDER?.trim() || "benoitdepagnier";
  if (cloudName) {
    const base = `https://res.cloudinary.com/${cloudName}/raw/upload/${folder}/_galleries`;
    urls.push(`${base}.json`, base);
  }

  urls.push("/_galleries.json");

  return [...new Set(urls)];
}

/** @deprecated Préférer getManifestUrls() */
export function getManifestUrl(): string | undefined {
  return getManifestUrls()[0];
}
