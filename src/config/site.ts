import { assetUrl } from "./assetUrl";

const placeholderImage =
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop";

export const site = {
  name: "Benoît d'Epagnier",
  shortName: "Benoît d'Epagnier",
  tagline: "Photo · Musique · Développement",
  email: "bdepagnier@bluewin.ch",
  instagram: "https://www.instagram.com/benxvii/",
  facebook: "https://www.facebook.com/bdepagnier",
  linkedin: "https://www.linkedin.com/in/bdepagnier/",
  logoSrc: assetUrl("/logo.png"),
  copyrightYear: new Date().getFullYear(),
} as const;

export type GalleryEquipmentItem = {
  /** Identifiant pour l’image (ex. fichier Cloudinary `nikon-f.jpg`). */
  id: string;
  name: string;
  /** Chemin statique (`/portfolio/mes-appareils/nikon-f.jpg`) ou URL absolue. */
  image?: string;
};

export type Gallery = {
  slug: string;
  path: string;
  title: string;
  intro: string;
  /** Masque la galerie (nav, hub, URL) sans retirer la config. */
  hidden?: boolean;
  /** Grille vignette + nom (ex. page Mes appareils). */
  equipment?: readonly GalleryEquipmentItem[];
  equipmentFootnote?: string;
  subGalleries?: readonly Gallery[];
};

export const portfolio = {
  indexPath: "/portfolio",
  title: "Portfolio",
  intro:
    "Une bonne photographie doit se comprendre sans explications et transmettre une émotion.",
  galleries: [
    {
      slug: "mes-appareils",
      path: "/portfolio/mes-appareils",
      title: "Mes appareils",
      intro:
        "Voici les appareils que j'ai possédés ou eu l'occasion d'utiliser au fil de ma carrière photographique.",
      equipmentFootnote:
        "… et sans doute quelques autres que j'oublie au fil du temps.",
      hidden: true,
      equipment: [
        { id: "nikon-f", name: "Nikon F" },
        {
          id: "nikon-f2-photomic",
          name: "Nikon F2 Photomic avec moteur MD-2 et alimentation MB-1",
        },
        { id: "nikon-fa-md15", name: "Nikon FA avec moteur MD-15" },
        { id: "nikon-f4s", name: "Nikon F4S" },
        { id: "leica-m6", name: "Leica M6" },
        { id: "leica-sl", name: "Leica SL" },
        { id: "leica-sl2-s", name: "Leica SL2-S" },
        { id: "leica-q3-43", name: "Leica Q3 43" },
        { id: "leica-q2", name: "Leica Q2" },
        { id: "leica-q2-monochrome", name: "Leica Q2 Monochrome" },
        { id: "hasselblad-501cm", name: "Hasselblad 501CM" },
        { id: "rollei-35", name: "Rollei 35" },
        { id: "rolleiflex-6x6", name: "Rolleiflex 6×6" },
        { id: "nikon-l35-aw-af", name: "Nikon L35 AW AF" },
        { id: "kodak-126-instamatic", name: "Kodak 126 Instamatic" },
        { id: "minolta-weathermatic-a", name: "Minolta Weathermatic-A" },
        { id: "canon-g7", name: "Canon G7" },
      ],
    },
    {
      slug: "flous-de-mouvements",
      path: "/portfolio/flous-de-mouvements",
      title: "Les flous de mouvements",
      intro: "Explorations du mouvement et du temps long en photographie.",
      subGalleries: [
        {
          slug: "flous-urbains",
          path: "/portfolio/flous-de-mouvements/flous-urbains",
          title: "Flous urbains",
          intro: "",
        },
      ],
    },
    {
      slug: "monde-de-la-musique",
      path: "/portfolio/monde-de-la-musique",
      title: "Le monde de la musique",
      intro: "Scènes, musiciens et ambiance autour de la musique.",
      subGalleries: [
        {
          slug: "ema-hommage-cannonball-adderley-soral",
          path: "/portfolio/monde-de-la-musique/ema-hommage-cannonball-adderley-soral",
          title: "EMA Hommage Cannonball Adderley",
          intro:
            "Hommage à Cannonball Adderley par les professeurs de l'EMA, Soral (22 août 2025)",
        },
        {
          slug: "louis-billette-nuit",
          path: "/portfolio/monde-de-la-musique/louis-billette-nuit",
          title: "Louis Billette - NUiT",
          intro: "Louis Billette — NUiT. Concert à la cave de l'AMR (22 septembre 2025).",
        },
      ],
    },
    {
      slug: "street-photography",
      path: "/portfolio/street-photography",
      title: "Street photography",
      intro: "Regards sur la ville et ses passants.",
    },
  ] as readonly Gallery[],
};

