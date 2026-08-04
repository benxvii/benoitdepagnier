import {
  about,
  isGalleryVisible,
  isMusiqueVisible,
  musique,
  portfolio,
  projets,
  SITE_PREFIX,
  visiblePortfolioGalleries,
} from "./site";

export type NavSubLink =
  | { path: string; label: string }
  | {
      label: string;
      path?: string;
      subLinks: { path: string; label: string }[];
    };

export type NavItem =
  | { path: string; label: string }
  | {
      label: string;
      path?: string;
      subLinks: NavSubLink[];
    };

function galleryNavLinks(): NavSubLink[] {
  return visiblePortfolioGalleries().map((g) => {
    const subGalleries = g.subGalleries?.filter(isGalleryVisible);
    if (subGalleries?.length) {
      return {
        label: g.title,
        path: g.path,
        subLinks: subGalleries.map((s) => ({
          path: s.path,
          label: s.title,
        })),
      };
    }
    return { path: g.path, label: g.title };
  });
}

function collectSubLinkPaths(links: readonly NavSubLink[]): string[] {
  return links.flatMap((link) => {
    if ("subLinks" in link) {
      const paths = link.path ? [link.path] : [];
      return [...paths, ...collectSubLinkPaths(link.subLinks)];
    }
    return [link.path];
  });
}

function musiqueNavLinks(): NavSubLink[] {
  return musique.pages.map((page) => {
    if (page.slug === "enregistrements" && musique.recordings.length > 0) {
      return {
        label: page.title,
        path: page.path,
        subLinks: [
          { path: page.path, label: "Tous les enregistrements" },
          ...musique.recordings.map((recording) => ({
            path: recording.path,
            label: recording.title,
          })),
        ],
      };
    }
    return { path: page.path, label: page.title };
  });
}

export const mainNavigation: NavItem[] = [
  { path: projets.indexPath, label: "Projets informatiques" },
  {
    label: portfolio.title,
    path: portfolio.indexPath,
    subLinks: [
      { path: portfolio.indexPath, label: "Toutes les galeries" },
      ...galleryNavLinks(),
    ],
  },
  ...(isMusiqueVisible()
    ? [
        {
          label: musique.title,
          path: musique.indexPath,
          subLinks: [
            { path: musique.indexPath, label: "Présentation" },
            ...musiqueNavLinks(),
          ],
        } satisfies NavItem,
      ]
    : []),
  { path: about.path, label: "Qui suis-je ?" },
];

/** Navigation de la page d'arrivée (racine "/"), avant d'entrer dans le site. */
export const landingNavigation: NavItem[] = [
  { path: projets.indexPath, label: projets.title },
  { path: SITE_PREFIX, label: "Passions" },
];

export function isNavActive(pathname: string, path: string): boolean {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isNavSectionActive(
  pathname: string,
  item: Extract<NavItem, { subLinks: unknown }>,
): boolean {
  if (item.path && isNavActive(pathname, item.path)) return true;
  return collectSubLinkPaths(item.subLinks).some((path) =>
    isNavActive(pathname, path),
  );
}
