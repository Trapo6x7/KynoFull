// Export de tous les services
export { default as apiClient, setToken, getToken, removeToken, isAuthenticated } from './api';
export { default as authService } from './authService';
export { default as dogService } from './dogService';
export { default as walkService } from './walkService';
export { default as raceService } from './raceService';
export { default as chatService } from './chatService';
export { default as matchService } from './matchService';
export { default as spotService } from './spotService';
export { default as keywordService } from './keywordService';
export { default as userService } from './userService';

// Export des types des services
export type { LoginCredentials, RegisterData, AuthResponse } from './authService';
export type { CreateDogData, UpdateDogData } from './dogService';
export type { CreateWalkData, UpdateWalkData, WalkFilters } from './walkService';
