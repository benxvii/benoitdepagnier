import { about, site } from "../../config/site";
import { AboutPortraits } from "./AboutPortraits";

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
            <AboutPortraits variant="page" />
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
