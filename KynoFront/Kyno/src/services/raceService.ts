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
    // DEBUG: log the full response in case API Platform returns a different shape
    // (useful when running against different environments)
    // eslint-disable-next-line no-console
    console.log('raceService.getRaces response:', response.data);
    // Support Hydra (`hydra:member`), alternate JSON-LD (`member`), or a plain array
    if (response.data && Array.isArray(response.data['hydra:member'])) {
      return response.data['hydra:member'];
    }
    if (response.data && Array.isArray(response.data['member'])) {
      return response.data['member'];
    }
    if (Array.isArray(response.data)) {
      return response.data as Race[];
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
