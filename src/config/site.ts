const placeholderImage =
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop";

const emaHommageCannonballAdderleyImages = [
  "L1070155.jpg",
  "L1070156.jpg",
  "L1070159.jpg",
  "L1070161.jpg",
  "L1070162.jpg",
  "L1070163.jpg",
  "L1070164.jpg",
  "L1070167.jpg",
  "L1070168.jpg",
  "L1070169.jpg",
  "L1070170.jpg",
  "L1070172.jpg",
  "L1070173.jpg",
  "L1070175.jpg",
  "L1070176.jpg",
  "L1070178.jpg",
  "L1070179.jpg",
  "L1070186.jpg",
].map(
  (file) =>
    `/portfolio/monde-de-la-musique/ema-hommage-cannonball-adderley-soral/${file}`,
);

const flousUrbainsImages = [
  "L1000870.jpg",
  "L1000346.jpg",
  "L1000350.jpg",
  "L1000351.jpg",
  "L1000353.jpg",
  "L1090291.jpg",
  "L1120687.jpg",
  "L1120688.jpg",
  "L1140591.jpg",
  "L1140596.jpg",
  "Chine-132.jpg",
  "Chine-133.jpg",
  "Chine-002.jpg",
  "Chine-031.jpg",
  "Chine-032.jpg",
  "Chine-048.jpg",
  "Chine-051.jpg",
  "Chine-065.jpg",
  "Chine-136.jpg",
  "Chine-137.jpg",
].map((file) => `/portfolio/flous-de-mouvements/flous-urbains/${file}`);

const streetPhotographyImages = [
  "L1000824.jpg",
  "L1000830.jpg",
  "L1000857.jpg",
  "L1000864.jpg",
  "L1000864-1.jpg",
  "L1000867.jpg",
].map((file) => `/portfolio/street-photography/${file}`);

const louisBilletteNuitImages = [
  "L1070573.jpg",
  "L1070577.jpg",
  "L1070579.jpg",
  "L1070580.jpg",
  "L1070581.jpg",
  "L1070584.jpg",
  "L1070585.jpg",
  "L1070586.jpg",
  "L1070588.jpg",
  "L1070589.jpg",
  "L1070594.jpg",
  "L1070597.jpg",
  "L1070602.jpg",
  "L1070603.jpg",
  "L1070604.jpg",
  "L1070605.jpg",
  "L1070607.jpg",
  "L1070609.jpg",
  "L1070613.jpg",
  "L1070621.jpg",
  "L1070623.jpg",
  "L1070624.jpg",
  "L1070626.jpg",
  "L1070629.jpg",
  "L1070630.jpg",
  "L1070631.jpg",
  "L1070641.jpg",
  "L1070650.jpg",
].map(
  (file) =>
    `/portfolio/monde-de-la-musique/louis-billette-nuit/${file}`,
);

export const site = {
  name: "Benoît d'Epagnier",
  shortName: "Benoît d'Epagnier",
  tagline: "Photo · Musique · Développement",
  email: "bdepagnier@bluewin.ch",
  instagram: "https://www.instagram.com/benxvii/",
  facebook: "https://www.facebook.com/bdepagnier",
  linkedin: "https://www.linkedin.com/in/bdepagnier/",
  logoSrc: "/logo.png",
  copyrightYear: new Date().getFullYear(),
} as const;

