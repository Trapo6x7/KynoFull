import type { User } from '../../types';

export interface IUserService {
  /** Récupère la liste de tous les utilisateurs */
  getAllUsers(): Promise<User[]>;

  /** Récupère la liste des professions disponibles */
  getProfessions(): Promise<string[]>;
}
