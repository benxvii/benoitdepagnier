import SectionHub from "./SectionHub";
import { portfolio } from "../../config/site";
import { useRandomGalleryHubItems } from "./useRandomGalleryCovers";

export default function PortfolioIndex() {
  const items = useRandomGalleryHubItems(portfolio.galleries);

  return (
    <SectionHub
      title={portfolio.title}
      intro={portfolio.intro}
      items={items}
    />
  );
}
