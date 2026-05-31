import { Camera } from "lucide-react";
import type { GalleryEquipmentItem } from "../../config/site";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export type EquipmentGalleryItemView = GalleryEquipmentItem & {
  imageUrl: string | null;
};

type EquipmentGalleryPageProps = {
  title: string;
  intro: string;
  items: readonly EquipmentGalleryItemView[];
  footnote?: string;
};

export default function EquipmentGalleryPage({
  title,
  intro,
  items,
  footnote,
}: EquipmentGalleryPageProps) {
  return (
    <div>
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl mb-6">{title}</h1>
          {intro ? <p className="text-xl text-gray-700">{intro}</p> : null}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col">
              <div className="aspect-square w-full rounded-lg bg-white border border-gray-100 overflow-hidden flex items-center justify-center p-3">
                {item.imageUrl ? (
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-2 text-gray-300 w-full h-full"
                    aria-hidden
                  >
                    <Camera size={40} strokeWidth={1.25} />
                  </div>
                )}
              </div>
              <p className="mt-3 text-center text-sm text-gray-800 leading-snug">
                {item.name}
              </p>
            </li>
          ))}
        </ul>
        {footnote ? (
          <p className="mt-12 text-center text-gray-600 italic">{footnote}</p>
        ) : null}
      </section>
    </div>
  );
}
