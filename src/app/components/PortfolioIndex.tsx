import SectionHub from "./SectionHub";
import { galleryCover, portfolio } from "../../config/site";

export default function PortfolioIndex() {
  return (
    <SectionHub
      title={portfolio.title}
      intro={portfolio.intro}
      items={portfolio.galleries.map((g) => ({
        path: g.path,
        title: g.title,
        description: g.intro,
        image: galleryCover(g),
      }))}
    />
  );
}
