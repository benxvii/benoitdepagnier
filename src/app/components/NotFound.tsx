import { Link, useLocation } from "react-router";
import { Home } from "lucide-react";
import { SITE_PREFIX } from "../../config/site";

export default function NotFound() {
  const location = useLocation();
  const homePath = location.pathname.startsWith(`${SITE_PREFIX}/`)
    ? SITE_PREFIX
    : "/";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl mb-4">404</h1>
        <p className="text-2xl mb-8 text-gray-700">Page non trouvée</p>
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
        >
          <Home size={20} />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
