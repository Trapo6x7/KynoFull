import apiClient, { setToken, removeToken } from './api';
import { API_CONFIG } from '../config/api';
import type { User, Dog } from '../types';
import type { IAuthService, LoginCredentials, RegisterData, UpdateUserData } from './interfaces/IAuthService';

// Re-export pour compatibilité des imports existants (AuthContext, screens)
export type { LoginCredentials, RegisterData, UpdateUserData };
export type { User, Dog };

export interface AuthResponse {
  token: string;
}

/**
 * Vérifie si le profil utilisateur est complet
 * Un profil est complet s'il a au moins un chien enregistré
 */
export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  return user.dogs !== undefined && user.dogs.length > 0;
};

// Service d'authentification — implémente IAuthService
const authService: IAuthService = {
  /**
   * Connexion de l'utilisateur
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    // LOGIN ATTEMPT
    // Email and endpoint info available
    
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

      // Login response available

      // Stocker le token
      await setToken(response.data.token);

      // Petit délai pour s'assurer que le token est bien sauvegardé
      await new Promise(resolve => setTimeout(resolve, 100));

      // Récupérer les infos de l'utilisateur
      const user = await authService.getMe();
      return user;
    } catch (error: any) {
      // LOGIN ERROR - details available in 'error'
      throw error;
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (data: RegisterData): Promise<User> => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, data);

      // Petit délai avant la connexion automatique
      await new Promise(resolve => setTimeout(resolve, 500));

      // Connexion automatique après inscription
      return await authService.login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      // REGISTER ERROR - details available in 'error'
      throw error;
    }
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  getMe: async (): Promise<User> => {
    // GETME ATTEMPT
    try {
      const response = await apiClient.get<User>(API_CONFIG.ENDPOINTS.ME);
      // GetMe success - response data available
      return response.data;
    } catch (error: any) {
      // GETME ERROR - details available in 'error'
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  logout: async (): Promise<void> => {
    console.log('🚪 LOGOUT - Début de la déconnexion');
    try {
      console.log('📤 LOGOUT - Appel API /api/logout');
      await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
      console.log('✅ LOGOUT - API appelée avec succès');
    } catch (error) {
      console.error('⚠️ LOGOUT - Erreur API (on continue quand même):', error);
    }
    
    console.log('🗑️ LOGOUT - Suppression du token local');
    await removeToken();
    console.log('✅ LOGOUT - Token supprimé, déconnexion terminée');
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
