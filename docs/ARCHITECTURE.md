# STRUCTURE

Ce document décrit l’ossature technique du site (routage, pages, layouts, sources de données).

## Entrée et routage

- Point d’entrée React : `src/main.tsx` (monte l’app).
- App root : `src/app/App.tsx` (fournit le router React Router).
- Routage : `src/app/routes.ts` via `createBrowserRouter`.

Le routeur déclare un layout racine (`Layout`), commun à toutes les pages, avec un seul niveau de routes (pas de préfixe de section) :

```
/                       → Home (accueil)
/about                  → About
/portfolio              → PortfolioIndex
/portfolio/:slug…       → PortfolioGallery
/projets                → ProjetsIndex
/projets/:slug          → ProjetDetail
/musique…               → Musique*
/installation           → Installation
/poi                    → Poi
/marine                 → Marine
/contact                → redirige vers /
/archive-landing        → Landing (non lié dans la navigation)
```

Toutes les sections (`portfolio`, `projets`, `musique`, `about`, `installation`) déclarent directement leurs chemins dans `src/config/site.ts` (`/portfolio`, `/musique`, etc.), sans préfixe partagé.

> Historique : le site a eu, un temps, une page d’arrivée séparée sous `/` avec le reste du contenu sous `/site` puis `/passions`. Cette séparation a été abandonnée ; `/site/...` et `/passions/...` redirigent (301) vers les URLs équivalentes à la racine (voir `public/.htaccess`).

## Layouts et wrappers partagés

### Layout global (header + footer + `<Outlet />`)

- Composant : `src/app/components/Layout.tsx`
- Utilisé par : toutes les pages (route racine `path: "/"`).
- Données consommées :
  - `src/config/navigation.ts` : `mainNavigation`, `isNavActive`, `isNavSectionActive`
  - `src/config/site.ts` : `site` (nom, tagline, email, réseaux, copyrightYear)
- Comportement du menu : un seul menu (`mainNavigation`) sur toutes les pages — Projets informatiques, Portfolio, Musique, Qui suis-je ?

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
  - Affiche un aperçu de chaque section : Portfolio, Projets informatiques, Musique, Qui suis-je ?

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
  - Lien vers `/installation` affiché si des téléchargements sont disponibles.

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

### `/musique`

- URL : `/musique`
- Composant : `src/app/components/MusiqueIndex.tsx`
- Layout : `src/app/components/Layout.tsx`
- Loader : `musiqueSectionLoader` (redirige vers `/` si `isMusiqueVisible()` est faux)
- Données consommées :
  - `src/config/site.ts` : `musique`, `musiquePageImage()`
- Wrapper UI principal : `src/app/components/SectionHub.tsx`

### `/musique/:slug`

- URL : `/musique/:slug`
- Composant : `src/app/components/MusiquePage.tsx` (export `MusiquePageRoute`)
- Layout : `src/app/components/Layout.tsx`
- Layout interne : `src/app/components/MusiqueTwoColumnLayout.tsx`
- Loader : `musiqueSectionLoader`
- Données consommées :
  - `src/config/site.ts` : `musique` (recherche page par `slug`), `musiquePageImage()`

### `/musique/enregistrements`

- URL : `/musique/enregistrements`
- Composant : `src/app/components/MusiqueEnregistrements.tsx`
- Layout : `src/app/components/Layout.tsx`
- Layout interne : `src/app/components/MusiqueTwoColumnLayout.tsx`
- Loader : `musiqueSectionLoader`
- Données consommées :
  - `src/config/site.ts` : `musique.pages` (page `slug === "enregistrements"`), `musique.recordings`, `musiquePageImage()`

### `/musique/enregistrements/:recordingSlug`

- URL : `/musique/enregistrements/:recordingSlug`
- Composant : `src/app/components/MusiqueRecordingDetail.tsx`
- Layout : `src/app/components/Layout.tsx`
- Loader : `musiqueSectionLoader`
- Données consommées :
  - `src/config/site.ts` : `findMusiqueRecording()`, `musique.enregistrementsPath`

### `/installation`

- URL : `/installation`
- Composant : `src/components/Installation.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `installation` (apps + procédures Windows/macOS)

### `/poi`

- URL : `/poi`
- Composant : `src/app/components/Poi.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/data/poi.json`
- Remarques :
  - Pas de lien dans `mainNavigation` (page accessible seulement par URL directe).

### `/marine`

- URL : `/marine`
- Composant : `src/app/components/Marine.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/lib/marine/alarms.ts`, `src/lib/marine/geo.ts`, `src/lib/marine/overpass.ts`, `src/lib/marine/geoSimulator.ts`
- Remarques :
  - Pas de lien dans `mainNavigation` (page accessible seulement par URL directe).

### `/contact`

- URL : `/contact`
- Implémentation : route avec `loader` dans `src/app/routes.ts`
- Comportement : redirection vers `/`
- Composant : aucun
- Layout : `src/app/components/Layout.tsx` (le temps de la redirection)

### `/archive-landing`

- URL : `/archive-landing`
- Composant : `src/app/components/Landing.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées :
  - `src/config/site.ts` : `projets`, `site`
- Remarques :
  - Ancienne page d'arrivée professionnelle, conservée après l'annulation de la séparation pro/perso.
  - Pas de lien dans `mainNavigation` (page accessible seulement par URL directe), comme `/poi` et `/marine`.

### `*` (fallback 404)

- URL : toute URL non matchée
- Composant : `src/app/components/NotFound.tsx`
- Layout : `src/app/components/Layout.tsx`
- Données consommées : aucune (le lien « Retour à l’accueil » pointe toujours vers `/`).

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
