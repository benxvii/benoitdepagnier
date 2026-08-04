import {
  about,
  findMusiqueRecording,
  findPortfolioGallery,
  installation,
  musique,
  portfolio,
  projets,
  site,
  SITE_PREFIX,
} from "../config/site";

const SEPARATOR = "—";

function withName(pageTitle: string): string {
  return `${pageTitle} ${SEPARATOR} ${site.name}`;
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

export function resolvePageTitle(pathname: string): string {
  const path = normalizePathname(pathname);
  const fallback = site.name;

  if (path === "/") {
    return `${site.name} ${SEPARATOR} ${site.appsTagline}`;
  }

  if (path === projets.indexPath) {
    return withName(projets.title);
  }

  if (path.startsWith(`${projets.indexPath}/`)) {
    const slug = path.slice(`${projets.indexPath}/`.length);
    const projet = projets.items.find((p) => p.slug === slug);
    return projet ? withName(projet.title) : fallback;
  }

  if (path === SITE_PREFIX) {
    return `Photo & Musique ${SEPARATOR} ${site.name}`;
  }

  if (path === portfolio.indexPath) {
    return withName(portfolio.title);
  }

  if (path.startsWith(`${portfolio.indexPath}/`)) {
    const segments = path.slice(`${portfolio.indexPath}/`.length).split("/");
    const gallery =
      segments.length >= 2
        ? findPortfolioGallery(segments[1], segments[0])
        : findPortfolioGallery(segments[0]);
    return gallery ? withName(gallery.title) : fallback;
  }

  if (path.startsWith(`${musique.enregistrementsPath}/`)) {
    const slug = path.slice(`${musique.enregistrementsPath}/`.length);
    const recording = findMusiqueRecording(slug);
    return recording ? withName(recording.title) : fallback;
  }

  if (path === musique.indexPath) {
    return withName(musique.title);
  }

  if (path.startsWith(`${musique.indexPath}/`)) {
    const slug = path.slice(`${musique.indexPath}/`.length);
    const page = musique.pages.find((p) => p.slug === slug);
    return page ? withName(page.title) : fallback;
  }

  if (path === about.path) {
    return withName(about.title);
  }

  if (path === installation.path) {
    return withName(installation.title);
  }

  return fallback;
}
