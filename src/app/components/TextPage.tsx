import PageHero from "./PageHero";

type TextPageProps = {
  title: string;
  intro?: string;
  body: string;
};

export default function TextPage({ title, intro, body }: TextPageProps) {
  return (
    <div>
      <PageHero title={title} intro={intro ?? ""} />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
          {body.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
