import type { ReactNode } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type MusiqueTwoColumnLayoutProps = {
  title: string;
  image?: string;
  imageAlt: string;
  children: ReactNode;
};

/** Même grille 3/7 que la page Qui suis-je (About). */
export default function MusiqueTwoColumnLayout({
  title,
  image,
  imageAlt,
  children,
}: MusiqueTwoColumnLayoutProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid grid-cols-1 md:grid-cols-10 gap-12 items-start">
        <div className="md:col-span-3">
          {image ? (
            <ImageWithFallback
              src={image}
              alt={imageAlt}
              className="w-full h-auto aspect-[4/5] object-cover"
            />
          ) : null}
        </div>
        <div className="md:col-span-7 space-y-5">
          <h1 className="text-3xl">{title}</h1>
          {children}
        </div>
      </div>
    </section>
  );
}
