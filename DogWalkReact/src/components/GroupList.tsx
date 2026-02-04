import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface GroupListProps {
  groups: Array<{ id: number; name: string; description: string }>; // Adjust type as needed
  onShowDetails: (groupId: number) => void;
  onJoinGroup: (groupId: number) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  onShowDetails,
  onJoinGroup,
}) => {
  const [showAllModal, setShowAllModal] = useState(false);
  const { user } = useAuth();
  // Track pending join requests to disable buttons
  const [pendingRequests, setPendingRequests] = useState<number[]>([]);
  // Search term for filtering groups in modal
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Search term for filtering main list
  const [listSearch, setListSearch] = useState<string>("");
  // Filtered list of user's groups
  const visibleGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(listSearch.toLowerCase())
  );
  const [allGroups, setAllGroups] = useState<
    Array<{ id: number; name: string; role?: string }>
  >([]);

  const fetchAllGroups = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!res.ok) throw new Error("Erreur fetch all groups");
      const data = await res.json();
      const raw = Array.isArray(data.member)
        ? data.member
        : Array.isArray((data as any)["hydra:member"])
        ? (data as any)["hydra:member"]
        : [];
      setAllGroups(
        raw.map((g: any) => {
          const userRole = Array.isArray(g.groupRoles)
            ? g.groupRoles.find((r: any) => r.user?.id === user?.id)?.role
            : undefined;
          return { id: g.id, name: g.name, role: userRole };
        })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const openAllModal = () => {
    if (!allGroups.length) fetchAllGroups();
    setShowAllModal(true);
  };

  const closeAllModal = () => setShowAllModal(false);

  return (
    <section
      className="w-full flex flex-col items-center"
      aria-label="Section liste des groupes"
    >
      <article
        className="bg-[#FBFFEE] rounded-lg shadow-lg md:h-80 w-full mx-auto p-2 md:p-4 flex flex-col justify-between"
        aria-label="Carte liste des groupes"
      >
        {/* Accordion général */}
        {/* Mobile: Accordion général */}
        <div className="block md:hidden w-full">
          <details
            className="w-full max-w-md mx-auto"
            role="region"
            aria-labelledby="group-list-title"
          >
            <summary className="mb-7 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden before:hidden">
              <h2
                id="group-list-title"
                className="text-lg font-bold text-secondary-brown uppercase text-center"
              >
                Mes groupes
              </h2>
            </summary>
            <div className="flex flex-col gap-2 mt-4 max-h-52 overflow-y-auto">
              {visibleGroups.length > 0 ? (
                visibleGroups.map((group) => (
                  <details
                    key={group.id}
                    className="w-full max-w-md mx-auto"
                    aria-label={`Groupe ${group.name}`}
                  >
                    <summary className="flex flex-col items-center gap-2 cursor-pointer select-none px-4 pt-2 pb-0 w-full max-w-md mx-auto">
                      <span className="text-base font-bold text-secondary-brown uppercase text-center w-full">
                        {group.name}
                      </span>
                    </summary>
                    <section
                      className="flex flex-col gap-2 mt-4 px-2 pb-2 uppercase"
                      aria-label={`Détails du groupe ${group.name}`}
                    >
                      <p className="text-sm text-secondary-brown mb-2">
                        {group.description}
                      </p>
                      <button
                        onClick={() => onShowDetails(group.id)}
                        className="bg-[var(--secondary-green)] text-[var(--primary-brown)] w-full rounded px-2 py-1 text-xs font-medium hover:bg-[#B7D336]  transition border-none cursor-pointer"
                        aria-label={`Voir les détails du groupe ${group.name}`}
                        type="button"
                      >
                        Voir détails
                      </button>
                    </section>
                  </details>
                ))
              ) : (
                <p className="text-center text-secondary-brown text-sm">
                  Aucun groupe disponible.
                </p>
              )}
            </div>
            {/* Button to view all groups in mobile accordion */}
            <div className="pt-2 w-full">
              <button
                onClick={openAllModal}
                className="w-full bg-[var(--primary-green)] text-[var(--primary-brown)] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#B7D336] transition border-none cursor-pointer mt-2"
                type="button"
              >
                Voir tous les groupes
              </button>
            </div>
          </details>
        </div>
        {/* Desktop: list expanded */}
        <section
          className="hidden md:flex flex-col gap-2 md:gap-3 w-full mx-auto"
          role="region"
          aria-labelledby="group-list-title-desktop"
          aria-label="Liste des groupes desktop"
        >
          <h2
            id="group-list-title-desktop"
            className="text-xl font-bold text-secondary-brown uppercase text-center mb-7"
          >
            Mes groupes
          </h2>
          {/* Search bar for main list */}
          <div className="w-full mb-2">
            <input
              type="text"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
            />
          </div>
          <div className="flex flex-col gap-2 md:gap-3 max-h-35 overflow-y-auto">
            {visibleGroups.length > 0 ? (
              visibleGroups.map((group) => (
                <article
                  key={group.id}
                  className="flex flex-row items-center py-2 md:py-3 border-b border-[rgba(123,78,46,0.1)] last:border-b-0 gap-4"
                  aria-label={`Groupe ${group.name}`}
                >
                  <h3 className="text-lg font-bold text-secondary-brown w-1/4 min-w-[120px] text-center uppercase">
                    {group.name}
                  </h3>
                  <p className="text-base text-secondary-brown w-1/2 min-w-[120px] justify-center">
                    {group.description}
                  </p>
                  <div className="flex justify-center w-1/4 min-w-[120px]">
                    <button
                      onClick={() => onShowDetails(group.id)}
                      className="bg-[var(--secondary-green)] text-[var(--primary-brown)] rounded px-2 py-1 text-sm font-medium hover:bg-[#B7D336] transition border-none cursor-pointer min-w-[110px]"
                      aria-label={`Voir les détails du groupe ${group.name}`}
                      type="button"
                    >
                      Voir détails
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-center text-secondary-brown text-base">
                Aucun groupe disponible.
              </p>
            )}
          </div>
        </section>
        {/* Button to view all groups */}
        <div className="pb-2 w-full">
          <button
            onClick={openAllModal}
            className="w-full bg-[var(--primary-green)] text-[var(--primary-brown)] rounded-md px-4 hidden lg:block py-2 text-sm font-medium hover:bg-[#B7D336] transition border-none cursor-pointer mt-2"
            type="button"
          >
            Voir tous les groupes
          </button>
        </div>
        {/* Modal with all groups */}
        {showAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-white/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Tous les groupes</h2>
                <button
                  onClick={closeAllModal}
                  aria-label="Fermer modal"
                  className="text-xl"
                >
                  ×
                </button>
              </div>
              <div className="py-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  aria-label="Rechercher tous les groupes"   
                  className="w-full p-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                />
              </div>
              <ul
                className="max-h-60 overflow-y-auto pt-5"
                role="list"
                aria-label="Liste de tous les groupes"
              >
                {allGroups.filter((g) =>
                  g.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length > 0 ? (
                  allGroups
                    .filter((g) =>
                      g.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((g) => {
                      const requested = pendingRequests.includes(g.id);
                      const isMember = !!g.role;
                      // French labels for roles
                      let label: string;
                      if (isMember) {
                        const roleKey = g.role?.toUpperCase();
                        label =
                          roleKey === "CREATOR"
                            ? "Créateur"
                            : roleKey === "MEMBER"
                            ? "Membre"
                            : g.role || "";
                      } else {
                        label = requested ? "Envoyé" : "Rejoindre";
                      }
                      return (
                        <li
                          key={g.id}
                          className="py-2 flex justify-between items-center hover:bg-gray-100"
                        >
                          <span
                            className="cursor-pointer uppercase font-bold text-[var(--primary-brown)]"
                            onClick={() => onShowDetails(g.id)}
                          >
                            {g.name}
                          </span>
                          <button
                            onClick={() => {
                              if (!isMember) {
                                onJoinGroup(g.id);
                                setPendingRequests((prev) => [...prev, g.id]);
                              }
                            }}
                            disabled={isMember || requested}
                            className={`ml-4 rounded px-2 py-1 text-xs font-medium transition cursor-pointer ${
                              isMember
                                ? "!bg-white text-[var(--primary-brown)]"
                                : requested
                                ? "bg-gray-300 text-gray-600"
                                : "bg-[var(--secondary-green)] text-[var(--primary-brown)] hover:bg-[#B7D336]"
                            }`}
                            type="button"
                          >
                            {label}
                          </button>
                        </li>
                      );
                    })
                ) : (
                  <li>Aucun groupe trouvé.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </article>
    </section>
  );
};

export default GroupList;
