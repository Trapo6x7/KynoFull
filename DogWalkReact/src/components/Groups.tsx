import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import GroupCreateForm from "./GroupCreateForm";
import GroupList from "./GroupList";
import GroupDetailsModal from "./GroupDetailsModal";
import WalkForm from "./WalkForm";

interface Group {
  id: number;
  name: string;
  comment: string;
  mixed: boolean;
  createdAt: string;
  updatedAt: string;
  walks: Array<{ id: number; location: string }>;
  groupRequests?: Array<{
    id: number;
    user?: { id?: number; name?: string; email?: string };
    status?: boolean;
    createdAt?: string;
  }>;
  groupRoles?: Array<{
    id: number;
    user?: { id?: number; name?: string; email?: string };
    role: string;
  }>;
}

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showWalkForm, setShowWalkForm] = useState(false);
  const mixed = true;
  const userId = user?.id;

  const isCreator =
    selectedGroup && Array.isArray(selectedGroup.groupRoles)
      ? selectedGroup.groupRoles.some(
          (role) => (role.role === "CREATOR" || role.role === "creator") && role.user?.id === userId
        )
      : false;

  const isAlreadyMember =
    selectedGroup && Array.isArray(selectedGroup.groupRoles)
      ? selectedGroup.groupRoles.some((role) => role.user?.id === user?.id)
      : false;

  const hasAlreadyRequested =
    selectedGroup && Array.isArray(selectedGroup.groupRequests)
      ? selectedGroup.groupRequests.some(
          (req) => req.user?.id === user?.id
        )
      : false;

  const canRequestJoin = !isAlreadyMember && !hasAlreadyRequested;

  const fetchGroups = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/groups`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/ld+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des groupes");
      }

      const data = await response.json();
      setGroups(data["member"]);
    } catch (error) {
      console.error("Erreur fetch groupes :", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (name: string, description: string) => {
    if (!name || !description) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/groups`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/ld+json",
          },
          body: JSON.stringify({
            name,
            comment: description,
            mixed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la création du groupe");
      }

      const createdGroup = await response.json();

      if (!createdGroup.id) {
        throw new Error("L'identifiant du groupe n’a pas été renvoyé");
      }

      const newGroup = {
        id: createdGroup.id,
        name: createdGroup.name,
        description: createdGroup.comment,
        mixed: createdGroup.mixed,
        comment: createdGroup.comment,
        createdAt: createdGroup.createdAt,
        updatedAt: createdGroup.updatedAt || new Date().toISOString(), // Ensure updatedAt is present
        groupRequests: createdGroup.groupRequests ?? [],
        groupRoles: createdGroup.groupRoles ?? [],
        walks: createdGroup.walks ?? [],
      };

      // Add current user as creator locally so it shows up immediately
      const enhancedGroup = {
        ...newGroup,
        groupRoles: [
          ...(newGroup.groupRoles || []),
          { id: -1, user: { id: userId }, role: 'CREATOR' }
        ],
      };
      setGroups([...groups, enhancedGroup]);
      // Refresh from backend to synchronize data
      fetchGroups();
    } catch (error) {
      console.error(error);
      alert("Impossible de créer le groupe. Réessaie plus tard.");
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/group_requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/ld+json",
          },
          body: JSON.stringify({
            walkGroup: `/api/groups/${groupId}`,
            user: user && user.id ? `/api/users/${user.id}` : undefined
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la demande d'adhésion");
      }

      alert("Demande envoyée avec succès !");
    } catch (error) {
      console.error("Erreur join group :", error);
      alert("Impossible d’envoyer la demande. Réessaie plus tard.");
    }
  };

  const fetchWalks = async (groupId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/groups/${groupId}/walks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des balades");
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleShowDetails = async (groupId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails du groupe");
      }

      const groupData = await response.json();
      const walks = await fetchWalks(groupId);

      setSelectedGroup({
        id: groupData.id,
        name: groupData.name,
        comment: groupData.comment,
        mixed: groupData.mixed,
        createdAt: groupData.createdAt,
        updatedAt: groupData.updatedAt || new Date().toISOString(),
        groupRequests: groupData.groupRequests ?? [],
        groupRoles: Array.isArray(groupData.groupRoles)
          ? groupData.groupRoles.map((role: any, idx: number) => ({
              id: role.id ?? idx, // fallback idx if id missing
              user: role.user,
              role: role.role
            }))
          : [],
        walks: walks ?? [],
      });
    } catch (error) {
      console.error("Erreur récupération détails groupe :", error);
    }
  };
  // Suppression d'un groupe
const handleDeleteGroup = async (groupId: number) => {
  // console.log("handleDeleteGroup appelé avec groupId =", groupId, typeof groupId);
  // if (!window.confirm("Supprimer ce groupe ? Cette action est irréversible.")) return;
  try {
    const url = `${import.meta.env.VITE_API_URL}/api/groups/${groupId}`;
    console.log("URL DELETE :", url);
    const response = await fetch(
      url,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );
    if (!response.ok) throw new Error("Erreur lors de la suppression du groupe");
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setSelectedGroup(null);
    alert("Groupe supprimé !");
  } catch (error) {
    console.error("Erreur suppression groupe :", error);
    alert("Impossible de supprimer le groupe.");
  }
};
  return (
    <>
      <main className="w-full flex flex-col md:flex-row gap-4 box-border mx-auto" role="main" aria-label="Gestion des groupes">
        <section className="flex flex-col md:flex-row w-full gap-2" aria-label="Section gestion des groupes">
          <article className="w-full mb-4 md:mb-0" aria-label="Création de groupe">
            <GroupCreateForm onCreateGroup={handleCreateGroup} />
          </article>
          <article className="w-full" aria-label="Liste des groupes">
            <GroupList
              groups={groups
                .filter((group) =>
                  Array.isArray(group.groupRoles) &&
                  group.groupRoles.some(
                    (role) =>
                      ['CREATOR', 'MEMBER'].includes(role.role?.toUpperCase() || '') &&
                      role.user?.id === user?.id
                  )
                )
                .map((group) => ({
                   id: group.id,
                   name: group.name,
                   description: group.comment || 'Pas de description',
                 }))}
              onShowDetails={handleShowDetails}
              onJoinGroup={handleJoinGroup}
            />
          </article>
        </section>
        {selectedGroup && (isCreator || isAlreadyMember) && (
          <GroupDetailsModal
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            onJoinGroup={handleJoinGroup}
            onCreateWalk={() => setShowWalkForm(true)}
            isCreator={isCreator}
            canRequestJoin={canRequestJoin}
            onDeleteGroup={handleDeleteGroup}
          />
        )}
      </main>
      {showWalkForm && selectedGroup && (
        <WalkForm
          groupId={selectedGroup.id}
          onClose={() => setShowWalkForm(false)}
          onCreated={async () => {
            setShowWalkForm(false);
            await handleShowDetails(selectedGroup.id);
          }}
        />
      )}
    </>
  );
}
