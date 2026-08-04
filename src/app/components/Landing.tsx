import { Link } from "react-router";
import { projets, site } from "../../config/site";

export default function Landing() {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 space-y-6">
        <h1 className="text-4xl sm:text-5xl font-medium leading-tight tracking-tight">
          Des applications sur mesure pour indépendants et PME
        </h1>
        <div className="w-12 h-[3px] bg-[var(--brand)] mt-6 mb-8" />
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link
            to={projets.indexPath}
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--brand)] text-white hover:opacity-90 transition-opacity"
          >
            Voir mes projets
          </Link>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-[var(--brand)] bg-transparent text-[var(--brand)] hover:bg-[var(--brand)]/5 transition-colors"
          >
            Me contacter
          </a>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">
          35 ans d'IT en banque privée, mis au service de projets à taille
          humaine.
        </p>
        <p className="text-lg text-foreground leading-relaxed">
          Après avoir passé 35 ans en banque privée, rattaché au service IT,
          j'ai eu envie de mettre mon expérience au profit des indépendants ou
          PME qui ont des besoins en applicatifs, sites Web ou solutions
          d'automatisation.
        </p>
        <p className="text-lg text-foreground leading-relaxed">
          Mon truc, c'était de comprendre ce que mes collègues avaient vraiment
          besoin, et de leur construire des solutions qui fonctionnent. J'ai accompagné
          400 utilisateurs à travers 8 sites mondiaux, piloté des projets BI, géré des
          migrations complexes.
        </p>
        <p className="text-lg text-foreground leading-relaxed">
          Et j'ai appris à ne rien casser en chemin — ce qui change tout !
        </p>
        <p className="text-lg text-foreground leading-relaxed">
          Depuis 2026, je travaille en freelance avec les indépendants ou
          PME qui ont besoin d'applicatifs, de sites web,
          d'automatisations. Des solutions pragmatiques, fiables, adaptées
          à leur contexte. Pas de blabla, du travail solide.
        </p>
      </section>
    </div>
  );
}
