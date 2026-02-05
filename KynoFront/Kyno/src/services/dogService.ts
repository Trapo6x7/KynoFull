import apiClient from './api';
import { API_CONFIG } from '../config/api';
import { Dog, PaginatedResponse } from '../types';

export interface CreateDogData {
  name: string;
  raceId?: number;
  birthDate?: string;
  description?: string;
  gender?: 'male' | 'female';
  weight?: number;
  size?: string;
  keywords?: string[];
}

export interface UpdateDogData extends Partial<CreateDogData> {}

const dogService = {
  /**
   * Récupérer tous les chiens de l'utilisateur connecté
   */
  getMyDogs: async (): Promise<Dog[]> => {
    const response = await apiClient.get<PaginatedResponse<Dog>>(
      `${API_CONFIG.ENDPOINTS.DOGS}?owner.id=me`
    );
    return response.data['hydra:member'];
  },

  /**
   * Récupérer un chien par son ID
   */
  getDog: async (id: number): Promise<Dog> => {
    const response = await apiClient.get<Dog>(`${API_CONFIG.ENDPOINTS.DOGS}/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau chien
   */
  createDog: async (data: CreateDogData): Promise<Dog> => {
    const payload: Record<string, any> = {
      name: data.name,
      description: data.description,
      gender: data.gender,
      weight: data.weight,
      size: data.size,
    };

    if (data.raceId) {
      // Backend expects race as an array of IRIs (ManyToMany)
      payload.race = [`/api/races/${data.raceId}`];
    }

    if (data.birthDate) {
      // Backend expects 'birthdate' (lowercase d) in ISO date format
      payload.birthdate = data.birthDate;
    }

    if (data.keywords && data.keywords.length > 0) {
      // Backend expects an array of keyword names
      payload.keywords = data.keywords;
    }

    const response = await apiClient.post<Dog>(API_CONFIG.ENDPOINTS.DOGS, payload);
    return response.data;
  },

  /**
   * Mettre à jour un chien
   */
  updateDog: async (id: number, data: UpdateDogData): Promise<Dog> => {
    const payload: Record<string, any> = { ...data };

    if (data.raceId) {
      payload.race = `/api/races/${data.raceId}`;
      delete payload.raceId;
    }

    const response = await apiClient.patch<Dog>(
      `${API_CONFIG.ENDPOINTS.DOGS}/${id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
      }
    );
    return response.data;
  },

  /**
   * Supprimer un chien
   */
  deleteDog: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.DOGS}/${id}`);
  },

  /**
   * Mettre à jour la photo d'un chien
   */
  updateDogImage: async (id: number, imageUri: string): Promise<Dog> => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'dog.jpg',
    } as any);

    const response = await apiClient.post<Dog>(
      `${API_CONFIG.ENDPOINTS.DOGS}/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default dogService;
