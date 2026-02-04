import { useState, useEffect } from "react";

interface Comment {
  id: number;
  user: { name: string };
  content: string;
  group: string;
}

interface GroupCommentsProps {
  group: { id: number }; // group id or iri
  user: { username: string };
}

export default function GroupComments({ group }: GroupCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les commentaires du backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      `${import.meta.env.VITE_API_URL}/api/comments?group=/api/groups/${
        group.id
      }`
    )
      .then((res) => res.json())
      .then((data) => setComments(data.member || data["hydra:member"] || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [group.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setError(null);
    const commentToSend = {
      content: newComment,
      group: `/api/groups/${group.id}`,
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          ...(localStorage.getItem("authToken") && {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          }),
        },
        body: JSON.stringify(commentToSend),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      const saved = await res.json();
      setComments([...comments, saved]);
      setNewComment("");
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    }
  }
  return (
    <section className="bg-[#FBFFEE] rounded-lg p-2 md:p-4 w-full max-w-md mx-auto flex flex-col h-full box-border" role="region" aria-labelledby="group-comments-title">
      <header>
        <h3 id="group-comments-title" className="font-bold text-base md:text-lg text-secondary-brown text-center uppercase pb-6 md:mb-4">Commentaires</h3>
      </header>
      <article className="flex-1 overflow-y-auto mb-4 flex flex-col gap-2" aria-label="Liste des commentaires">
        {loading ? (
          <p className="text-gray-400 text-sm text-center" aria-live="polite">Chargement…</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center" aria-live="polite">Aucun commentaire.</p>
        ) : (
          comments.map((c) => (
            <section key={c.id} className="mb-1 bg-[rgba(123,78,46,0.05)] rounded-md p-2" aria-label={`Commentaire de ${c.user.name ?? '?'}`}>
              <span className="font-semibold text-secondary-brown">{c.user.name ?? "?"} :</span>{' '}
              <span className="text-secondary-brown">{c.content}</span>
            </section>
          ))
        )}
        {error && <p className="text-red-600 text-sm text-center" role="alert" aria-live="polite">{error}</p>}
      </article>
      <form
        onSubmit={handleAddComment}
        className="flex gap-2 border-t border-[rgba(123,78,46,0.1)] pt-3"
        aria-label="Ajouter un commentaire"
        role="form"
      >
        <label htmlFor="new-comment" className="sr-only">Votre commentaire</label>
        <input
          id="new-comment"
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Votre commentaire..."
          className="flex-1 border border-[rgba(123,78,46,0.2)] rounded-md p-2 text-sm bg-[rgba(255,255,255,0.8)] outline-none text-secondary-brown focus:ring-2 focus:ring-[var(--primary-green)]"
          aria-required="true"
        />
        <button
          type="submit"
          className="bg-[var(--primary-green)] text-[var(--primary-brown)] px-4 py-2 rounded-md font-medium text-sm min-w-[90px] hover:bg-[#B7D336] transition border-none cursor-pointer"
          aria-label="Envoyer le commentaire"
        >
          Envoyer
        </button>
      </form>
    </section>
  );
}
