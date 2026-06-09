import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

type BackLinkProps = {
  to: string;
  label: string;
};

export default function BackLink({ to, label }: BackLinkProps) {
  return (
    <section className="py-6 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={to}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--brand)] transition-colors"
        >
          <ArrowLeft size={18} />
          {label}
        </Link>
      </div>
    </section>
  );
}
