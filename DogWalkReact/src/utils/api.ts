interface ApiResponse<T> {
  data: T;
  error?: string;
  ok?: boolean; // Ajout de la propriété ok
}

const BASE_URL = import.meta.env.VITE_API_URL // Remplace par l'URL de ton API

// Fonction pour faire une requête POST générique
export const postRequest = async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la requête');
    }

    const data = await response.json();
    return { data, ok: true };
  } catch (error: any) {
    return { data: null as any, error: error.message, ok: false };
  }
};

// Fonction pour faire une requête GET générique
export const getRequest = async <T>(
  endpoint: string,
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/ld+json",
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la requête");
    }

    const data = await response.json();
    return { data, ok: true };
  } catch (error: any) {
    return { data: null as any, error: error.message, ok: false };
  }
};

// Fonction pour faire une requête DELETE générique
export const deleteRequest = async <T>(
  endpoint: string,
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/ld+json",
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la requête");
    }

    // Si la suppression est réussie, on retourne un objet vide ou un statut
    return { data: {} as T, ok: true }; // On retourne un objet vide et ok = true
  } catch (error: any) {
    return { data: null as any, error: error.message, ok: false };
  }
};
