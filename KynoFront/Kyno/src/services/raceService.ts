import apiClient from './api';
import { API_CONFIG } from '../config/api';
import { Race, PaginatedResponse } from '../types';

const raceService = {
  /**
   * Récupérer toutes les races de chiens
   */
  getRaces: async (): Promise<Race[]> => {
    const response = await apiClient.get<PaginatedResponse<Race>>(
      `${API_CONFIG.ENDPOINTS.RACES}?itemsPerPage=200`
    );
    // Normalize/guard the response for different API shapes
    const data: any = response.data;
    // Support Hydra (`hydra:member`), alternate JSON-LD (`member`), or a plain array
    if (data && Array.isArray(data['hydra:member'])) {
      return data['hydra:member'];
    }
    if (data && Array.isArray(data['member'])) {
      return data['member'];
    }
    if (Array.isArray(data)) {
      return data as Race[];
    }
    // Fallback empty array to avoid crashes
    return [];
  },

  /**
   * Récupérer une race par son ID
   */
  getRace: async (id: number): Promise<Race> => {
    const response = await apiClient.get<Race>(`${API_CONFIG.ENDPOINTS.RACES}/${id}`);
    return response.data;
  },

  /**
   * Rechercher des races par nom
   */
  searchRaces: async (query: string): Promise<Race[]> => {
    const response = await apiClient.get<PaginatedResponse<Race>>(
      `${API_CONFIG.ENDPOINTS.RACES}?name=${encodeURIComponent(query)}`
    );
    return response.data['hydra:member'];
  },
};

export default raceService;
