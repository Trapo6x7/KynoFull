import apiClient, { setToken, removeToken } from './api';
import { API_CONFIG } from '../config/api';

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthdate: string;
  phone?: string;
}

export interface UpdateUserData {
  description?: string;
  gender?: string;
  profession?: string;
  latitude?: string;
  longitude?: string;
  city?: string;
  keywords?: string[];
}

export interface AuthResponse {
  token: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  image?: string;
  roles: string[];
  createdAt: string;
  dogs?: Dog[];
  is_complete?: boolean;
  isVerified?: boolean; // Statut de vérification de l'email
}

export interface Dog {
  id: number;
  name: string;
  race?: Race;
  birthDate?: string;
  image?: string;
}

export interface Race {
  id: number;
  name: string;
}

/**
 * Vérifie si le profil utilisateur est complet
 * Un profil est complet s'il a au moins un chien enregistré
 */
export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  return user.dogs !== undefined && user.dogs.length > 0;
};

// Service d'authentification
const authService = {
  /**
   * Connexion de l'utilisateur
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', credentials.email);
    console.log('Sending to:', API_CONFIG.ENDPOINTS.LOGIN);
    
    try {
      // Supprimer l'ancien token avant le login
      await removeToken();
      
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        {
          username: credentials.email, // Symfony attend 'username' pour l'email
          password: credentials.password,
        }
      );

      console.log('Login response:', response.data);

      // Stocker le token
      await setToken(response.data.token);
      console.log('Token saved');

      // Petit délai pour s'assurer que le token est bien sauvegardé
      await new Promise(resolve => setTimeout(resolve, 100));

      // Récupérer les infos de l'utilisateur
      const user = await authService.getMe();
      return user;
    } catch (error: any) {
      console.log('=== LOGIN ERROR ===');
      console.log('Error:', JSON.stringify(error, null, 2));
      console.log('Response status:', error.response?.status);
      console.log('Response data:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (data: RegisterData): Promise<User> => {
    await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, data);

    // Connexion automatique après inscription
    return await authService.login({
      email: data.email,
      password: data.password,
    });
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  getMe: async (): Promise<User> => {
    console.log('=== GETME ATTEMPT ===');
    try {
      const response = await apiClient.get<User>(API_CONFIG.ENDPOINTS.ME);
      console.log('GetMe success:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('=== GETME ERROR ===');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  logout: async (): Promise<void> => {
    await removeToken();
  },

  /**
   * Mise à jour du mot de passe
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post(API_CONFIG.ENDPOINTS.USER_UPDATE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Mise à jour des données utilisateur
   */
  updateUser: async (userId: number, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.patch<User>(
      `${API_CONFIG.ENDPOINTS.USERS}/${userId}`,
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
   * Mise à jour de la photo de profil
   */
  updateProfileImage: async (imageUri: string): Promise<User> => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await apiClient.post<User>(
      API_CONFIG.ENDPOINTS.USER_IMAGE,
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

export default authService;
