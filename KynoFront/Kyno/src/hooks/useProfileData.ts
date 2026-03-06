import { useMemo } from 'react';
import { API_CONFIG } from '@/src/config/api';
import type { User } from '@/src/types';

const toImageUrl = (filename: string) =>
  `${API_CONFIG.BASE_URL}/uploads/images/${filename}`;

export function useProfileData(user: User | null, showDog: boolean) {
  return useMemo(() => {
    const dog = user?.dogs?.[0];
    
    const ownerImages = (user?.images ?? []).map(toImageUrl);
    const ownerKeywords = user?.keywords ?? [];
    const ownerName = user?.name ?? user?.firstName ?? 'Mon profil';
    
    const dogImages = (dog?.images ?? []).map(toImageUrl);
    const dogKeywords = dog?.keywords ?? [];
    
    return {
      dog,
      ownerImages,
      ownerKeywords,
      ownerName,
      dogImages,
      dogKeywords,
      currentImages: showDog ? dogImages : ownerImages,
      currentKeywords: showDog ? dogKeywords : ownerKeywords,
      currentName: showDog ? (dog?.name ?? 'Mon chien') : ownerName,
      currentDescription: showDog ? dog?.description : user?.description,
    };
  }, [user, showDog]);
}
