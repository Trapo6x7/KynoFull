import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { ProfileCard } from "./ProfileCard";

interface LoginProps {
  onGoToRegister: () => void;
  onLoginSuccess: () => void;
  onShowTerms: () => void;
}

export function Login({
  onLoginSuccess,
  onGoToRegister,
  onShowTerms,
}: LoginProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/login_check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
      }

      const { token } = await response.json();
      login(token);
      onLoginSuccess();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="flex justify-center items-center h-screen w-full max-w-sm mx-auto px-4"
      role="main"
      aria-label="Connexion à DogWalk"
    >
      <ProfileCard
        title="Bienvenue sur DogWalk !"
        description="Connectez-vous pour commencer votre aventure"
        headerContent={<></>}
        customClass="h-auto transform hover:scale-[1.01] transition-all text-center px-6 py-6 flex flex-col items-center justify-center"
      >
        <article className="flex flex-col items-center gap-4 w-full">
          <header className="mb-3 flex justify-center">
            <p className="text-[0.95rem] text-secondary-brown text-center">
              Entrez vos identifiants
            </p>
          </header>
          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-3 mt-1 items-center w-full relative z-10"
            aria-label="Formulaire de connexion"
            role="form"
          >
            <section
              className="flex flex-col gap-3 w-full items-center"
              aria-label="Champs de connexion"
            >
              <div className="relative w-full z-10">
                <label htmlFor="login-username" className="sr-only">
                  Nom d'utilisateur
                </label>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-[rgba(123,78,46,0.3)] rounded-lg outline-none bg-[rgba(255,255,255,0.8)] text-center"
                  aria-required="true"
                />
              </div>
              <div className="relative w-full z-10">
                <label htmlFor="login-password" className="sr-only">
                  Mot de passe
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-[rgba(123,78,46,0.3)] rounded-lg outline-none bg-[rgba(255,255,255,0.8)] text-center"
                  aria-required="true"
                />
              </div>
            </section>
            <section
              className="flex flex-col gap-2 mt-2 w-full z-10"
              aria-label="Actions de connexion"
            >
              <Button
                type="submit"
                className="w-full bg-[var(--primary-green)] text-[var(--primary-brown)] font-medium py-2"
                disabled={isLoading}
                aria-label="Se connecter à DogWalk"
              >
                {isLoading ? "Connexion en cours..." : "Connexion"}
              </Button>
              <div className="flex items-center gap-2 my-1 w-full z-10">
                <div className="flex-grow h-px bg-[rgba(123,78,46,0.2)]"></div>
                <span className="text-[0.75rem] text-[rgba(123,78,46,0.6)]">
                  ou
                </span>
                <div className="flex-grow h-px bg-[rgba(123,78,46,0.2)]"></div>
              </div>
              <Button
                variant="outline"
                className="w-full border border-[rgba(123,78,46,0.3)] text-secondary-brown py-2"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  onGoToRegister();
                }}
                aria-label="Créer un compte DogWalk"
                type="button"
              >
                Créer un compte
              </Button>
            </section>
          </form>
          {errorMessage && (
            <div
              className="mt-2 p-2 bg-red-100 rounded-md border border-red-200 w-full z-20"
              role="alert"
              aria-live="polite"
            >
              <p className="text-red-600 text-center text-xs">{errorMessage}</p>
            </div>
          )}
          <footer
            className="mt-2 text-center flex flex-col items-center justify-center w-full z-0 gap-3"
            aria-label="Informations légales"
          >
            <p className="text-[0.85rem] text-[rgba(123,78,46,0.7)]">
              En vous connectant, vous acceptez nos conditions d'utilisation
            </p>
            <button
              type="button"
              className="text-primary-green hover:text-primary-brown underline text-sm"
              onClick={onShowTerms}
            >
          Voir les CGU
            </button>
            <div className="flex justify-center items-center w-full pt-4">
              <img
                src="/dogwalklogobrown.png"
                alt="DogWalk Logo"
                className="w-20 h-auto"
              />
            </div>
          </footer>
        </article>
      </ProfileCard>
    </main>
  );
}
