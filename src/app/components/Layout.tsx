import { Outlet, Link, useLocation } from "react-router";
import { Facebook, Instagram, Linkedin, Mail, Menu, X } from "lucide-react";
import { useState } from "react";
import {
  isNavActive,
  isNavSectionActive,
  mainNavigation,
  type NavItem,
  type NavSubLink,
} from "../../config/navigation";
import { site } from "../../config/site";

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => isNavActive(location.pathname, path);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeaderRow
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            isActive={isActive}
          />
          {mobileMenuOpen && (
            <MobileNav
              navLinks={mainNavigation}
              isActive={isActive}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500">
              © {site.copyrightYear} {site.name}
            </p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-end items-center">
              <a
                href={`mailto:${site.email}`}
                className="text-gray-500 hover:text-[var(--brand)] transition-colors"
                aria-label="Email"
              >
                <Mail size={22} strokeWidth={1.5} />
              </a>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-500 hover:text-[var(--brand)] transition-colors"
              >
                <Instagram size={22} strokeWidth={1.5} />
              </a>
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-500 hover:text-[var(--brand)] transition-colors"
              >
                <Facebook size={22} strokeWidth={1.5} />
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-500 hover:text-[var(--brand)] transition-colors"
              >
                <Linkedin size={22} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeaderRow({
  mobileMenuOpen,
  setMobileMenuOpen,
  isActive,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isActive: (path: string) => boolean;
}) {
  return (
    <div className="flex justify-between items-center h-20">
      <Link
        to="/"
        className="inline-flex flex-col items-stretch w-fit leading-tight hover:text-[var(--brand)] transition-colors"
      >
        <span className="site-name text-xl whitespace-nowrap">{site.name}</span>
        <span className="site-tagline text-gray-600 text-sm">{site.tagline}</span>
      </Link>

      <DesktopNav navLinks={mainNavigation} isActive={isActive} />

      <button
        type="button"
        className="md:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}

function DesktopNav({
  navLinks,
  isActive,
}: {
  navLinks: NavItem[];
  isActive: (path: string) => boolean;
}) {
  return (
    <div className="hidden lg:flex items-center gap-6">
      {navLinks.map((link) =>
        "subLinks" in link ? (
          <NavDropdown key={link.label} link={link} isActive={isActive} />
        ) : (
          <Link
            key={link.path}
            to={link.path}
            className={`py-2 text-sm transition-colors hover:text-[var(--brand)] ${
              isActive(link.path) ? "border-b-2 border-[var(--brand)]" : ""
            }`}
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}

function NavDropdown({
  link,
  isActive,
}: {
  link: Extract<NavItem, { subLinks: unknown }>;
  isActive: (path: string) => boolean;
}) {
  const location = useLocation();
  const sectionActive = isNavSectionActive(location.pathname, link);

  return (
    <div className="relative group/nav">
      {link.path ? (
        <Link
          to={link.path}
          className={`py-2 text-sm transition-colors hover:text-[var(--brand)] ${
            sectionActive ? "border-b-2 border-[var(--brand)]" : ""
          }`}
        >
          {link.label}
        </Link>
      ) : (
        <button
          type="button"
          className="py-2 text-sm transition-colors hover:text-[var(--brand)]"
        >
          {link.label}
        </button>
      )}
      <div className="absolute left-0 top-full z-50 hidden pt-2 group-hover/nav:block">
        <div className="min-w-[14rem] border border-gray-100 bg-white py-1 shadow-sm">
          {link.subLinks.map((subLink) => (
            <NavSubMenuItem
              key={"subLinks" in subLink ? subLink.label : subLink.path}
              item={subLink}
              isActive={isActive}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavSubMenuItem({
  item,
  isActive,
}: {
  item: NavSubLink;
  isActive: (path: string) => boolean;
}) {
  if ("subLinks" in item) {
    const parentActive =
      (item.path && isActive(item.path)) ||
      item.subLinks.some((sub) => isActive(sub.path));

    return (
      <div className="relative group/sub">
        <div
          className={`flex items-center justify-between text-sm transition-colors hover:bg-gray-50 ${
            parentActive ? "bg-gray-50 font-medium" : ""
          }`}
        >
          {item.path ? (
            <Link
              to={item.path}
              className="flex-1 px-4 py-3 hover:text-[var(--brand)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="flex-1 px-4 py-3">{item.label}</span>
          )}
          <span className="pr-3 text-gray-400" aria-hidden="true">
            ›
          </span>
        </div>
        <div className="absolute left-full top-0 z-50 hidden pl-1 group-hover/sub:block">
          <div className="min-w-[16rem] border border-gray-100 bg-white py-1 shadow-sm">
            {item.subLinks.map((subLink) => (
              <Link
                key={subLink.path}
                to={subLink.path}
                className={`block px-4 py-3 text-sm transition-colors hover:bg-gray-50 hover:text-[var(--brand)] ${
                  isActive(subLink.path) ? "bg-gray-50 font-medium" : ""
                }`}
              >
                {subLink.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`block px-4 py-3 text-sm transition-colors hover:bg-gray-50 hover:text-[var(--brand)] ${
        isActive(item.path) ? "bg-gray-50 font-medium" : ""
      }`}
    >
      {item.label}
    </Link>
  );
}

function MobileNav({
  navLinks,
  isActive,
  onNavigate,
}: {
  navLinks: NavItem[];
  isActive: (path: string) => boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="lg:hidden py-4 border-t border-gray-100 max-h-[70vh] overflow-y-auto">
      {navLinks.map((link) =>
        "subLinks" in link ? (
          <MobileSection
            key={link.label}
            link={link}
            isActive={isActive}
            onNavigate={onNavigate}
          />
        ) : (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-4 py-3 transition-colors hover:bg-gray-50 ${
              isActive(link.path) ? "bg-gray-50" : ""
            }`}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}

function MobileSection({
  link,
  isActive,
  onNavigate,
}: {
  link: Extract<NavItem, { subLinks: unknown }>;
  isActive: (path: string) => boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="space-y-1 py-2">
      <MobileSectionHeader link={link} onNavigate={onNavigate} />
      <MobileSubLinks
        links={link.subLinks}
        isActive={isActive}
        onNavigate={onNavigate}
        depth={1}
      />
    </div>
  );
}

function MobileSubLinks({
  links,
  isActive,
  onNavigate,
  depth,
}: {
  links: readonly NavSubLink[];
  isActive: (path: string) => boolean;
  onNavigate: () => void;
  depth: number;
}) {
  const paddingLeft = `${depth * 1 + 1}rem`;

  return links.map((item) => {
    if ("subLinks" in item) {
      return (
        <div key={item.label}>
          {item.path ? (
            <Link
              to={item.path}
              style={{ paddingLeft }}
              className={`block py-2 text-sm transition-colors hover:bg-gray-50 ${
                isActive(item.path) ? "bg-gray-50 font-medium" : ""
              }`}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ) : (
            <div
              style={{ paddingLeft }}
              className="py-2 text-sm font-medium text-gray-700"
            >
              {item.label}
            </div>
          )}
          <MobileSubLinks
            links={item.subLinks}
            isActive={isActive}
            onNavigate={onNavigate}
            depth={depth + 1}
          />
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        style={{ paddingLeft }}
        className={`block py-2 text-sm transition-colors hover:bg-gray-50 ${
          isActive(item.path) ? "bg-gray-50" : ""
        }`}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  });
}

function MobileSectionHeader({
  link,
  onNavigate,
}: {
  link: Extract<NavItem, { path?: string; label: string }>;
  onNavigate: () => void;
}) {
  if (link.path) {
    return (
      <Link
        to={link.path}
        className="block px-4 py-2 font-medium text-gray-800"
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    );
  }
  return <div className="px-4 py-2 font-medium text-gray-800">{link.label}</div>;
}
