import {
  isGalleryVisible,
  musique,
  portfolio,
  projets,
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
  {
    label: portfolio.title,
    path: portfolio.indexPath,
    subLinks: [
      { path: portfolio.indexPath, label: "Toutes les galeries" },
      ...galleryNavLinks(),
    ],
  },
  {
    label: projets.title,
    path: projets.indexPath,
    subLinks: [
      { path: projets.indexPath, label: "Tous les projets" },
      ...projets.items.map((p) => ({
        path: p.path,
        label: p.title,
      })),
    ],
  },
  {
    label: musique.title,
    path: musique.indexPath,
    subLinks: [
      { path: musique.indexPath, label: "Présentation" },
      ...musiqueNavLinks(),
    ],
  },
  { path: "/about", label: "Qui suis-je ?" },
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
