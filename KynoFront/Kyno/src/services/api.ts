import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

// Clé de stockage du token JWT
const TOKEN_KEY = 'dogwalk_jwt_token';
const REFRESH_TOKEN_KEY = 'dogwalk_refresh_token';

// Création de l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('🔑 API Request - Token:', token ? 'EXISTS' : 'MISSING');
    console.log('📍 API Request - URL:', config.url);
    if (token) {
      // show first/last chars to confirm header presence without leaking full token
      const preview = token.length > 12 ? `${token.slice(0,6)}...${token.slice(-6)}` : token;
      console.log('🔐 API Request - Authorization preview:', `Bearer ${preview}`);
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - déconnecter l'utilisateur
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      // TODO: Rediriger vers la page de connexion
    }
    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour le token
export const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};

export default apiClient;
