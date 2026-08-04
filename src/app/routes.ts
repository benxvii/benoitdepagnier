import { createBrowserRouter, redirect } from "react-router";
import { isMusiqueVisible, SITE_PREFIX } from "../config/site";
import Layout from "./components/Layout";
import Landing from "./components/Landing";
import Home from "./components/Home";
import About from "./components/About";
import PortfolioIndex from "./components/PortfolioIndex";
import PortfolioGallery from "./components/PortfolioGallery";
import ProjetsIndex from "./components/ProjetsIndex";
import ProjetDetail from "./components/ProjetDetail";
import MusiqueIndex from "./components/MusiqueIndex";
import MusiquePageRoute from "./components/MusiquePage";
import MusiqueEnregistrements from "./components/MusiqueEnregistrements";
import MusiqueRecordingDetail from "./components/MusiqueRecordingDetail";
import NotFound from "./components/NotFound";
import Installation from "../components/Installation";
import Poi from "./components/Poi";
import Marine from "./components/Marine";

function musiqueSectionLoader() {
  if (!isMusiqueVisible()) {
    return redirect(SITE_PREFIX);
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: "projets", Component: ProjetsIndex },
      { path: "projets/:slug", Component: ProjetDetail },
      {
        path: "site",
        children: [
          { index: true, Component: Home },
          { path: "about", Component: About },
          { path: "portfolio", Component: PortfolioIndex },
          { path: "portfolio/:slug", Component: PortfolioGallery },
          { path: "portfolio/:parentSlug/:slug", Component: PortfolioGallery },
          { path: "musique", loader: musiqueSectionLoader, Component: MusiqueIndex },
          {
            path: "musique/enregistrements/:recordingSlug",
            loader: musiqueSectionLoader,
            Component: MusiqueRecordingDetail,
          },
          {
            path: "musique/enregistrements",
            loader: musiqueSectionLoader,
            Component: MusiqueEnregistrements,
          },
          {
            path: "musique/:slug",
            loader: musiqueSectionLoader,
            Component: MusiquePageRoute,
          },
          { path: "installation", Component: Installation },
          { path: "poi", Component: Poi },
          { path: "marine", Component: Marine },
          { path: "contact", loader: () => redirect(SITE_PREFIX) },
          { path: "*", Component: NotFound },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
