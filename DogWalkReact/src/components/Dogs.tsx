import { Button } from "./ui/button";
import { deleteRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import AddDogs from "./AddDogs";

function capitalizeFirstLetter(str?: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function Dogs() {
  const { user, refreshUser, token } = useAuth();
  const [allRaces, setAllRaces] = useState<{ id: number; name: string }[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/races`)
      .then((res) => res.json())
      .then((data) => {
        setAllRaces(data.member || []);
      });
  }, []);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const handleDeleteDog = async (dogId: string) => {
    const dog = user?.dogs.find((d) => d.id.toString() === dogId);
    if (!dog) {
      console.error("Le chien n'a pas été trouvé.");
      return;
    }

    const isUserOwner = dog.user === "/api/me";
    if (!isUserOwner) {
      console.error("Vous ne pouvez supprimer que vos propres chiens.");
      return;
    }

    try {
      const response = await deleteRequest(`/api/dogs/${dogId}`, {
        Authorization: `Bearer ${token}`,
      });

      if (response.ok) {
        refreshUser();
      } else {
        console.error(
          "Erreur lors de la suppression du chien :",
          response.error
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDogImageUpload = async (dogId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dogs/${dogId}/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        refreshUser();
        alert("Photo du chien mise à jour !");
      } else {
        console.error("Erreur lors de la mise à jour de l'image du chien");
        alert("Échec de la mise à jour.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue.");
    }
  };

  return (
    <section className="w-full flex flex-col items-center mx-6 mb-8" aria-label="Section chiens utilisateur">
      {/* Mobile Accordion Layout (identique à Me) */}
      <div className="block md:hidden w-full">
        <div className="bg-[#FBFFEE] rounded-xl w-full flex flex-col shadow-lg p-0 gap-0">
          <details className="w-full" aria-label="Liste des chiens utilisateur">
            <summary className="flex flex-col justify-center items-center cursor-pointer select-none px-2 py-4 w-full">
              <div className="flex items-center justify-center gap-6 w-full">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    <img
                      src="/logoronddogwalk2.png"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-secondary-brown uppercase leading-none mt-2" id="dogs-title-mobile">MES CHIENS</h2>
                <span className="text-sm text-secondary-brown mb-2" style={{ minWidth: '2.5rem' }}></span>
              </div>
            </summary>
            <div className="mt-4 flex flex-col gap-2 px-4 pb-4 w-full" role="region" aria-labelledby="dogs-title-mobile">
              <div className="w-full rounded-lg p-4 flex flex-col gap-4 max-h-[120px] overflow-y-auto">
                {user?.dogs && user.dogs.length > 0 ? (
                  user.dogs.map((dog) => (
                    <article
                      key={dog.id}
                      className="flex items-center gap-4 border-b border-[rgba(123,78,46,0.1)] pb-2 last:border-b-0 last:pb-0"
                      role="group"
                      aria-label={`Chien ${dog.name}`}
                    >
                      <div className="relative w-12 h-12">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/images/${dog.imageFilename}`}
                            alt={`Photo de ${dog.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          className="absolute bottom-0 right-0 p-0.5 text-xs rounded-full bg-[var(--primary-green)] text-white min-w-0 leading-none w-4 h-4"
                          aria-label={`Changer la photo de ${dog.name}`}
                          onClick={() =>
                            document
                              .getElementById(`upload-photo-${dog.id}`)
                              ?.click()
                          }
                        >
                          +
                        </Button>
                        <input
                          type="file"
                          id={`upload-photo-${dog.id}`}
                          className="hidden"
                          accept="image/*"
                          aria-label={`Téléverser une nouvelle photo pour ${dog.name}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleDogImageUpload(dog.id.toString(), file);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-secondary-brown text-lg truncate" aria-label={`Nom du chien : ${dog.name}`}>{capitalizeFirstLetter(String(dog.name))}</span>
                        <span className="text-xs text-secondary-brown truncate" aria-label={`Race du chien : ${(() => {
                          if (!allRaces.length) return 'Chargement…';
                          if (!dog.race || (Array.isArray(dog.race) && dog.race.length === 0)) return 'Aucune race';
                          const races = (Array.isArray(dog.race) ? dog.race : [dog.race])
                            .map((raceIri: string) => {
                              const raceId = raceIri.split("/").pop();
                              const raceObj = allRaces.find((r) => r.id.toString() === raceId);
                              return raceObj ? raceObj.name : "Race inconnue";
                            })
                            .join(", ");
                          return races;
                        })()}`}> 
                          {!allRaces.length
                            ? "Chargement…"
                            : dog.race &&
                              (Array.isArray(dog.race)
                                ? dog.race.length > 0
                                : !!dog.race)
                            ? (Array.isArray(dog.race) ? dog.race : [dog.race])
                                .map((raceIri: string) => {
                                  const raceId = raceIri.split("/").pop();
                                  const raceObj = allRaces.find(
                                    (r) => r.id.toString() === raceId
                                  );
                                  return raceObj ? raceObj.name : "Race inconnue";
                                })
                                .join(", ")
                            : "Aucune race"}
                        </span>
                      </div>
                      <Button
                        className="text-xs text-[#e53e3e] bg-transparent px-2 py-1"
                        onClick={() => handleDeleteDog(dog.id.toString())}
                        aria-label={`Supprimer ${dog.name}`}
                      >
                        Supprimer
                      </Button>
                    </article>
                  ))
                ) : (
                  <p className="text-center text-secondary-brown text-sm my-2">
                    Vous n'avez pas encore ajouté de chien.
                  </p>
                )}
              </div>
              <div className="my-3 w-full">
                <div className="h-px w-full bg-[rgba(123,78,46,0.2)]"></div>
              </div>
              <button
                className="bg-[var(--primary-green)] text-[var(--primary-brown)] font-medium rounded-md w-full py-2 mt-2 hover:bg-[#B7D336] transition"
                onClick={openAddModal}
                type="button"
                aria-label="Ajouter un chien"
              >
                Ajouter un chien
              </button>
            </div>
          </details>
        </div>
      </div>
      {/* Desktop Layout (inchangé mais sémantique) */}
      <div className="hidden md:block w-full">
        <section className="bg-[#FBFFEE] rounded-xl w-full flex flex-col shadow-lg p-10 gap-5.5" aria-label="Liste des chiens utilisateur desktop">
          {/* Header Section - aligné Me */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="relative w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white flex-shrink-0">
              <img
                src="/logoronddogwalk2.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-secondary-brown uppercase" id="dogs-title-desktop">Mes chiens</h2>
          </div>
          {/* Liste des chiens - aligné Me */}
          <div className="w-full rounded-lg p-4 flex flex-col gap-4 max-h-[120px] min-h-[115px] overflow-y-auto" role="region" aria-labelledby="dogs-title-desktop">
            {user?.dogs && user.dogs.length > 0 ? (
              user.dogs.map((dog) => (
                <article
                  key={dog.id}
                  className="flex items-center gap-4 border-b border-[rgba(123,78,46,0.1)] pb-2 last:border-b-0 last:pb-0"
                  role="group"
                  aria-label={`Chien ${dog.name}`}
                >
                  <div className="relative w-12 h-12">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/images/${dog.imageFilename}`}
                        alt={`Photo de ${dog.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      className="absolute bottom-0 right-0 p-0.5 text-xs rounded-full bg-[var(--primary-green)] text-white min-w-0 leading-none w-4 h-4"
                      onClick={() =>
                        document
                          .getElementById(`upload-photo-${dog.id}`)
                          ?.click()
                      }
                      aria-label={`Changer la photo de ${dog.name}`}
                    >
                      +
                    </Button>
                    <input
                      type="file"
                      id={`upload-photo-${dog.id}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDogImageUpload(dog.id.toString(), file);
                        }
                      }}
                      aria-label={`Téléverser une nouvelle photo pour ${dog.name}`}
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-secondary-brown text-lg truncate" aria-label={`Nom du chien : ${dog.name}`}>{capitalizeFirstLetter(String(dog.name))}</span>
                    <span className="text-xs text-secondary-brown truncate" aria-label={`Race du chien : ${(() => {
                      if (!allRaces.length) return 'Chargement…';
                      if (!dog.race || (Array.isArray(dog.race) && dog.race.length === 0)) return 'Aucune race';
                      const races = (Array.isArray(dog.race) ? dog.race : [dog.race])
                        .map((raceIri: string) => {
                          const raceId = raceIri.split("/").pop();
                          const raceObj = allRaces.find((r) => r.id.toString() === raceId);
                          return raceObj ? raceObj.name : "Race inconnue";
                        })
                        .join(", ");
                      return races;
                    })()}`}> 
                      {!allRaces.length
                        ? "Chargement…"
                        : dog.race &&
                          (Array.isArray(dog.race)
                            ? dog.race.length > 0
                            : !!dog.race)
                        ? (Array.isArray(dog.race) ? dog.race : [dog.race])
                            .map((raceIri: string) => {
                              const raceId = raceIri.split("/").pop();
                              const raceObj = allRaces.find(
                                (r) => r.id.toString() === raceId
                              );
                              return raceObj ? raceObj.name : "Race inconnue";
                            })
                            .join(", ")
                        : "Aucune race"}
                    </span>
                  </div>
                  <Button
                    className="text-xs text-[#e53e3e] bg-transparent px-2 py-1"
                    onClick={() => handleDeleteDog(dog.id.toString())}
                    aria-label={`Supprimer ${dog.name}`}
                  >
                    Supprimer
                  </Button>
                </article>
              ))
            ) : (
              <p className="text-center text-secondary-brown text-sm my-2">
                Vous n'avez pas encore ajouté de chien.
              </p>
            )}
          </div>
          <div className="my-3 w-full">
            <div className="h-px w-full bg-[rgba(123,78,46,0.2)]"></div>
          </div>
          {/* Footer Section */}
          <button
            className="bg-[var(--primary-green)] text-[var(--primary-brown)] font-medium rounded-md w-full py-2 mt-2 hover:bg-[#B7D336] transition"
            onClick={openAddModal}
            type="button"
            aria-label="Ajouter un chien"
          >
            Ajouter un chien
          </button>
        </section>
      </div>

      {/* Modale AddDogs centrée */}
      {isAddModalOpen && (
        <section
          className="fixed inset-0 flex items-center justify-center z-[1000] bg-neutral-white/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Fenêtre d'ajout de chien"
        >
          <div className="rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <AddDogs onCancel={closeAddModal} onRefresh={refreshUser} />
          </div>
        </section>
      )}
    </section>
  );
}