export type ProjetDownload = {
  label: string;
  url: string;
};

export type Projet = {
  slug: string;
  path: string;
  title: string;
  description: string;
  body: string;
  image: string;
  notice?: string;
  downloads?: readonly ProjetDownload[];
  downloadUrl?: string;
  downloadLabel?: string;
};

export const projets = {
  indexPath: "/projets",
  title: "Projets informatiques",
  intro: "Applications et outils que j'ai développés.",
  items: [
    {
      slug: "imagecount",
      path: "/projets/imagecount",
      title: "ImageCount",
      description:
        "Compte les images d'un répertoire (extensions, tailles, arborescence) sans base de données ni IA.",
      image: assetUrl("/projets/imagecount.png"),
      body: `Application Flet standalone extraite du module Analyse d'ImageScribe.

Sélectionnez un répertoire et obtenez des statistiques détaillées : nombre d'images par extension, répartition des tailles, exploration de l'arborescence avec filtres de profondeur. Idéal pour faire le point sur un disque ou un NAS avant un tri ou une importation.

Disponible sur macOS et Windows.`,
      downloads: [
        { label: "macOS", url: assetUrl("/downloads/ImageCount-mac.zip") },
        { label: "Windows", url: assetUrl("/downloads/ImageCount-win.zip") },
      ],
    },
    {
      slug: "imagesweep",
      path: "/projets/imagesweep",
      title: "ImageSweep",
      description:
        "Détecte les doublons exacts et les images visuellement similaires dans vos répertoires photo.",
      image: assetUrl("/projets/imagesweep.png"),
      body: `ImageSweep parcourt un répertoire et repère les images en double selon deux modes :

• Doublons exacts — comparaison par empreinte SHA-256
• Similaires visuels — détection par hash perceptuel (pHash)

Les résultats sont regroupés avec vignettes et exportables en rapport HTML. Formats RAW, HEIC, JPEG et autres formats courants pris en charge.

Disponible sur macOS et Windows.`,
      downloads: [
        { label: "macOS", url: assetUrl("/downloads/ImageSweep-mac.zip") },
        { label: "Windows", url: assetUrl("/downloads/ImageSweep-win.zip") },
      ],
    },
    {
      slug: "imagescribe",
      path: "/projets/imagescribe",
      title: "ImageScribe",
      description:
        "Catalogue vos images par IA : analyse, tags automatiques et recherche dans une base SQLite.",
      image: assetUrl("/projets/imagescribe.png"),
      body: `ImageScribe construit un catalogue d'images après identification d'objets sur les photos, pour retrouver facilement vos fichiers par la suite.

Quatre vues principales :
• Analyse répertoire — statistiques sur un dossier (extensions, tailles…)
• Chargement d'images — ingestion et alimentation du catalogue SQLite
• Gestion du catalogue — statistiques SQL et inventaire des tags
• Recherche d'images — recherche par tags et texte libre dans le catalogue`,
      notice:
        "Bêta en cours — ImageScribe est téléchargeable mais encore en développement. L'import, les vignettes et la recherche EXIF fonctionnent. L'analyse IA (tags et légendes Gemini) arrive dans une prochaine version ; aucune clé API n'est requise pour l'instant.",
      downloads: [
        { label: "macOS", url: assetUrl("/downloads/ImageScribe-mac.zip") },
      ],
    },
    {
      slug: "performance-de-portefeuille",
      path: "/projets/performance-de-portefeuille",
      title: "Performance de Portefeuille",
      description: "Suivi et analyse de performance de portefeuille.",
      image: assetUrl("/projets/portfolioperf-logo.svg"),
      body: "Contenu à compléter — description du projet Performance de Portefeuille.",
      notice:
        "Téléchargez l'archive ZIP, décompressez-la, puis lancez PortfolioApp.exe.",
      downloads: [
        {
          label: "Windows (ZIP)",
          url: assetUrl("/downloads/PortfolioApp.zip"),
        },
      ],
    },
  ] as readonly Projet[],
};

