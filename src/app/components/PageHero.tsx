type PageHeroProps = {
  title: string;
  intro: string;
};

export default function PageHero({ title, intro }: PageHeroProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl mb-6">{title}</h1>
        {intro ? <p className="text-xl text-gray-700">{intro}</p> : null}
      </div>
    </section>
  );
}
