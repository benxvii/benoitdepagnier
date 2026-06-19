import { about } from "../../config/site";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function About() {
  const [portrait, it, music] = about.portraits;

  return (
    <div>
      <section className="pt-24 pb-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl">{about.title}</h1>
          <p className="mt-4 text-lg text-gray-500">
           41 ans de banque, 38 ans de musique, 2 ans de coding, et un appareil photo depuis toujours.

          </p>
        </div>
      </section>

      {/* Bloc 1 — Photographie, image à gauche */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col items-center">
            <div className="w-3/4">
              <ImageWithFallback
                src={portrait.image}
                alt={portrait.caption}
                className="w-full h-auto aspect-[4/5] object-cover"
              />
              <p className="mt-3 text-sm text-gray-500 text-center">{portrait.caption}</p>
            </div>
          </div>
          <div className="space-y-5 pt-2">
            <h2 className="text-3xl">Photographie</h2>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              Passionné depuis toujours de photographie, j'ai réalisé mes premières images grâce aux appareils de mon père, puis à ceux que j'ai reçus, achetés ou qui m'ont gentiment été prêtés. Déjà enfant, j'avais toujours un appareil dans les mains.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              À 12 ans, j'ai reçu mon premier appareil professionnel, un Nikon F2 Photomic, avec trois objectifs : 35mm, 55mm micro et 200mm. Merci à mon papa qui a racheté le matériel d'un de ses fournisseurs photographe.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              À 19 ans, j'ai rencontré Eric Lafargue, grand professionnel de la photo sportive, et passé quelques mois à ses côtés. 
            </p>
          </div>
        </div>
      </section>

      {/* Interlude pleine largeur */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-lg text-gray-700 leading-relaxed text-justify">
        Mes premières images ont été publiées dans les quotidiens — quelle fierté de découvrir mes photos dans les pages sports du journal « La Suisse » en partant travailler le lundi matin.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed text-justify mt-4">
        À 15 ans, je me suis dirigé vers une formation bancaire — tout en continuant la photographie. À 20 ans, j'entrais chez un banquier privé. Une carrière entre le business et l'informatique décisionnelle. Mais ça, c'est une autre histoire.
        </p>
      </section>

      {/* Bloc 2 — IT, image à droite */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-5 pt-2 md:order-1 order-2">
          <h2 className="text-3xl">Développement assisté par IA</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-justify">
            À 55 ans, j'ai découvert la programmation grâce à l'IA et je me suis lancé dans la création d'applications en Python.
          </p>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              La rigueur accumulée en informatique décisionnelle, je la mets aujourd'hui au service du développement d'outils concrets, pensés pour des besoins réels.
            </p>
          </div>
          <div className="flex flex-col items-center md:order-2 order-1">
            <div className="w-3/4">
              <ImageWithFallback
                src={it.image}
                alt={it.caption}
                className="w-full h-auto aspect-[4/5] object-cover"
              />
              <p className="mt-3 text-sm text-gray-500 text-center">{it.caption}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bloc 3 — Musique, image à gauche */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col items-center">
            <div className="w-3/4">
              <ImageWithFallback
                src={music.image}
                alt={music.caption}
                className="w-full h-auto aspect-[4/5] object-cover"
              />
              <p className="mt-3 text-sm text-gray-500 text-center">{music.caption}</p>
            </div>
          </div>
          <div className="space-y-5 pt-2">
            <h2 className="text-3xl">Musique</h2>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              J'ai commencé le saxophone à 19 ans, en même temps que mes débuts professionnels. À 20 ans, j'intégrais le Big Band des Eaux-Vives, où j'ai joué pendant 29 ans — d'abord à l'alto, puis au baryton, avant de devenir 1er alto. Une aventure musicale autant qu'humaine : j'y ai aussi assumé diverses responsabilités au sein du comité.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              Après ces années de big band, je me suis tourné vers l'EMA School de Genève — exploration du jazz, des musiques improvisées, de l'harmonie. Aujourd'hui je continue en cours et ateliers, toujours avec le même appétit. J'ai eu la chance d'y croiser des professeurs extraordinaires, sachant encourager autant qu'exiger, et une communauté de passionnés qui rendent chaque séance vivante.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
