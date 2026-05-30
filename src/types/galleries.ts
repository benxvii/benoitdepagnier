export type GalleryImage = {
  publicId: string;
  width: number;
  height: number;
};

export type ManifestGallery = {
  slug: string;
  title: string;
  folder: string;
  images: GalleryImage[];
};

export type GalleriesManifest = {
  generatedAt: string;
  cloudFolder: string;
  galleries: ManifestGallery[];
};
