import type { Dog } from '../../types';

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

export interface IDogService {
  /** Récupère les chiens de l'utilisateur connecté */
  getMyDogs(): Promise<Dog[]>;

  /** Récupère un chien par son ID */
  getDog(id: number): Promise<Dog>;

  /** Crée un nouveau chien */
  createDog(data: CreateDogData): Promise<Dog>;

  /** Met à jour les données d'un chien */
  updateDog(id: number, data: UpdateDogData): Promise<Dog>;

  /** Supprime un chien */
  deleteDog(id: number): Promise<void>;

  /** Met à jour la photo d'un chien */
  updateDogImage(dogId: number, imageUri: string): Promise<Dog>;
}
