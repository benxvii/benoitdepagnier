import SectionHub from "./SectionHub";
import { portfolio, visiblePortfolioGalleries } from "../../config/site";
import { useRandomGalleryHubItems } from "./useRandomGalleryCovers";

export default function PortfolioIndex() {
  const items = useRandomGalleryHubItems(visiblePortfolioGalleries());

  return (
    <SectionHub
      title={portfolio.title}
      intro={portfolio.intro}
      items={items}
      linkLabel="Voir la galerie"
    />
  );
}
