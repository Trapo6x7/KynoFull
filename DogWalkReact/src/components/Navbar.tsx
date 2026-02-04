import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import EditProfileForm from "./EditProfileForm";
import EditPasswordForm from "./EditPasswordForm";
import AddDogs from "./AddDogs";

export function Navbar({ onLogout }: { onLogout: () => void }) {
  const { user, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddDogForm, setShowAddDogForm] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 700 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
      <header
      className={`fixed left-0 z-40 transition-transform duration-300 ${
        isMobile
          ? "flex flex-col items-center top-0 w-screen h-auto rounded-b-2xl"
        : "flex flex-row items-center justify-end top-0 w-screen h-16 pt-4"
      }`}
      role="banner"
      aria-label="Barre de navigation principale"
    >
      {/* Desktop menu */}
      {!isMobile && (
        <nav className="flex flex-row items-center justify-around w-full" aria-label="Menu principal" role="navigation">
          <ul className="flex flex-row items-center justify-center w-full gap-4 list-none p-0 m-0">
            <li>
              <a
                onClick={() => {
                  setShowEditProfile(!showEditProfile);
                  setShowAddDogForm(false);
                  setShowEditPassword(false);
                }}
                className="pt-1 w-15 z-75 cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label="Modifier le profil utilisateur"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setShowEditProfile(!showEditProfile); setShowAddDogForm(false); setShowEditPassword(false); } }}
              >
                <img src="/usericon2.png" alt="Modifier le profil" className="h-9 w-9" />
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setShowAddDogForm(!showAddDogForm);
                  setShowEditProfile(false);
                  setShowEditPassword(false);
                }}
                className="w-15 z-75 cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label="Ajouter un chien"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setShowAddDogForm(!showAddDogForm); setShowEditProfile(false); setShowEditPassword(false); } }}
              >
                <img src="/dogicon2.png" alt="Ajouter un chien" className="h-9 w-9" />
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setShowEditPassword(!showEditPassword);
                  setShowEditProfile(false);
                  setShowAddDogForm(false);
                }}
                className="w-15 z-75 cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label="Modifier le mot de passe"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setShowEditPassword(!showEditPassword); setShowEditProfile(false); setShowAddDogForm(false); } }}
              >
                <img src="/paramdogwalk.png" alt="Modifier le mot de passe" className="h-9 w-9" />
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  logout();
                  onLogout();
                }}
                className="w-15 z-75 cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label="Déconnexion"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { logout(); onLogout(); } }}
              >
                <img src="/logout2.png" alt="Déconnexion" className="h-9 w-9" />
              </a>
            </li>
     
            {/* <li>
              <a className="flex items-center border-none cursor-pointer mt-4 mb-6 bg-transparent pb-4">
                <img
                  src="/logoronddogwalk2.png"
                  alt="Dogwalk logo"
                  className="w-10"
                />
              </a>
            </li> */}
          </ul>
        </nav>
      )}

      {/* Burger menu icon for mobile */}
      {isMobile && (
        <nav className="flex items-center justify-between px-4 py-2 w-full" aria-label="Menu mobile">
          <button
            className="flex flex-col gap-1 justify-center items-center w-10 h-10 focus:outline-none ml-auto"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Ouvrir le menu de navigation"
          >
            <span className="block w-7 h-1 bg-[#7B4E2E] mb-1 rounded transition-all"></span>
            <span className="block w-7 h-1 bg-[#7B4E2E] mb-1 rounded transition-all"></span>
            <span className="block w-7 h-1 bg-[#7B4E2E] rounded transition-all"></span>
          </button>
        </nav>
      )}

      {/* Mobile menu drawer */}
      {isMobile && menuOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-opacity-40 z-50 flex flex-col items-start" role="dialog" aria-modal="true" aria-label="Menu mobile">
          <div className="bg-[#FBFFEE] h-full p-6 flex flex-col gap-6 animate-slide-in-left rounded-bl-2xl">
            <button
              className="self-end mb-4"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
            >
              <span className="text-3xl text-[#7B4E2E]">×</span>
            </button>
            <a
              onClick={() => {
                setShowEditProfile(true);
                setShowAddDogForm(false);
                setShowEditPassword(false);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Modifier le profil utilisateur"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setShowEditProfile(true); setShowAddDogForm(false); setShowEditPassword(false); setMenuOpen(false); } }}
            >
              <img
                src="/usericon2.png"
                alt="Modifier le profil"
                className="h-7 w-7"
              />
            </a>
            <a
              onClick={() => {
                setShowAddDogForm(true);
                setShowEditProfile(false);
                setShowEditPassword(false);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Ajouter un chien"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setShowAddDogForm(true); setShowEditProfile(false); setShowEditPassword(false); setMenuOpen(false); } }}
            >
              <img
                src="/dogicon2.png"
                alt="Ajouter un chien"
                className="h-7 w-7"
              />
            </a>
            <a
              onClick={() => {
                setShowEditPassword(true);
                setShowEditProfile(false);
                setShowAddDogForm(false);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Modifier le mot de passe"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setShowEditPassword(true); setShowEditProfile(false); setShowAddDogForm(false); setMenuOpen(false); } }}
            >
              <img
                src="/paramdogwalk.png"
                alt="Modifier le mot de passe"
                className="h-7 w-7"
              />
            </a>
            <a
              onClick={() => {
                logout();
                onLogout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Déconnexion"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { logout(); onLogout(); setMenuOpen(false); } }}
            >
              <img src="/logout2.png" alt="Déconnexion" className="h-7 w-7" />
            </a>
          </div>
        </div>
      )}

      {/* Modales centrées */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-white/50 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 flex items-center justify-center">
            <EditProfileForm
              onCancel={() => setShowEditProfile(false)}
              userData={user}
              onSave={() => console.log("Save")}
              onRefresh={() => console.log("Refresh")}
            />
          </div>
        </div>
      )}

      {showAddDogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-white/50 backdrop-blur-sm">
          <div className="w-full max-w-md flex items-center justify-center">
            <AddDogs
              onCancel={() => setShowAddDogForm(false)}
              onRefresh={() => console.log("Refresh")}
            />
          </div>
        </div>
      )}

      {showEditPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-white/50 backdrop-blur-sm">
          <div className="p-6 w-full max-w-md flex items-center justify-center">
            <EditPasswordForm onCancel={() => setShowEditPassword(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
