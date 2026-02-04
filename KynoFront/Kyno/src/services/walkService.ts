import apiClient from './api';
import { API_CONFIG } from '../config/api';
import { Walk, PaginatedResponse } from '../types';

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

const walkService = {
  /**
   * Récupérer toutes les promenades avec filtres optionnels
   */
  getWalks: async (filters?: WalkFilters): Promise<PaginatedResponse<Walk>> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.itemsPerPage) params.append('itemsPerPage', filters.itemsPerPage.toString());
    if (filters?.startDate) params.append('startDate[after]', filters.startDate);
    if (filters?.endDate) params.append('startDate[before]', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.creatorId) params.append('creator.id', filters.creatorId.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_CONFIG.ENDPOINTS.WALKS}?${queryString}`
      : API_CONFIG.ENDPOINTS.WALKS;

    const response = await apiClient.get<PaginatedResponse<Walk>>(url);
    return response.data;
  },

  /**
   * Récupérer une promenade par son ID
   */
  getWalk: async (id: number): Promise<Walk> => {
    const response = await apiClient.get<Walk>(`${API_CONFIG.ENDPOINTS.WALKS}/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle promenade
   */
  createWalk: async (data: CreateWalkData): Promise<Walk> => {
    const response = await apiClient.post<Walk>(API_CONFIG.ENDPOINTS.WALKS, data);
    return response.data;
  },

  /**
   * Mettre à jour une promenade
   */
  updateWalk: async (id: number, data: UpdateWalkData): Promise<Walk> => {
    const response = await apiClient.patch<Walk>(
      `${API_CONFIG.ENDPOINTS.WALKS}/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
      }
    );
    return response.data;
  },

  /**
   * Supprimer une promenade
   */
  deleteWalk: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.WALKS}/${id}`);
  },

  /**
   * Rejoindre une promenade
   */
  joinWalk: async (id: number): Promise<Walk> => {
    const response = await apiClient.post<Walk>(
      `${API_CONFIG.ENDPOINTS.WALKS}/${id}/join`,
      {}
    );
    return response.data;
  },

  /**
   * Quitter une promenade
   */
  leaveWalk: async (id: number): Promise<void> => {
    await apiClient.post(`${API_CONFIG.ENDPOINTS.WALKS}/${id}/leave`, {});
  },

  /**
   * Récupérer les promenades à venir
   */
  getUpcomingWalks: async (limit: number = 10): Promise<Walk[]> => {
    const now = new Date().toISOString();
    const response = await apiClient.get<PaginatedResponse<Walk>>(
      `${API_CONFIG.ENDPOINTS.WALKS}?startDate[after]=${now}&order[startDate]=asc&itemsPerPage=${limit}`
    );
    return response.data['hydra:member'];
  },

  /**
   * Récupérer les promenades de l'utilisateur connecté
   */
  getMyWalks: async (): Promise<Walk[]> => {
    const response = await apiClient.get<PaginatedResponse<Walk>>(
      `${API_CONFIG.ENDPOINTS.WALKS}?creator.id=me`
    );
    return response.data['hydra:member'];
  },
};

export default walkService;
