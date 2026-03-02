import type { User } from '../../types';

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
  name?: string;
  description?: string;
  gender?: string;
  profession?: string;
  latitude?: string;
  longitude?: string;
  city?: string;
  keywords?: string[];
}

export interface IAuthService {
  /** Connecte l'utilisateur et retourne ses données */
  login(credentials: LoginCredentials): Promise<User>;

  /** Crée un compte et connecte automatiquement */
  register(data: RegisterData): Promise<User>;

  /** Déconnecte l'utilisateur (token supprimé) */
  logout(): Promise<void>;

  /** Récupère les données de l'utilisateur connecté */
  getMe(): Promise<User>;

  /** Met à jour le mot de passe */
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;

  /** Met à jour les champs de profil */
  updateUser(userId: number, data: UpdateUserData): Promise<User>;

  /** Met à jour la photo de profil */
  updateProfileImage(imageUri: string): Promise<User>;
}
