import { useState, useCallback } from 'react';
import { useServices } from '@/src/context/ServicesContext';
import { useAuth } from '@/src/context/AuthContext';
import { haversineDistance, formatDistance } from './useDistance';
import { API_CONFIG } from '@/src/config/api';
import type { User } from '@/src/types';

// ─── ViewModel de présentation (Explore screen) ───────────────────────────────
export interface MatchViewModel {
  id: number;
  name: string;
  userAge?: number;
  dogName: string;
  dogBreed?: string;
  dogAge?: string;
  distance: string;
  mainImage: string;
  dogMainImage: string;
  additionalImages: string[];
  dogAdditionalImages: string[];
  totalImages: number;
  dogTotalImages: number;
  /** Images brutes pour la modal match */
  rawImages: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PLACEHOLDER = 'https://via.placeholder.com/400';

const toImageUrl = (filename: string): string =>
  `${API_CONFIG.BASE_URL}/uploads/images/${filename}`;

const toMatchViewModel = (u: User, currentUser: User | null): MatchViewModel => {
  let distance = '? km';
  if (currentUser?.latitude && currentUser?.longitude && u.latitude && u.longitude) {
    const km = haversineDistance(
      parseFloat(currentUser.latitude),
      parseFloat(currentUser.longitude),
      parseFloat(u.latitude),
      parseFloat(u.longitude),
    );
    distance = formatDistance(km);
  }

  const dog = u.dogs?.[0];
  const dogAge = dog?.birthdate
    ? `${new Date().getFullYear() - new Date(dog.birthdate).getFullYear()}`
    : undefined;
  const userAge = u.birthdate
    ? new Date().getFullYear() - new Date(u.birthdate).getFullYear()
    : undefined;

  const userImages = u.images ?? [];
  const dogImages = dog?.images ?? [];

  return {
    id: u.id,
    name: u.name ?? u.firstName ?? 'Utilisateur',
    userAge,
    dogName: dog?.name ?? 'Chien',
    dogBreed: dog?.races?.[0]?.name ?? dog?.race?.name,
    dogAge,
    distance,
    mainImage: userImages[0] ? toImageUrl(userImages[0]) : PLACEHOLDER,
    dogMainImage: dogImages[0] ? toImageUrl(dogImages[0]) : PLACEHOLDER,
    additionalImages: userImages.slice(1).map(toImageUrl),
    dogAdditionalImages: dogImages.slice(1).map(toImageUrl),
    totalImages: userImages.length,
    dogTotalImages: dogImages.length,
    rawImages: userImages,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useMatches = () => {
  const { userService, matchService } = useServices();
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch en parallèle — Promise.all avec fallback sur les ids vus
      const [allUsers, seenIds] = await Promise.all([
        userService.getAllUsers(),
        matchService.getSeenUserIds().catch(() => [] as number[]),
      ]);

      const seenSet = new Set(seenIds.map(Number));
      const candidates = allUsers
        .filter((u) => u.id !== user?.id && !seenSet.has(u.id))
        .map((u) => toMatchViewModel(u, user));

      setMatches(candidates);
    } catch {
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, userService, matchService]);

  return { matches, isLoading, loadMatches };
};
