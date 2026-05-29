type TextPageProps = {
  title: string;
  intro?: string;
  body: string;
};

export default function TextPage({ title, intro, body }: TextPageProps) {
  return (
    <div>
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl mb-6">{title}</h1>
          {intro && <p className="text-xl text-gray-700">{intro}</p>}
        </div>
      </section>

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
