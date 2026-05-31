/** URL du manifest galeries Cloudinary (_galleries.json). */
export function getManifestUrl(): string | undefined {
  const explicit = import.meta.env.VITE_MANIFEST_URL?.trim();
  if (explicit) return explicit;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const folder =
    import.meta.env.VITE_CLOUDINARY_FOLDER?.trim() || "benoitdepagnier";
  if (!cloudName) return undefined;

  return `https://res.cloudinary.com/${cloudName}/raw/upload/${folder}/_galleries.json`;
}
