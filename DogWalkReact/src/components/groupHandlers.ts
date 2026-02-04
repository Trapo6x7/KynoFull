// Handler to accept and create MEMBER role
const API_URL = process.env.VITE_API_URL || '';
export const handleAcceptRequest = async (
  request: any,
  setLocalGroupRequests: Function,
  setLocalGroupRoles: Function
) => {
  try {
    const token = localStorage.getItem("authToken");
    let groupRequestId = request.id;
    if (!groupRequestId && request["@id"]) {
      const match = request["@id"].match(/group_requests\/(\d+)/);
      if (match) groupRequestId = match[1];
    }
    if (!groupRequestId)
      throw new Error("Impossible de déterminer l'id de la demande");
    
    // 1. PATCH la demande (status: true)
    const res = await fetch(
      `${API_URL}/api/group_requests/${groupRequestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          Accept: "application/ld+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: true }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");

    // 2. POST sur groupRole (role: MEMBER)
    const groupIri =
      data.walkGroup || request.walkGroup || request.group || request.groupId;
    const userId = request.user && request.user.id;
    const userIri = userId ? `/api/users/${userId}` : null;
    if (!groupIri || !userIri)
      throw new Error(
        "Impossible de déterminer l'IRI du groupe ou de l'utilisateur pour le groupRole"
      );

    const roleRes = await fetch(
      `${API_URL}/api/group_roles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          walkGroup: groupIri,
          user: userIri,
          role: "MEMBER",
        }),
      }
    );
    if (!roleRes.ok) throw new Error("Erreur lors de la création du groupRole");

    setLocalGroupRequests((prev: any[]) =>
      prev.map((r) => {
        let rId = r.id;
        if (!rId && r["@id"]) {
          const match = r["@id"].match(/group_requests\/(\d+)/);
          if (match) rId = match[1];
        }
        return rId == groupRequestId ? { ...r, status: true } : r;
      })
    );

    if (request.user && userIri) {
      setLocalGroupRoles((prev: any[]) => [
        ...prev,
        {
          id: Math.random(),
          user: request.user,
          role: "MEMBER",
        },
      ]);
    }
  } catch (e) {
    alert("Erreur lors de l’acceptation de la demande.");
  }
};

export const handleRejectRequest = async (
  request: any,
  setLocalGroupRequests: Function
) => {
  try {
    const token = localStorage.getItem("authToken");
    let groupRequestId = request.id;
    if (!groupRequestId && request["@id"]) {
      const match = request["@id"].match(/group_requests\/(\d+)/);
      if (match) groupRequestId = match[1];
    }
    if (!groupRequestId)
      throw new Error("Impossible de déterminer l'id de la demande");
    const res = await fetch(
      `${API_URL}/api/group_requests/${groupRequestId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/ld+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    if (!res.ok) throw new Error("Erreur lors du refus");
    setLocalGroupRequests((prev: any[]) =>
      prev.filter((r) => {
        let rId = r.id;
        if (!rId && r["@id"]) {
          const match = r["@id"].match(/group_requests\/(\d+)/);
          if (match) rId = match[1];
        }
        return rId != groupRequestId;
      })
    );
  } catch (e) {
    alert("Erreur lors du refus de la demande.");
  }
};
