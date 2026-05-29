import { musique, portfolio, projets } from "./site";

export type NavItem =
  | { path: string; label: string }
  | {
      label: string;
      path?: string;
      subLinks: { path: string; label: string }[];
    };

export const mainNavigation: NavItem[] = [
  {
    label: portfolio.title,
    path: portfolio.indexPath,
    subLinks: [
      { path: portfolio.indexPath, label: "Toutes les galeries" },
      ...portfolio.galleries.flatMap((g) => {
        const links = [{ path: g.path, label: g.title }];
        if (g.subGalleries) {
          links.push(
            ...g.subGalleries.map((s) => ({
              path: s.path,
              label: s.title,
            })),
          );
        }
        return links;
      }),
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
      ...musique.pages.map((p) => ({
        path: p.path,
        label: p.title,
      })),
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
  return item.subLinks.some((s) => isNavActive(pathname, s.path));
}
