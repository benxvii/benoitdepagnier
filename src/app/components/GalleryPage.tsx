import { ImageWithFallback } from "./figma/ImageWithFallback";

type GalleryPageProps = {
  title: string;
  intro: string;
  images: readonly string[];
};

export default function GalleryPage({ title, intro, images }: GalleryPageProps) {
  return (
    <div>
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl mb-6">{title}</h1>
          <p className="text-xl text-gray-700">{intro}</p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GalleryGrid images={images} title={title} />
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
