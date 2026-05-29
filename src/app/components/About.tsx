import { ImageWithFallback } from "./figma/ImageWithFallback";
import { about, site } from "../../config/site";

export default function About() {
  return (
    <div>
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl">{about.title}</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-10 gap-12 items-start">
          <div className="md:col-span-3">
            <ImageWithFallback
              src={about.portraitImage}
              alt={site.name}
              className="w-full h-auto aspect-[4/5] object-cover"
            />
            {about.portraitCaption && (
              <p className="mt-3 text-sm text-gray-500 text-center">
                {about.portraitCaption}
              </p>
            )}
          </div>
          <div className="md:col-span-7 space-y-5">
            <h2 className="text-3xl">{site.name}</h2>
            {about.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg text-gray-700 leading-relaxed text-justify"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
