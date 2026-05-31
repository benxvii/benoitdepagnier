import SectionHub from "./SectionHub";
import { musique, musiquePageImage } from "../../config/site";

export default function MusiqueIndex() {
  return (
    <SectionHub
      title={musique.title}
      intro={musique.intro.join(" ")}
      imageLayout="icon"
      imageFit="cover"
      linkLabel="En savoir plus"
      items={musique.pages.map((page) => ({
        path: page.path,
        title: page.title,
        description: page.intro ?? "",
        image: musiquePageImage(page),
      }))}
    />
  );
}
