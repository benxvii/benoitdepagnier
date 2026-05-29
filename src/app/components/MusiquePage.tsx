import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import TextPage from "./TextPage";
import { musique } from "../../config/site";

export default function MusiquePageRoute() {
  const { slug } = useParams<{ slug: string }>();
  const page = musique.pages.find((p) => p.slug === slug);

  if (!page) {
    return <Navigate to={musique.indexPath} replace />;
  }

  return (
    <div>
      <section className="py-6 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={musique.indexPath}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)] transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à la musique
          </Link>
        </div>
      </section>
      <TextPage title={page.title} intro={page.intro} body={page.body} />
    </div>
  );
}
