import { createBrowserRouter, redirect } from "react-router";
import Layout from "./components/Layout";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "portfolio", Component: PortfolioIndex },
      { path: "portfolio/:slug", Component: PortfolioGallery },
      { path: "portfolio/:parentSlug/:slug", Component: PortfolioGallery },
      { path: "projets", Component: ProjetsIndex },
      { path: "projets/:slug", Component: ProjetDetail },
      { path: "musique", Component: MusiqueIndex },
      {
        path: "musique/enregistrements/:recordingSlug",
        Component: MusiqueRecordingDetail,
      },
      { path: "musique/enregistrements", Component: MusiqueEnregistrements },
      { path: "musique/:slug", Component: MusiquePageRoute },
      { path: "contact", loader: () => redirect("/") },
      { path: "*", Component: NotFound },
    ],
  },
]);