export type Gallery = {
  slug: string;
  path: string;
  title: string;
  intro: string;
  coverImage?: string;
  images?: readonly string[];
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
      intro: "Les boîtiers et objectifs qui ont accompagné mon parcours photographique.",
      coverImage: placeholderImage,
      images: [placeholderImage, placeholderImage, placeholderImage],
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
          coverImage: flousUrbainsImages[0],
          images: flousUrbainsImages,
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
          coverImage: emaHommageCannonballAdderleyImages[0],
          images: emaHommageCannonballAdderleyImages,
        },
        {
          slug: "louis-billette-nuit",
          path: "/portfolio/monde-de-la-musique/louis-billette-nuit",
          title: "Louis Billette - NUiT",
          intro: "Louis Billette — NUiT. Concert à la cave de l'AMR (22 septembre 2025).",
          coverImage: louisBilletteNuitImages[0],
          images: louisBilletteNuitImages,
        },
      ],
    },
    {
      slug: "street-photography",
      path: "/portfolio/street-photography",
      title: "Street photography",
      intro: "Regards sur la ville et ses passants.",
      coverImage: streetPhotographyImages[0],
      images: streetPhotographyImages,
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
      image: "/projets/imagecount.png",
      body: `Application Flet standalone extraite du module Analyse d'ImageScribe.

Sélectionnez un répertoire et obtenez des statistiques détaillées : nombre d'images par extension, répartition des tailles, exploration de l'arborescence avec filtres de profondeur. Idéal pour faire le point sur un disque ou un NAS avant un tri ou une importation.

Disponible sur macOS et Windows.`,
      downloads: [
        { label: "macOS", url: "/downloads/ImageCount-mac.zip" },
        { label: "Windows", url: "#" },
      ],
    },
    {
      slug: "imagesweep",
      path: "/projets/imagesweep",
      title: "ImageSweep",
      description:
        "Détecte les doublons exacts et les images visuellement similaires dans vos répertoires photo.",
      image: "/projets/imagesweep.png",
      body: `ImageSweep parcourt un répertoire et repère les images en double selon deux modes :

• Doublons exacts — comparaison par empreinte SHA-256
• Similaires visuels — détection par hash perceptuel (pHash)

Les résultats sont regroupés avec vignettes et exportables en rapport HTML. Formats RAW, HEIC, JPEG et autres formats courants pris en charge.

Disponible sur macOS et Windows.`,
      downloads: [
        { label: "macOS", url: "/downloads/ImageSweep-mac.zip" },
        { label: "Windows", url: "#" },
      ],
    },
    {
      slug: "imagescribe",
      path: "/projets/imagescribe",
      title: "ImageScribe",
      description:
        "Catalogue vos images par IA : analyse, tags automatiques et recherche dans une base SQLite.",
      image: "/projets/imagescribe.png",
      body: `ImageScribe construit un catalogue d'images après identification d'objets sur les photos, pour retrouver facilement vos fichiers par la suite.

Quatre vues principales :
• Analyse répertoire — statistiques sur un dossier (extensions, tailles…)
• Chargement d'images — ingestion et alimentation du catalogue SQLite
• Gestion du catalogue — statistiques SQL et inventaire des tags
• Recherche d'images — recherche par tags et texte libre dans le catalogue`,
      notice:
        "Bêta en cours — ImageScribe est téléchargeable mais encore en développement. L'import, les vignettes et la recherche EXIF fonctionnent. L'analyse IA (tags et légendes Gemini) arrive dans une prochaine version ; aucune clé API n'est requise pour l'instant.",
      downloads: [{ label: "macOS", url: "/downloads/ImageScribe-mac.zip" }],
    },
    {
      slug: "performance-de-portefeuille",
      path: "/projets/performance-de-portefeuille",
      title: "Performance de Portefeuille",
      description: "Suivi et analyse de performance de portefeuille.",
      image: placeholderImage,
      body: "Contenu à compléter — description du projet Performance de Portefeuille.",
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
};

