import { useEffect } from "react";
import { useLocation } from "react-router";
import { resolvePageTitle } from "../lib/pageMeta";

const SITE_ORIGIN = "https://benoitdepagnier.ch";

function canonicalUrlFor(pathname: string): string {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return `${SITE_ORIGIN}${path}`;
}

function upsertLinkTag(rel: string, href: string): void {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function upsertMetaTag(property: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export function usePageMeta(): void {
  const location = useLocation();

  useEffect(() => {
    document.title = resolvePageTitle(location.pathname);

    const url = canonicalUrlFor(location.pathname);
    upsertLinkTag("canonical", url);
    upsertMetaTag("og:url", url);
  }, [location.pathname]);
}
