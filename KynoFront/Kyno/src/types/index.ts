// Types principaux de l'application DogWalk
// Single source of truth — ne pas redéfinir ces interfaces ailleurs

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  /** Alias renvoyé par certains endpoints API */
  name?: string;
  phone?: string;
  /** URL image unique */
  image?: string;
  /** Tableau d'images (certains endpoints) */
  images?: string[];
  /** Date de naissance (format API : snake_case) */
  birthdate?: string;
  roles: string[];
  createdAt: string;
  dogs?: Dog[];
  createdGroups?: Group[];
  // Champs profil/onboarding
  is_complete?: boolean;
  isVerified?: boolean;
  description?: string;
  gender?: string;
  profession?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  keywords?: string[];
}

/**
 * User enrichi avec la distance calculée côté client (Explore).
 * Extend User — compatible LSP.
 */
export interface UserProfile extends User {
  distance?: number;
}

export interface Dog {
  id: number;
  name: string;
  /** Objet race unique (endpoints GET /dogs/:id) */
  race?: Race;
  /** Tableau de races (endpoints liste, ManyToMany backend) */
  races?: Race[];
  /** camelCase côté TS */
  birthDate?: string;
  /** snake_case renvoyé par l'API */
  birthdate?: string;
  /** URL image unique */
  image?: string;
  /** Tableau d'images (certains endpoints) */
  images?: string[];
  description?: string;
  gender?: 'male' | 'female';
  weight?: number;
  size?: string;
  keywords?: string[];
  owner?: User;
}

export interface Race {
  id: number;
  name: string;
  description?: string;
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
  creator: User;
  participants?: User[];
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  image?: string;
  creator: User;
  members?: GroupMember[];
  isPrivate: boolean;
  createdAt: string;
}

export interface GroupMember {
  id: number;
  user: User;
  role: GroupRole;
  joinedAt: string;
}

export interface GroupRole {
  id: number;
  name: string;
  permissions: string[];
}

export interface GroupRequest {
  id: number;
  user: User;
  group: Group;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
}

export interface Review {
  id: number;
  author: User;
  target: User;
  rating: number;
  comment?: string;
  walk?: Walk;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
}

export interface Report {
  id: number;
  reporter: User;
  reported: User;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

// Types pour les requêtes API
export interface PaginatedResponse<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:next'?: string;
    'hydra:previous'?: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  violations?: {
    propertyPath: string;
    message: string;
  }[];
}
