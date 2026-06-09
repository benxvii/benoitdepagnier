import { Navigate, useParams } from "react-router";
import BackLink from "./BackLink";
import MusiqueTwoColumnLayout from "./MusiqueTwoColumnLayout";
import { musique, musiquePageImage } from "../../config/site";

export default function MusiquePageRoute() {
  const { slug } = useParams<{ slug: string }>();
  const page = musique.pages.find((p) => p.slug === slug);

  if (!page) {
    return <Navigate to={musique.indexPath} replace />;
  }

  return (
    <div>
      <BackLink to={musique.indexPath} label="Retour à la musique" />
      <MusiqueTwoColumnLayout
        title={page.title}
        image={musiquePageImage(page)}
        imageAlt={page.title}
      >
        {page.intro ? (
          <p className="text-xl text-gray-700 whitespace-pre-line">{page.intro}</p>
        ) : null}
        {page.body ? (
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            {page.body.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-justify whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </MusiqueTwoColumnLayout>
    </div>
  );
}