export type MusiqueRecording = {
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  coverImage: string;
  discogsUrl: string;
  artists: string;
  label: string;
  country: string;
  format: string;
  recordedAt: string;
  genres: readonly string[];
  role: string;
  body: string;
  tracks: readonly { title: string; duration: string; writer?: string }[];
};

export type MusiquePage = {
  slug: string;
  path: string;
  title: string;
  intro?: string;
  body: string;
  /** Vignette (accueil, hubs). */
  image?: string;
};

export const musique = {
  indexPath: "/musique",
  enregistrementsPath: "/musique/enregistrements",
  title: "Musique",
  intro: [
    "Après deux ans de piano vers 14 ans, je me suis mis au saxophone à 19 ans - alto d'abord, puis baryton. 29 ans en big band avant de me tourner vers de plus petites formations.",
  ],
  recordings: [
    {
      slug: "agua-viva-y-ardiente",
      path: "/musique/enregistrements/agua-viva-y-ardiente",
      title: "Agua Viva Y Ardiente",
      subtitle: "Un hommage à Tito Puente",
      coverImage: assetUrl("/musique/agua-viva-y-ardiente-cover.jpg"),
      discogsUrl:
        "https://www.discogs.com/release/18151513-Hev-Big-Band-Daniele-Verdesca-Agua-Viva-Y-Ardiente-Un-Hommage-%C3%80-Tito-Puente",
      artists: "HEV Big Band · Daniel Verdesca",
      label: "Harmonie des Eaux-Vives",
      country: "Suisse",
      format: "CD",
      recordedAt: "Taurus Studio",
      genres: ["Jazz", "Latin Jazz"],
      role: "Saxophone baryton",
      body: `Album de la HEV Big Band (Harmonie des Eaux-Vives), hommage au percussionniste et compositeur Tito Puente. Daniel Verdesca en est le chef d'orchestre et le cornet leader.

J'ai le plaisir d'avoir joué au baryton dans la section des saxophones. Le disque mêle standards de Tito Puente (Piccadillo, Mambo Gozon, Oye Como Va, Para Los Rumberos…) et des compositions originales signées Daniel Verdesca ou Andy Schepper.`,
      tracks: [
        { title: "Piccadillo", duration: "4:53", writer: "Tito Puente" },
        { title: "Statue In Bilico", duration: "5:58", writer: "Daniel Verdesca" },
        { title: "Mambo Gozon", duration: "5:13", writer: "Tito Puente" },
        { title: "Floreando", duration: "5:48", writer: "Paul Lopez" },
        { title: "Oye Como Va", duration: "6:20", writer: "Tito Puente" },
        { title: "Tierra Magica", duration: "9:15", writer: "Andy Schepper" },
        { title: "Ulisse", duration: "7:30", writer: "Daniel Verdesca" },
        { title: "Soft Landing", duration: "4:54", writer: "Daniel Verdesca" },
        { title: "Para Los Rumberos", duration: "5:07", writer: "Tito Puente" },
      ],
    },
  ] as readonly MusiqueRecording[],
  pages: [
    {
      slug: "instruments",
      path: "/musique/instruments",
      title: "Mes instruments de musique",
      image: assetUrl("/musique/instruments.jpg"),
      body: `J'ai débuté sur un saxophone alto Weltlang acheté d'occasion, puis j'ai joué le saxophone baryton du Big Band (dont j'ai oublié la marque) avant d'acquérir mon premier baryton, un Buescher Aristocrate. Par la suite, j'ai joué sur un Yanagisawa B901, avant de découvrir les saxophones Advences.

J'ai eu la chance de découvrir la marque Advences par un de mes professeurs, et j'ai craqué pour un alto et un baryton en Bb, les deux provenant de leur collection Vintage. Pour répéter en silence, je joue aussi sur un Yamaha YDS-150.`,
    },
    {
      slug: "compositions",
      path: "/musique/compositions",
      title: "Compositions personnelles & arrangements",
      image: assetUrl("/musique/compositions.jpg"),
      body: "Contenu à compléter — compositions et arrangements personnels.",
    },
    {
      slug: "enregistrements",
      path: "/musique/enregistrements",
      title: "Enregistrements",
      intro: "Participations sur disques et enregistrements audio.",
      body: "",
    },
  ] as readonly MusiquePage[],
};

