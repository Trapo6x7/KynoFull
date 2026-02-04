
import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Welcome } from "./components/Welcome";
import TermsAndConditions from "./components/TermsAndConditions";

export default function App() {

  const [page, setPage] = useState<"login" | "register" | "welcome">("login");
  const [showTerms, setShowTerms] = useState(false);

  const handleRegisterSuccess = () => {
    setPage("welcome");
  };

  const handleLoginSuccess = () => {
    setPage("welcome");
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setPage("welcome");
    }
  }, []);

  return (
    <>
      {page === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => setPage("register")}
          onShowTerms={() => setShowTerms(true)}
        />
      )}
      {page === "register" && (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onGoToLogin={() => setPage("login")}
          onShowTerms={() => setShowTerms(true)}
        />
      )}
      {page === "welcome" && <Welcome onLogout={() => setPage("login")} />}
      {showTerms && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-4 relative">
            <button
              className="absolute top-2 right-2 text-lg font-bold text-primary-brown hover:text-primary-green"
              onClick={() => setShowTerms(false)}
              aria-label="Fermer les conditions générales"
            >
              ×
            </button>
            <div className="overflow-y-auto max-h-[70vh]">
              <TermsAndConditions onBack={() => setShowTerms(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}