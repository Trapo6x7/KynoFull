import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import EditProfileForm from "./EditProfileForm";
import UserProfileModal from "./UserProfileModal";
import { UserData } from "../types/Interfaces";

interface MeProps {
  userData: any;
}

export function Me({ userData }: MeProps) {
  const { token, refreshUser } = useAuth();
  const [localUserData, setLocalUserData] = useState(userData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setLocalUserData(userData);
  }, [userData]);

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const handleSave = (updatedData: UserData) => {
    setLocalUserData(updatedData); // Met à jour les données locales
    refreshUser(); // Recharge les données utilisateur globales
  };

  // Accessibility: focus management for modal
  useEffect(() => {
    if (isEditModalOpen) {
      const firstInput = document.querySelector('.edit-profile-form input, .edit-profile-form textarea, .edit-profile-form button');
      if (firstInput) (firstInput as HTMLElement).focus();
    }
  }, [isEditModalOpen]);

  function handlePhotoUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    fetch(`${import.meta.env.VITE_API_URL}/api/users/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.imageFilename) {
          alert("Photo mise à jour avec succès !");
          setLocalUserData((prev: typeof userData) => ({
            ...prev,
            imageFilename: data.imageFilename,
          }));
          refreshUser();
        } else {
          alert("Échec de la mise à jour de la photo.");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'upload de la photo :", error);
        alert("Une erreur est survenue.");
      });
  }

  function calculateAge(birthdate: string): number {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
  return (
    <main
      className="w-full flex flex-col items-center mx-6 mb-8"
      role="main"
      aria-label="Profil utilisateur"
      tabIndex={-1}
    >
      <section className="w-full max-w-md h-full mx-auto" aria-label="Section profil utilisateur">
        {/* Mobile Accordion Layout (inchangé) */}
        {localUserData && (
          <>
            <article className="block md:hidden w-full" aria-label="Profil utilisateur mobile">
              <div className="bg-[#FBFFEE] rounded-xl max-w-md mx-auto flex flex-col shadow-lg p-4 gap-6">
                <details className="max-w-md mx-auto w-full" aria-label="Informations utilisateur">
                  <summary className="flex flex-col items-center gap-2 cursor-pointer select-none px-4 max-w-md mx-auto w-full">
                    <div className="flex items-center justify-center gap-8 w-full max-w-md mx-auto">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {localUserData.imageFilename ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}/uploads/images/${localUserData.imageFilename}`}
                              alt="Photo de profil utilisateur"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl font-bold text-gray-800" aria-label="Initiale du nom">
                                {localUserData.name?.[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          className="absolute bottom-0 right-0 p-0.5 text-xs rounded-full bg-[var(--primary-green)] text-white min-w-0 leading-none w-5 h-5 shadow"
                          aria-label="Changer la photo de profil"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('upload-photo')?.click();
                          }}
                        >
                          +
                        </Button>
                      </div>
                      <input
                        type="file"
                        id="upload-photo"
                        className="hidden"
                        accept="image/*"
                        aria-label="Télécharger une nouvelle photo de profil"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePhotoUpload(file);
                          }
                        }}
                      />
                      <h2 className="text-xl font-bold text-secondary-brown uppercase leading-none mt-2" id="user-profile-name">{localUserData.name}</h2>
                      <span className="text-sm text-secondary-brown mb-2" aria-label="Âge utilisateur">
                        {localUserData.birthdate
                          ? `${calculateAge(localUserData.birthdate)} ans`
                          : "Âge inconnu"}
                      </span>
                    </div>
                  </summary>
                  <section className="mt-4 flex flex-col gap-2 px-4 pb-4 max-w-md mx-auto w-full" role="region" aria-labelledby="user-profile-name" aria-label="Informations détaillées utilisateur">
                    <div className="flex flex-row justify-between items-start">
                      <span className="text-sm text-secondary-brown uppercase font-bold">DESCRIPTION :</span>
                      <span className="text-sm text-secondary-brown text-right max-w-[60%]" aria-label="Description utilisateur">
                        {localUserData.description || "Aucune description disponible."}
                      </span>
                    </div>
                    <div className="flex flex-row justify-between items-start">
                      <span className="text-sm text-secondary-brown uppercase font-bold">EMAIL :</span>
                      <span className="text-sm text-secondary-brown text-right max-w-[60%]" aria-label="Email utilisateur">
                        {localUserData.email || "Non renseigné"}
                      </span>
                    </div>
                    <div className="flex flex-row justify-between items-start">
                      <span className="text-sm text-secondary-brown uppercase font-bold">VILLE :</span>
                      <span className="text-sm text-secondary-brown text-right max-w-[60%]" aria-label="Ville utilisateur">
                        {localUserData.city ? capitalizeFirstLetter(localUserData.city) : "Non renseignée"}
                      </span>
                    </div>
                    <div className="my-3 w-full">
                      <div className="h-px w-full bg-[rgba(123,78,46,0.2)]" aria-hidden="true"></div>
                    </div>
                    <footer>
                      <button
                        className="bg-[var(--primary-green)] text-[var(--primary-brown)] font-medium rounded-md w-full py-2 mt-2 hover:bg-[#B7D336] transition"
                        onClick={openEditModal}
                        type="button"
                        aria-label="Modifier le profil utilisateur"
                      >
                        Modifier le profil
                      </button>
                    </footer>
                  </section>
                </details>
              </div>
            </article>
            {/* Desktop Layout (structure Dogs, une seule card) */}
            <section className="hidden md:block w-full" aria-label="Profil utilisateur desktop">
              <section className="bg-[#FBFFEE] rounded-xl w-full flex flex-col shadow-lg p-10 gap-4 h-[370px] max-h-[370px] min-h-[370px] justify-between" aria-label="Carte profil utilisateur desktop">
                {/* Header Section - aligné Dogs */}
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="relative w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white flex-shrink-0">
                    {localUserData.imageFilename ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/images/${localUserData.imageFilename}`}
                        alt="Photo de profil utilisateur"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-800" aria-label="Initiale du nom">
                          {localUserData.name?.[0]}
                        </span>
                      </div>
                    )}
                    <Button
                      className="absolute bottom-0 right-0 p-0.5 text-xs rounded-full bg-[var(--primary-green)] text-white min-w-0 leading-none w-4 h-4"
                      aria-label="Changer la photo de profil"
                      onClick={() => document.getElementById('upload-photo-desktop')?.click()}
                    >
                      +
                    </Button>
                    <input
                      type="file"
                      id="upload-photo-desktop"
                      className="hidden"
                      accept="image/*"
                      aria-label="Télécharger une nouvelle photo de profil"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoUpload(file);
                        }
                      }}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-brown uppercase" id="user-profile-name-desktop">{localUserData.name}</h2>
                  <span className="text-sm text-secondary-brown" aria-label="Âge utilisateur">
                    {localUserData.birthdate
                      ? `${calculateAge(localUserData.birthdate)} ans`
                      : "Âge inconnu"}
                  </span>
                </div>
                {/* Infos Section - aligné Dogs */}
                <div className="w-full rounded-lg p-4 flex flex-col gap-2" role="region" aria-labelledby="user-profile-name-desktop">
                  <div className="flex flex-row justify-between items-start">
                    <span className="text-sm text-secondary-brown uppercase font-bold">DESCRIPTION :</span>
                    <span className="text-sm text-secondary-brown text-right max-w-[60%]" aria-label="Description utilisateur">
                      {localUserData.description || "Aucune description disponible."}
                    </span>
                  </div>
                  <div className="flex flex-row justify-between items-start">
                    <span className="text-sm text-secondary-brown uppercase font-bold">EMAIL :</span>
                    <span className="text-sm text-secondary-brown text-right max-w-[60%]" aria-label="Email utilisateur">
                      {localUserData.email || "Non renseigné"}
                    </span>
                  </div>
                  <div className="flex flex-row justify-between items-start">
                    <span className="text-sm text-secondary-brown uppercase font-bold">VILLE :</span>
                    <span className="text-sm text-secondary-brown text-right max-w-[60%]" aria-label="Ville utilisateur">
                      {localUserData.city ? capitalizeFirstLetter(localUserData.city) : "Non renseignée"}
                    </span>
                  </div>
                </div>
                {/* Separator */}
                <div className="my-3 w-full">
                  <div className="h-px w-full bg-[rgba(123,78,46,0.2)]" aria-hidden="true"></div>
                </div>
                {/* Footer Section - identique Dogs */}
                <button
                  className="bg-[var(--primary-green)] text-[var(--primary-brown)] font-medium rounded-md w-full py-2 mt-2 hover:bg-[#B7D336] transition"
                  onClick={openProfileModal}
                  type="button"
                  aria-label="Voir le profil utilisateur"
                >
                  Voir le profil
                </button>
              </section>
            </section>
          </>
        )}
        {/* Modale UserProfileModal centrée */}
{isProfileModalOpen && (
  <section
    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label="Modale profil utilisateur"
  >
    <div className="w-full max-w-md mx-auto">
      <UserProfileModal
        user={localUserData}
        onClose={closeProfileModal}
        onEdit={() => {
          closeProfileModal();
          openEditModal();
        }}
      />
    </div>
  </section>
)}
        {/* Modale EditProfileForm centrée */}
        {isEditModalOpen && (
          <section
            className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            aria-label="Modale édition profil utilisateur"
          >
            <div className="rounded-xl p-8 min-w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto edit-profile-form">
              <h2 id="edit-profile-title" className="sr-only">Modifier le profil</h2>
              <EditProfileForm
                userData={localUserData}
                onCancel={closeEditModal}
                onRefresh={refreshUser}
                onSave={handleSave}
              />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
