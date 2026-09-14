import SectionHub from "./SectionHub";
import { projets } from "../../config/site";

export default function ProjetsIndex() {
  return (
    <SectionHub
      title={projets.title}
      intro={projets.intro}
      items={projets.items.map((p) => ({
        path: p.path,
        title: p.title,
        description: p.description,
        image: p.image,
      }))}
    />
  );
}
