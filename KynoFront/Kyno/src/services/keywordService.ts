import apiClient from './api';
import { API_CONFIG } from '../config/api';

export interface Keyword {
  id: number;
  name: string;
  category: 'user' | 'dog' | 'activity';
}

const keywordService = {
  /**
   * Récupérer tous les mots-clés
   */
  getAllKeywords: async (): Promise<Keyword[]> => {
    const response = await apiClient.get<{ 'hydra:member'?: Keyword[], 'member'?: Keyword[] }>(
      `${API_CONFIG.ENDPOINTS.KEYWORDS}?itemsPerPage=200`
    );
    return response.data['hydra:member'] || response.data['member'] || [];
  },

  /**
   * Récupérer les mots-clés par catégorie
   */
  getKeywordsByCategory: async (category: 'user' | 'dog' | 'activity'): Promise<Keyword[]> => {
    const url = `${API_CONFIG.ENDPOINTS.KEYWORDS}?category=${category}&itemsPerPage=200`;
    // Fetching keywords from url
    const response = await apiClient.get<{ 'hydra:member'?: Keyword[], 'member'?: Keyword[] }>(url);
    
    // API Platform peut retourner soit 'hydra:member' soit 'member'
    const keywords = response.data['hydra:member'] || response.data['member'] || [];
    // Keywords found count available
    
    return keywords;
  },
};

export default keywordService;
