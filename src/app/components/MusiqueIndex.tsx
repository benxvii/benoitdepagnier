import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { musique } from "../../config/site";

export default function MusiqueIndex() {
  return (
    <div>
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl mb-6">{musique.title}</h1>
          <p className="text-xl text-gray-700">{musique.intro}</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {musique.pages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="group flex items-center justify-between p-6 border border-gray-100 hover:border-[var(--brand)] transition-colors"
            >
              <span className="text-lg group-hover:text-[var(--brand)] transition-colors">
                {page.title}
              </span>
              <ArrowRight
                size={20}
                className="text-gray-400 group-hover:text-[var(--brand)] transition-colors"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