export function findMusiqueRecording(slug: string): MusiqueRecording | undefined {
  return musique.recordings.find((r) => r.slug === slug);
}

export function musiquePageImage(page: MusiquePage): string | undefined {
  if (page.image) return page.image;
  if (page.slug === "enregistrements") {
    return musique.recordings[0]?.coverImage;
  }
  return undefined;
}

export type AboutPortrait = {
  image: string;
  caption: string;
};

export const about = {
  path: "/about",
  title: "Qui suis-je ?",
  portraits: [
    {
      image: assetUrl("/about/portrait.jpg"),
      caption: "Salon Watches & Wonders 2025, Genève",
    },
    {
      image: assetUrl("/about/nomades-technologies-2025.jpg"),
      caption: "Nomades Technologies 2025, Genève",
    },
    {
      image: assetUrl("/about/ema-school-2022.jpg"),
      caption: "EMA School 2022, Genève",
    },
  ] as readonly AboutPortrait[],
  paragraphs: [
    "Passionné depuis toujours de photographie, j'ai réalisé mes premières images grâce aux appareils de mon père, puis à ceux que j'ai reçus, achetés ou qui m'ont gentiment été prêtés. Déjà enfant, j'avais toujours un appareil dans les mains. Autour de chez moi, lors des sorties scolaires, à chaque occasion.",
    "À 12 ans, j'ai reçu mon premier appareil professionnel, un Nikon F2 Photomic, avec trois objectifs : 35mm, 55mm micro et 200mm. Merci à mon papa qui a racheté le matériel d'un de ses fournisseurs photographe.",
    "À 15 ans, je me suis dirigé vers une formation bancaire tout en continuant la photographie.",
    "À 19 ans, j'ai rencontré Eric Lafargue, grand professionnel de la photo sportive, et passé quelques mois à ses côtés. C'est ainsi que mes premières images ont été publiées dans les quotidiens. Quelle fierté de découvrir mes photos dans les pages sports du journal « La Suisse » en partant travailler le lundi matin. C'est aussi l'époque où j'ai commencé à jouer du saxophone.",
    "À 20 ans, je suis entré chez un banquier privé. Une carrière entre le business et l'informatique, sur des outils d'informatique décisionnelle. Mais ça, c'est une autre histoire.",
    "À 55 ans, mon poste a été supprimé après 35 ans dans la même maison. J'ai choisi d'en faire une opportunité et me suis tourné vers le développement d'applications.",
  ],
} as const;

export const homeIntro = {
  quote:
    // "Un site dédié à mes activités et passions :\n" +
    // "la photographie (depuis mes 6 ans),\n" +
    // "la musique en tant que saxophoniste (depuis 19 ans),\n" +
    // "et le développement d'applications (depuis mes 55 ans).",
    "Un site dédié à mes activités et passions : la photographie depuis mes 6 ans, la pratique de la musique et principalement du saxophone à 19 ans, puis le développement d'applications depuis mes 55 ans."
} as const;

export function isGalleryVisible(gallery: Gallery): boolean {
  return !gallery.hidden;
}

export function visiblePortfolioGalleries(): readonly Gallery[] {
  return portfolio.galleries.filter(isGalleryVisible);
}

export function findPortfolioGallery(
  slug: string,
  parentSlug?: string,
): Gallery | undefined {
  if (parentSlug) {
    const parent = portfolio.galleries.find((g) => g.slug === parentSlug);
    const sub = parent?.subGalleries?.find((g) => g.slug === slug);
    return sub && isGalleryVisible(sub) ? sub : undefined;
  }
  const gallery = portfolio.galleries.find((g) => g.slug === slug);
  return gallery && isGalleryVisible(gallery) ? gallery : undefined;
}

export function allPortfolioPaths(): { path: string; label: string }[] {
  const paths: { path: string; label: string }[] = [];
  for (const gallery of visiblePortfolioGalleries()) {
    paths.push({ path: gallery.path, label: gallery.title });
    if (gallery.subGalleries) {
      for (const sub of gallery.subGalleries) {
        paths.push({ path: sub.path, label: sub.title });
      }
    }
  }
  return paths;
}
