# STRUCTURE

Ce document décrit l’ossature technique du site (routage, pages, layouts, sources de données).

## Entrée et routage

- Point d’entrée React : `src/main.tsx` (monte l’app).
- App root : `src/app/App.tsx` (fournit le router React Router).
- Routage : `src/app/routes.ts` via `createBrowserRouter`.

Le routeur déclare un layout racine (`Layout`), commun à toutes les pages, avec deux branches :

- la **page d’arrivée** (`/`), publique, minimale ;
- le **site** (`/site/...`), qui regroupe l’ancien site (portfolio, musique, à propos…) — conceptuellement le côté « privé ».

La section **Projets informatiques** (`/projets`) fait exception : elle est déclarée au même niveau que la page d’arrivée, hors de `/site`.

```
/                       → Landing (page d’arrivée)
/projets                → ProjetsIndex
/projets/:slug          → ProjetDetail
/site                   → Home (ancien accueil)
/site/about             → About
/site/portfolio         → PortfolioIndex
/site/portfolio/:slug…  → PortfolioGallery
/site/musique…          → Musique*
/site/installation      → Installation
/site/poi               → Poi
/site/marine            → Marine
/site/contact           → redirige vers /site
```

Le préfixe `/site` est défini une seule fois via `SITE_PREFIX` dans `src/config/site.ts`, et tous les chemins des sections concernées (`portfolio`, `musique`, `about`, `installation`) sont construits à partir de cette constante. `projets` n’utilise pas ce préfixe : ses chemins sont `/projets` et `/projets/:slug`.

## Layouts et wrappers partagés

### Layout global (header + footer + `<Outlet />`)

- Composant : `src/app/components/Layout.tsx`
- Utilisé par : toutes les pages (route racine `path: "/"`), y compris la page d’arrivée.
- Données consommées :
  - `src/config/navigation.ts` : `mainNavigation`, `landingNavigation`, `isNavActive`, `isNavSectionActive`
  - `src/config/site.ts` : `site` (nom, email, réseaux, copyrightYear)
- Comportement du menu :
  - Sur `/` (page d’arrivée) : le header affiche `landingNavigation` (2 liens : « Projets informatiques » → `/projets`, « Site » → `/site`).
  - Sur toute autre URL (`/projets`, `/site/...`) : le header affiche `mainNavigation` (Portfolio, Projets informatiques, Musique, Qui suis-je ?).

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

### `/` (page d’arrivée)

- URL : `/`
- Composant : `src/app/components/Landing.tsx`
- Layout : `src/app/components/Layout.tsx` (menu `landingNavigation`)
- Données consommées : aucune.
- Remarques :
  - Page volontairement vide entre le header et le footer, à compléter plus tard.
  - Sert de point d’entrée public avant d’aller vers `/projets` ou `/site`.

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
  - `src/config/site.ts` : `projets` (recherche `items.find((p) => p.slug === slug)`), `installation` (lien vers les instructions)
- Remarques :
  - Lien vers `/site/installation` affiché si des téléchargements sont disponibles.

### `/site` (accueil du site)

- URL : `/site`
- Composant : `src/app/components/Home.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `site`, `homeIntro`, `portfolio`, `projets`, `musique`, `about`
  - `src/config/site.ts` : `visiblePortfolioGalleries()`, `musiquePageImage()`
  - `src/app/components/useRandomGalleryCovers.ts` : `useRandomHeroImage()`, `useRandomGalleryHubItems()`
- Remarques :
  - La section “À propos” réutilise `src/app/components/AboutPortraits.tsx`.
  - Affiche aussi un aperçu de la section Projets (`/projets`), bien qu’elle soit hors de `/site`.

### `/site/about`

- URL : `/site/about`
- Composant : `src/app/components/About.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `about`, `site`

### `/site/portfolio`

- URL : `/site/portfolio`
- Composant : `src/app/components/PortfolioIndex.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `portfolio`, `visiblePortfolioGalleries()`
  - `src/app/components/useRandomGalleryCovers.ts` : `useRandomGalleryHubItems()`
- Wrapper UI principal : `src/app/components/SectionHub.tsx`

### `/site/portfolio/:slug`

- URL : `/site/portfolio/:slug`
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

### `/site/portfolio/:parentSlug/:slug`

- URL : `/site/portfolio/:parentSlug/:slug`
- Composant : `src/app/components/PortfolioGallery.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées : identiques à `/site/portfolio/:slug` (avec résolution parent/enfant via `findPortfolioGallery(slug, parentSlug)` + manifest key `parentSlug/slug`).

### `/site/musique`

- URL : `/site/musique`
- Composant : `src/app/components/MusiqueIndex.tsx`
- Layout : `src/app/components/Layout.tsx`
- Loader : `musiqueSectionLoader` (redirige vers `/site` si `isMusiqueVisible()` est faux)
- Données consommées :
  - `src/config/site.ts` : `musique`, `musiquePageImage()`
- Wrapper UI principal : `src/app/components/SectionHub.tsx`

### `/site/musique/:slug`

- URL : `/site/musique/:slug`
- Composant : `src/app/components/MusiquePage.tsx` (export `MusiquePageRoute`)
- Layout : `src/app/components/Layout.tsx`
- Layout interne : `src/app/components/MusiqueTwoColumnLayout.tsx`
- Loader : `musiqueSectionLoader`
- Données consommées :
  - `src/config/site.ts` : `musique` (recherche page par `slug`), `musiquePageImage()`

### `/site/musique/enregistrements`

- URL : `/site/musique/enregistrements`
- Composant : `src/app/components/MusiqueEnregistrements.tsx`
- Layout : `src/app/components/Layout.tsx`
- Layout interne : `src/app/components/MusiqueTwoColumnLayout.tsx`
- Loader : `musiqueSectionLoader`
- Données consommées :
  - `src/config/site.ts` : `musique.pages` (page `slug === "enregistrements"`), `musique.recordings`, `musiquePageImage()`

### `/site/musique/enregistrements/:recordingSlug`

- URL : `/site/musique/enregistrements/:recordingSlug`
- Composant : `src/app/components/MusiqueRecordingDetail.tsx`
- Layout : `src/app/components/Layout.tsx`
- Loader : `musiqueSectionLoader`
- Données consommées :
  - `src/config/site.ts` : `findMusiqueRecording()`, `musique.enregistrementsPath`

### `/site/installation`

- URL : `/site/installation`
- Composant : `src/components/Installation.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `installation` (apps + procédures Windows/macOS)

### `/site/poi`

- URL : `/site/poi`
- Composant : `src/app/components/Poi.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/data/poi.json`
- Remarques :
  - Pas de lien dans `mainNavigation` (page accessible seulement par URL directe).

### `/site/marine`

- URL : `/site/marine`
- Composant : `src/app/components/Marine.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/lib/marine/alarms.ts`, `src/lib/marine/geo.ts`, `src/lib/marine/overpass.ts`, `src/lib/marine/geoSimulator.ts`
- Remarques :
  - Pas de lien dans `mainNavigation` (page accessible seulement par URL directe).

### `/site/contact`

- URL : `/site/contact`
- Implémentation : route avec `loader` dans `src/app/routes.ts`
- Comportement : redirection vers `/site`
- Composant : aucun
- Layout : `src/app/components/Layout.tsx` (le temps de la redirection)

### `*` (fallback 404)

- URL : toute URL non matchée sous `/site/...`, ou toute URL non matchée à la racine
- Composant : `src/app/components/NotFound.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `SITE_PREFIX` (pour choisir le lien « Retour à l’accueil » : `/site` si l’URL non trouvée commençait par `/site/`, sinon `/`)

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
