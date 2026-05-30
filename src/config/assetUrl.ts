/**
 * URLs des fichiers statiques (photos, ZIP, etc.).
 * En production : même origine, fichiers déjà sur Infomaniak (hors Git).
 * En dev sans copie locale : VITE_MEDIA_BASE_URL=https://benoitdepagnier.ch
 */
export function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }
  const base = import.meta.env.VITE_MEDIA_BASE_URL?.replace(/\/$/, "") ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
