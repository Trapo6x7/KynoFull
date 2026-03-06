// ─── Types métier partagés ────────────────────────────────────────────────────

export interface Race {
  id: number;
  name: string;
}

export interface Dog {
  id: number;
  name: string;
  gender?: string;
  size?: string;
  description?: string;
  birthdate?: string;
  images?: string[];
  races?: Race[];
  keywords?: string[];
  user?: string;
}

export interface User {
  id: number;
  email?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  gender?: string;
  profession?: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  birthdate?: string;
  isVerified?: boolean;
  is_complete?: boolean;
  score?: number;
  images?: string[];
  city?: string;
  privateMode?: boolean;
  dogs?: Dog[];
  keywords?: string[];
  // Filtres de match (visibles uniquement via /api/me)
  filterGender?: string | null;
  filterDistanceKm?: number | null;
  filterAgeMin?: number | null;
  filterAgeMax?: number | null;
  filterDogGender?: string | null;
  filterDogSize?: string | null;
  filterRace?: Race | null;
}

export interface Walk {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  meetingPoint: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
  status?: string;
  creator?: User;
}

export interface PaginatedResponse<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
  member?: T[];
}
