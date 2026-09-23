import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTimesheetAuth } from "../../hooks/useTimesheetAuth";

export default function TimesheetLogin() {
  const { user, signIn, signUp } = useTimesheetAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "signup";

  // Si une session existe déjà (ou vient d'être créée après connexion),
  // on redirige automatiquement vers /timesheet.
  useEffect(() => {
    if (user) navigate("/timesheet", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const { error: authError } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setSubmitting(false);

    if (authError) {
      setError(authError);
      return;
    }

    if (isSignUp) {
      // Selon la config Supabase, la confirmation par email peut être requise
      // avant qu'une session ne soit créée (pas de redirection immédiate).
      setInfo(
        "Compte créé. Si la confirmation par email est activée, vérifiez votre boîte de réception avant de vous connecter.",
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-sm border border-gray-100 rounded-lg p-6">
        <h1 className="text-lg font-medium mb-4">
          {isSignUp ? "Créer un compte" : "Connexion"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="timesheet-email"
              className="block text-xs text-gray-500 mb-1"
            >
              Email
            </label>
            <input
              id="timesheet-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label
              htmlFor="timesheet-password"
              className="block text-xs text-gray-500 mb-1"
            >
              Mot de passe
            </label>
            <input
              id="timesheet-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-3 py-2 text-sm rounded-md bg-[var(--brand)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSignUp ? "Créer un compte" : "Se connecter"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? "signin" : "signup");
            setError(null);
            setInfo(null);
          }}
          className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {isSignUp
            ? "Déjà un compte ? Se connecter"
            : "Pas de compte ? Créer un compte"}
        </button>
      </div>
    </div>
  );
}