export const musique = {
  indexPath: "/musique",
  enregistrementsPath: "/musique/enregistrements",
  title: "Musique",
  intro:
    "Après deux ans de piano vers 14 ans, j'ai commencé le saxophone alto à 19 ans. Aujourd'hui je joue tant du saxophone alto que baryton.",
  recordings: [
    {
      slug: "agua-viva-y-ardiente",
      path: "/musique/enregistrements/agua-viva-y-ardiente",
      title: "Agua Viva Y Ardiente",
      subtitle: "Un hommage à Tito Puente",
      coverImage: "/musique/agua-viva-y-ardiente-cover.jpg",
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
      body: `J'ai débuté sur un saxophone alto Weltlang acheté d'occasion, puis j'ai joué le saxophone baryton du Big Band (dont j'ai oublié la marque) avant d'acquérir mon premier baryton, un Buescher Aristocrate. Par la suite, j'ai joué sur un Yanagisawa B901, avant de découvrir les saxophones Advences.

J'ai eu la chance de découvrir la marque Advences par un de mes professeurs, et j'ai craqué pour un alto et un baryton en Bb, les deux provenant de leur collection Vintage. Pour répéter en silence, je joue aussi sur un Yamaha YDS-150.`,
    },
    {
      slug: "compositions",
      path: "/musique/compositions",
      title: "Compositions personnelles & arrangements",
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

export const about = {
  path: "/about",
  title: "Qui suis-je ?",
  portraitImage: "/about/portrait.jpg",
  portraitCaption: "Salon Watches & Wonders 2025, Genève",
  paragraphs: [
    "Passionné depuis toujours de photographie, j'ai réalisé mes premières images grâce aux appareils de mon papa, puis à ceux que j'ai reçus, achetés ou qui m'ont gentiment été prêtés. Déjà enfant, j'avais souvent un appareil dans les mains pour aller faire des images autour de chez moi, ou que j'emmenais lors des sorties scolaires et autres événements.",
    "À 12 ans, j'ai reçu mon premier appareil professionnel, un Nikon F2 Photomic, avec trois objectifs : 35mm, 55mm micro et 200mm (merci à mon papa qui a racheté le matériel d'un de ses fournisseurs photographe).",
    "À 15 ans, je me suis dirigé vers une formation bancaire (qui m'occupera par la suite) tout en continuant la photographie. À 19 ans, j'ai rencontré un grand professionnel de la photo sportive et pu passer quelques mois à ses côtés. C'est ainsi que j'ai vu mes premières images de photo de presse sportive publiées dans les quotidiens. Quelle fierté de découvrir sa photo dans les pages sports du journal La Suisse en partant travailler le lundi matin. C'est aussi l'époque où j'ai commencé à jouer du saxophone.",
    "À 20 ans, je suis rentré chez un Banquier Privé, mais ça c'est une autre histoire.",
  ],
} as const;

export const homeIntro = {
  quote:
    "Un site dédié à mes activités et passions : la photographie (depuis mes 6 ans), la musique en tant que saxophoniste (depuis 19 ans), et le développement d'applications.",
} as const;

function pickRandomSubGalleryImage(gallery: Gallery): string | null {
  if (!gallery.subGalleries?.length) return null;

  const subsWithImages = gallery.subGalleries.filter(
    (sub) => sub.images && sub.images.length > 0,
  );
  if (subsWithImages.length === 0) return null;

  const sub = subsWithImages[Math.floor(Math.random() * subsWithImages.length)];
  const images = sub.images!;
  return images[Math.floor(Math.random() * images.length)];
}

function pickRandomOwnImage(gallery: Gallery): string | null {
  if (!gallery.images?.length) return null;
  return gallery.images[Math.floor(Math.random() * gallery.images.length)];
}

/** Image de couverture stable (fallback). */
export function galleryCover(gallery: Gallery): string {
  if (gallery.coverImage) return gallery.coverImage;
  if (gallery.images?.[0]) return gallery.images[0];
  if (gallery.subGalleries?.[0]) return galleryCover(gallery.subGalleries[0]);
  return placeholderImage;
}

/** Image de couverture aléatoire (tous les niveaux du portfolio). */
export function randomGalleryCover(gallery: Gallery): string {
  return (
    pickRandomSubGalleryImage(gallery) ??
    pickRandomOwnImage(gallery) ??
    galleryCover(gallery)
  );
}

export function findPortfolioGallery(
  slug: string,
  parentSlug?: string,
): Gallery | undefined {
  if (parentSlug) {
    const parent = portfolio.galleries.find((g) => g.slug === parentSlug);
    return parent?.subGalleries?.find((g) => g.slug === slug);
  }
  return portfolio.galleries.find((g) => g.slug === slug);
}

export function allPortfolioPaths(): { path: string; label: string }[] {
  const paths: { path: string; label: string }[] = [];
  for (const gallery of portfolio.galleries) {
    paths.push({ path: gallery.path, label: gallery.title });
    if (gallery.subGalleries) {
      for (const sub of gallery.subGalleries) {
        paths.push({ path: sub.path, label: sub.title });
      }
    }
  }
  return paths;
}
