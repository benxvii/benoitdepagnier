import { ImageWithFallback } from "./figma/ImageWithFallback";

type GalleryPageProps = {
  title: string;
  intro: string;
  images: readonly string[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

export default function GalleryPage({
  title,
  intro,
  images,
  loading = false,
  error = null,
  emptyMessage,
}: GalleryPageProps) {
  return (
    <div>
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl mb-6">{title}</h1>
          {intro ? <p className="text-xl text-gray-700">{intro}</p> : null}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <p className="text-center text-gray-600">Chargement des photos…</p>
        ) : error ? (
          <p className="text-center text-red-700">
            Impossible de charger la galerie ({error}). Vérifie{" "}
            <code className="text-sm">VITE_MANIFEST_URL</code> et le workflow
            Cloudinary.
          </p>
        ) : images.length === 0 && emptyMessage ? (
          <p className="text-center text-gray-600 max-w-xl mx-auto">{emptyMessage}</p>
        ) : (
          <GalleryGrid images={images} title={title} />
        )}
      </section>
    </div>
  );
}

function GalleryGrid({
  images,
  title,
}: {
  images: readonly string[];
  title: string;
}) {
  return (
    <div className="flex flex-col gap-12">
      {images.map((src, index) => (
        <figure key={`${title}-${index}`} className="flex w-full justify-center">
          <ImageWithFallback
            src={src}
            alt={`${title} ${index + 1}`}
            loading="lazy"
            decoding="async"
            className="block h-auto w-auto max-h-[85vh] max-w-full"
          />
        </figure>
      ))}
    </div>
  );
}
