import type { Walk, PaginatedResponse } from '../../types';

export interface CreateWalkData {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  meetingPoint: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
}

export interface UpdateWalkData extends Partial<CreateWalkData> {}

export interface WalkFilters {
  page?: number;
  itemsPerPage?: number;
  startDate?: string;
  endDate?: string;
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  creatorId?: number;
}

export interface IWalkService {
  /** Récupère les promenades avec filtres optionnels */
  getWalks(filters?: WalkFilters): Promise<PaginatedResponse<Walk>>;

  /** Récupère une promenade par son ID */
  getWalk(id: number): Promise<Walk>;

  /** Crée une nouvelle promenade */
  createWalk(data: CreateWalkData): Promise<Walk>;

  /** Met à jour une promenade */
  updateWalk(id: number, data: UpdateWalkData): Promise<Walk>;

  /** Supprime une promenade */
  deleteWalk(id: number): Promise<void>;

  /** Rejoindre une promenade */
  joinWalk(id: number): Promise<Walk>;

  /** Quitter une promenade */
  leaveWalk(id: number): Promise<void>;

  /** Récupère les promenades à venir */
  getUpcomingWalks(limit?: number): Promise<Walk[]>;

  /** Récupère les promenades de l'utilisateur connecté */
  getMyWalks(): Promise<Walk[]>;
}
