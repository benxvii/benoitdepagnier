# STRUCTURE

Ce document décrit l’ossature technique du site (routage, pages, layouts, sources de données).

## Entrée et routage

- Point d’entrée React : `src/main.tsx` (monte l’app).
- App root : `src/app/App.tsx` (fournit le router React Router).
- Routage : `src/app/routes.ts` via `createBrowserRouter`.

Le routeur déclare un layout racine, puis des routes enfants (pages).

## Layouts et wrappers partagés

### Layout global (header + footer + `<Outlet />`)

- Composant : `src/app/components/Layout.tsx`
- Utilisé par : toutes les pages (route racine `path: "/"`).
- Données consommées :
  - `src/config/navigation.ts` : `mainNavigation`, `isNavActive`, `isNavSectionActive`
  - `src/config/site.ts` : `site` (nom, email, réseaux, copyrightYear)

### Layout 2 colonnes (pages Musique)

- Composant : `src/app/components/MusiqueTwoColumnLayout.tsx`
- Utilisé par :
  - `src/app/components/MusiquePage.tsx`
  - `src/app/components/MusiqueEnregistrements.tsx`
- Données consommées : aucune directement (props `title`, `image`, `imageAlt`, `children`).

### Wrapper “hub” (grille de cartes)

- Composant : `src/app/components/SectionHub.tsx`
- Utilisé par :
  - `src/app/components/PortfolioIndex.tsx`
  - `src/app/components/ProjetsIndex.tsx`
  - `src/app/components/MusiqueIndex.tsx`
- Données consommées : aucune directement (props `title`, `intro`, `items`, options d’images).

## Pages (routes)

Chaque entrée ci-dessous correspond à une route déclarée dans `src/app/routes.ts`.

### `/` (accueil)

- URL : `/`
- Composant : `src/app/components/Home.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `site`, `homeIntro`, `portfolio`, `projets`, `musique`, `about`
  - `src/config/site.ts` : `visiblePortfolioGalleries()`, `musiquePageImage()`
  - `src/app/components/useRandomGalleryCovers.ts` : `useRandomHeroImage()`, `useRandomGalleryHubItems()`
- Remarques :
  - La section “À propos” réutilise `src/app/components/AboutPortraits.tsx`.

### `/about`

- URL : `/about`
- Composant : `src/app/components/About.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `about`, `site`

### `/portfolio`

- URL : `/portfolio`
- Composant : `src/app/components/PortfolioIndex.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `portfolio`, `visiblePortfolioGalleries()`
  - `src/app/components/useRandomGalleryCovers.ts` : `useRandomGalleryHubItems()`
- Wrapper UI principal : `src/app/components/SectionHub.tsx`

### `/portfolio/:slug`

- URL : `/portfolio/:slug`
- Composant : `src/app/components/PortfolioGallery.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `portfolio`, `findPortfolioGallery()`
  - `src/hooks/useGalleries.ts` : `useGalleries()` (charge le manifest Cloudinary)
  - `src/lib/galleryManifest.ts` : URLs du manifest via variables d’environnement (`VITE_MANIFEST_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_FOLDER`) + fallback `/_galleries.json`
  - `src/lib/galleryImages.ts` : `findManifestGallery()`, `galleryImageEntries()`, `resolveEquipmentImageUrl()`
- Layout / wrappers utilisés selon le type de galerie :
  - Hub de sous-galeries : `src/app/components/SectionHub.tsx`
  - Galerie “equipment” : `src/app/components/EquipmentGalleryPage.tsx`
  - Galerie d’images : `src/app/components/GalleryPage.tsx`

### `/portfolio/:parentSlug/:slug`

- URL : `/portfolio/:parentSlug/:slug`
- Composant : `src/app/components/PortfolioGallery.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées : identiques à `/portfolio/:slug` (avec résolution parent/enfant via `findPortfolioGallery(slug, parentSlug)` + manifest key `parentSlug/slug`).

### `/projets`

- URL : `/projets`
- Composant : `src/app/components/ProjetsIndex.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `projets` (title, intro, items)
- Wrapper UI principal : `src/app/components/SectionHub.tsx`

### `/projets/:slug`

- URL : `/projets/:slug`
- Composant : `src/app/components/ProjetDetail.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `projets` (recherche `items.find((p) => p.slug === slug)`)
- Remarques :
  - Lien vers `/installation` affiché si des téléchargements sont disponibles.

### `/musique`

- URL : `/musique`
- Composant : `src/app/components/MusiqueIndex.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `musique`, `musiquePageImage()`
- Wrapper UI principal : `src/app/components/SectionHub.tsx`

### `/musique/:slug`

- URL : `/musique/:slug`
- Composant : `src/app/components/MusiquePage.tsx` (export `MusiquePageRoute`)
- Layout : `src/app/components/Layout.tsx`
- Layout interne : `src/app/components/MusiqueTwoColumnLayout.tsx`
- Données consommées :
  - `src/config/site.ts` : `musique` (recherche page par `slug`), `musiquePageImage()`

### `/musique/enregistrements`

- URL : `/musique/enregistrements`
- Composant : `src/app/components/MusiqueEnregistrements.tsx`
- Layout : `src/app/components/Layout.tsx`
- Layout interne : `src/app/components/MusiqueTwoColumnLayout.tsx`
- Données consommées :
  - `src/config/site.ts` : `musique.pages` (page `slug === "enregistrements"`), `musique.recordings`, `musiquePageImage()`

### `/musique/enregistrements/:recordingSlug`

- URL : `/musique/enregistrements/:recordingSlug`
- Composant : `src/app/components/MusiqueRecordingDetail.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `findMusiqueRecording()`, `musique.enregistrementsPath`

### `/installation`

- URL : `/installation`
- Composant : `src/components/Installation.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `installation` (apps + procédures Windows/macOS)

### `/contact`

- URL : `/contact`
- Implémentation : route avec `loader` dans `src/app/routes.ts`
- Comportement : redirection vers `/`
- Composant : aucun
- Layout : `src/app/components/Layout.tsx` (le temps de la redirection)

### `*` (fallback 404)

- URL : toute URL non matchée
- Composant : `src/app/components/NotFound.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées : aucune

## Autres composants partagés (UI et utilitaires)

Les composants ci-dessous sont réutilisés par plusieurs pages, même s’ils ne sont pas des “layouts” à proprement parler.

- Images :
  - `src/app/components/figma/ImageWithFallback.tsx`
- About (portraits) :
  - `src/app/components/AboutPortraits.tsx`
- Randomisation d’images / cartes (accueil + hubs) :
  - `src/app/components/useRandomGalleryCovers.ts`
- Composants UI (shadcn) :
  - Dossier : `src/app/components/ui/*.tsx`

