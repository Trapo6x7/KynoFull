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
    return response.data['hydra:member'];
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
