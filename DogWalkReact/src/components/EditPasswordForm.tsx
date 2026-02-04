import React, { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext"; // <-- Import du hook useAuth

interface EditPasswordFormProps {
  onCancel: () => void;
}

const EditPasswordForm: React.FC<EditPasswordFormProps> = ({ onCancel }) => {
  const { user, token, refreshUser } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/updatepassword`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/ld+json",
          },
          body: JSON.stringify({
            oldPassword,
            password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Une erreur est survenue.");
        return;
      }

      setSuccess("Mot de passe mis à jour avec succès.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      refreshUser();
    } catch (err) {
      setError("Impossible de mettre à jour le mot de passe. Veuillez réessayer plus tard.");
    }
  };

  return (
    <section
      className="w-full max-w-sm mx-auto px-1 md:px-4 relative"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-password-title"
    >
      {/* Bouton de fermeture en haut à droite */}
      <button
        onClick={onCancel}
        aria-label="Fermer la fenêtre de modification du mot de passe"
        className="absolute top-2 right-4 bg-transparent border-none text-[1.5rem] text-[#7B4E2E] cursor-pointer z-10"
        type="button"
      >
        ×
      </button>
      <div className="bg-[#FBFFEE] p-6 rounded-lg transform hover:scale-[1.01] transition-all text-center">
        {user && (
          <div className="mb-6">
            <ProfileCard userData={user} customClass="h-auto" />
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 mt-1"
          aria-labelledby="edit-password-title"
          role="form"
        >
          <h2 id="edit-password-title" className="text-xl font-bold text-primary-brown text-center mb-2">
            Modifier le mot de passe
          </h2>
          {error && <p className="text-red-500 text-center text-sm font-semibold" role="alert" aria-live="polite">{error}</p>}
          {success && <p className="text-green-600 text-center text-sm font-semibold" role="status" aria-live="polite">{success}</p>}

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="oldPassword" className="font-medium text-secondary-brown">Mot de passe actuel</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                placeholder="Mot de passe actuel"
                className="w-full p-2 border border-[rgba(123,78,46,0.3)] rounded-lg outline-none bg-[rgba(255,255,255,0.8)] text-center"
                aria-required="true"
                autoComplete="current-password"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="newPassword" className="font-medium text-secondary-brown">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Nouveau mot de passe"
                className="w-full p-2 border border-[rgba(123,78,46,0.3)] rounded-lg outline-none bg-[rgba(255,255,255,0.8)] text-center"
                aria-required="true"
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="font-medium text-secondary-brown">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirmer le nouveau mot de passe"
                className="w-full p-2 border border-[rgba(123,78,46,0.3)] rounded-lg outline-none bg-[rgba(255,255,255,0.8)] text-center"
                aria-required="true"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              type="button"
              onClick={onCancel}
              className="w-full bg-[var(--secondary-green)] text-[var(--secondary-brown)] font-medium py-2"
              aria-label="Annuler la modification du mot de passe"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="w-full bg-[var(--primary-green)] text-[var(--primary-brown)] font-medium py-2"
              aria-label="Sauvegarder le nouveau mot de passe"
            >
              Sauvegarder
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditPasswordForm;
