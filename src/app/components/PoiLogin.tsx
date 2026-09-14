import { useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function PoiLogin() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "signup";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } = isSignUp
      ? await signUp(email, password, nickname)
      : await signIn(email, password);

    setSubmitting(false);
    if (authError) {
      setError(authError);
    }
  };

  return (
    <div className="max-w-sm border border-gray-100 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-medium mb-4">
        {isSignUp ? "Créer un compte" : "Connexion"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="poi-email" className="block text-xs text-gray-500 mb-1">
            Email
          </label>
          <input
            id="poi-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="poi-nickname" className="block text-xs text-gray-500 mb-1">
              Pseudo
            </label>
            <input
              id="poi-nickname"
              type="text"
              required
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
        )}

        <div>
          <label htmlFor="poi-password" className="block text-xs text-gray-500 mb-1">
            Mot de passe
          </label>
          <input
            id="poi-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || (isSignUp && nickname.trim() === "")}
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
        }}
        className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
      >
        {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? Créer un compte"}
      </button>
    </div>
  );
}
