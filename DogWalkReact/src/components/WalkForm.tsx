import React, { useState, useEffect } from "react";
import LeafletMap from "./LeafletMap";

interface WalkFormProps {
  groupId: number;
  onClose: () => void;
  onCreated?: () => void;
}

const WalkForm: React.FC<WalkFormProps> = ({ groupId, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Géolocalisation automatique au montage
  useEffect(() => {
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
          setLocation(coords);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/walks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/ld+json",
        },
        body: JSON.stringify({
          name,
          location,
          startAt: startAt ? new Date(startAt).toISOString() : undefined,
          walkGroup: `/api/groups/${groupId}`,
        }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création de la balade");
      }
      if (onCreated) onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-white/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          type="button"
          className="absolute top-2 right-2 text-lg font-bold text-primary-brown hover:text-primary-green"
          onClick={onClose}
          aria-label="Fermer le formulaire de création de balade"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-primary-brown">Créer une balade</h2>
        <label className="block mb-2 text-sm font-medium">Nom de la balade
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded px-2 py-1 mt-1" />
        </label>
        <label className="block mb-2 text-sm font-medium">Lieu (lat,long)
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="48.8584,2.2945" required className="w-full border rounded px-2 py-1 mt-1" />
        </label>
        <LeafletMap value={location} onChange={setLocation} height={256} />
        <label className="block mb-4 text-sm font-medium">Date et heure
          <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} required className="w-full border rounded px-2 py-1 mt-1" />
        </label>
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-primary-green text-primary-brown py-2 rounded hover:bg-primary-brown hover:text-white transition-colors" disabled={loading}>
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </div>
  );
};

export default WalkForm;
