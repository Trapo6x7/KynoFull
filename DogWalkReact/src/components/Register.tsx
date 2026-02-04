import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { ProfileCard } from "./ProfileCard";

interface RegisterProps {
  onGoToLogin: () => void;
  onRegisterSuccess: () => void;
  onShowTerms: () => void;
}

export function Register({ onGoToLogin, onRegisterSuccess, onShowTerms }: RegisterProps) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState(""); // Nouveau champ pour la ville
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Utiliser l'API de géolocalisation pour récupérer la ville
  useEffect(() => {
    const fetchCity = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

          // Appeler une API météo gratuite pour obtenir la ville
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${latitude},${longitude}`
          );
          const data = await response.json();
          setCity(data.location?.name || "Ville inconnue");
        });
      } else {
        setCity("Géolocalisation non disponible");
      }
    };

    fetchCity();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({ email, password, name, birthdate, city }), // Inclure la ville
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription.");
      }

      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/login_check`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!loginResponse.ok) {
        throw new Error("Inscription réussie, mais échec de la connexion.");
      }

      const { token } = await loginResponse.json();
      login(token); // Connexion automatique après l'inscription
      onRegisterSuccess(); // Rediriger vers la page d'accueil après inscription
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen justify-center items-center w-full">
      <section className="flex flex-col justify-center items-center w-full max-w-sm mx-auto px-4">
        <ProfileCard
          title="Créer un compte"
          description="Rejoignez l'aventure DogWalk"
          headerContent={<></>}
          customClass="h-auto transform hover:scale-[1.01] transition-all text-center p-6 flex flex-col items-center justify-center"
        >
          <section className="mb-3 flex justify-center w-full" aria-label="Introduction formulaire inscription">
            <p className="text-[0.75rem] text-secondary-brown text-center pb-2">Remplissez le formulaire ci-dessous</p>
          </section>
          <form onSubmit={handleRegister} className="flex flex-col gap-2 mt-1 w-full items-center" aria-label="Formulaire d'inscription" role="form">
            <fieldset className="flex flex-col gap-2 w-full justify-center items-center" aria-labelledby="register-form-legend">
              <legend id="register-form-legend" className="sr-only">Informations d'inscription</legend>
              <div className="relative w-full flex flex-col items-center">
                <label htmlFor="register-name" className="sr-only">Nom d'utilisateur</label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-brown/30 rounded-lg outline-none bg-white/80 text-center focus:ring-2 focus:ring-primary-green"
                  aria-required="true"
                  autoComplete="username"
                />
              </div>
              <div className="relative w-full flex flex-col items-center">
                <label htmlFor="register-email" className="sr-only">Email</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-brown/30 rounded-lg outline-none bg-white/80 text-center focus:ring-2 focus:ring-primary-green"
                  aria-required="true"
                  autoComplete="email"
                />
              </div>
              <div className="relative w-full flex flex-col items-center">
                <label htmlFor="register-password" className="sr-only">Mot de passe</label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-brown/30 rounded-lg outline-none bg-white/80 text-center focus:ring-2 focus:ring-primary-green"
                  aria-required="true"
                  autoComplete="new-password"
                />
              </div>
              <div className="relative w-full flex flex-col items-center">
                <label htmlFor="register-birthdate" className="sr-only">Date de naissance</label>
                <input
                  id="register-birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full p-2 border border-brown/30 rounded-lg outline-none bg-white/80 text-center focus:ring-2 focus:ring-primary-green"
                  aria-required="true"
                  autoComplete="bday"
                />
              </div>
              <div className="relative w-full flex flex-col items-center">
                <label htmlFor="register-city" className="sr-only">Ville</label>
                <input
                  id="register-city"
                  type="text"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border border-brown/30 rounded-lg outline-none bg-white/80 text-center focus:ring-2 focus:ring-primary-green"
                  aria-required="true"
                  autoComplete="address-level2"
                />
              </div>
            </fieldset>
            <section className="flex flex-col gap-2 mt-1 w-full justify-center" aria-label="Actions formulaire inscription">
              <Button
                type="submit"
                className="w-full bg-primary-green text-primary-brown font-medium py-2 rounded-lg hover:bg-primary-green/90 transition-colors"
                disabled={isLoading}
                aria-label="S'inscrire"
              >
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
              <div className="relative flex items-center gap-2 my-1 w-full" aria-hidden="true">
                <div className="flex-grow h-px bg-brown/20"></div>
                <span className="text-xs text-brown/60">ou</span>
                <div className="flex-grow h-px bg-brown/20"></div>
              </div>
              <Button
                variant="outline"
                className="w-full border border-brown/30 text-secondary-brown py-2 rounded-lg hover:bg-brown/10 transition-colors"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  onGoToLogin();
                }}
                aria-label="Retour à la connexion"
              >
                Retour à la connexion
              </Button>
            </section>
          </form>
          {message && (
               <div
            className="mt-2 p-2 bg-red-100 rounded-md border border-red-200 w-full z-20 text-center"
            role="alert"
            aria-live="polite"
          >
            <p className="text-red-600 text-center text-xs">{message}</p>
          </div>
          )}
          <footer
            className="mt-2 text-center flex flex-col items-center justify-center w-full z-0 gap-3"
            aria-label="Informations légales"
          >
        <p className="text-[0.625rem] text-brown/70 text-center">
          En vous inscrivant, vous acceptez nos conditions d'utilisation
        </p>
        <button
          type="button"
          className="text-primary-green hover:text-primary-brown underline text-xs"
          onClick={onShowTerms}
        >
          Voir les CGU
        </button>
         <div className="flex justify-center items-center w-full pt-2">
        <img src="/dogwalklogobrown.png" alt="DogWalk Logo" className="w-12 h-12 object-contain" />
        </div>
      </footer>
        </ProfileCard>
      </section>
    </main>
  );
}