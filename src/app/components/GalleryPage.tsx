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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {images.map((src, index) => (
        <div
          key={`${title}-${index}`}
          className="group relative aspect-[4/5] overflow-hidden cursor-pointer"
        >
          <ImageWithFallback
            src={src}
            alt={`${title} ${index + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ))}
    </div>
  );
}
