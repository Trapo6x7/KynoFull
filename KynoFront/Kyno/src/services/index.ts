// Export de tous les services
export { default as apiClient, setToken, getToken, removeToken, isAuthenticated } from './api';
export { default as authService } from './authService';
export { default as dogService } from './dogService';
export { default as walkService } from './walkService';
export { default as raceService } from './raceService';

// Export des types des services
export type { LoginCredentials, RegisterData, AuthResponse } from './authService';
export type { CreateDogData, UpdateDogData } from './dogService';
export type { CreateWalkData, UpdateWalkData, WalkFilters } from './walkService';
