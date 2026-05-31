import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { GalleryImageEntry } from "../../lib/galleryImages";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type GalleryPageProps = {
  title: string;
  intro: string;
  images: readonly GalleryImageEntry[];
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
  title,
  images,
}: {
  title: string;
  images: readonly GalleryImageEntry[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {images.map((image, index) => (
          <figure key={`${title}-${index}`} className="group min-w-0">
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="relative block w-full min-w-0 overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
              aria-label={`Agrandir ${title} ${index + 1}`}
            >
              <div
                className="relative w-full overflow-hidden bg-gray-100"
                style={{ aspectRatio: `${image.width} / ${image.height}` }}
              >
                <ImageWithFallback
                  src={image.thumb}
                  alt={`${title} ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <ZoomIn
                  size={28}
                  className="text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </span>
            </button>
          </figure>
        ))}
      </div>

      {lightboxIndex !== null ? (
        <GalleryLightbox
          images={images}
          title={title}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </>
  );
}

function GalleryLightbox({
  images,
  title,
  index,
  onClose,
  onNavigate,
}: {
  images: readonly GalleryImageEntry[];
  title: string;
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const image = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(index - 1);
  }, [hasPrev, index, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(index + 1);
  }, [hasNext, index, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, goPrev, goNext]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photo ${index + 1} sur ${images.length}`}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Fermer"
      >
        <X size={28} />
      </button>

      {hasPrev ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
          className="absolute left-2 sm:left-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Photo précédente"
        >
          <ChevronLeft size={36} />
        </button>
      ) : null}

      {hasNext ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
          className="absolute right-2 sm:right-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Photo suivante"
        >
          <ChevronRight size={36} />
        </button>
      ) : null}

      <figure
        className="max-h-[90vh] max-w-[95vw]"
        onClick={(event) => event.stopPropagation()}
      >
        <ImageWithFallback
          src={image.full}
          alt={`${title} ${index + 1}`}
          className="max-h-[90vh] max-w-[95vw] object-contain"
        />
        <figcaption className="mt-3 text-center text-sm text-white/70">
          {index + 1} / {images.length}
        </figcaption>
      </figure>
    </div>
  );
}
