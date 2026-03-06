import { useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';
import { useAuthRedirect } from './useAuthRedirect';

export function useOnboardingFinish(
  location: { latitude: number; longitude: number } | null,
) {
  const { refreshUser, user: currentUser } = useAuth();
  const { authService, dogService } = useServices();
  const { redirectAfterAuth } = useAuthRedirect();

  return useCallback(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('onboarding');
        const onboarding = stored ? JSON.parse(stored) : {};
        const userId = currentUser?.id;

        if (userId && (onboarding.userDetails || location)) {
          try {
            const updateData: any = {};

            if (onboarding.userDetails) {
              if (onboarding.userDetails.description) updateData.description = onboarding.userDetails.description;
              if (onboarding.userDetails.genre) updateData.gender = onboarding.userDetails.genre;
              if (onboarding.userDetails.profession) updateData.profession = onboarding.userDetails.profession;
            }

            if (onboarding.userKeywords?.length > 0) {
              updateData.keywords = onboarding.userKeywords;
            }

            if (location) {
              try {
                const placemarks = await Location.reverseGeocodeAsync(location);
                const placemark = placemarks?.[0];
                if (placemark) {
                  updateData.city = placemark.city ?? placemark.region ?? placemark.name;
                }
              } catch {}

              updateData.latitude = location.latitude.toString();
              updateData.longitude = location.longitude.toString();
            }

            if (Object.keys(updateData).length > 0) {
              await authService.updateUser(userId, updateData);
            }
          } catch {}
        }

        if (onboarding.userImages?.length > 0) {
          for (const uri of onboarding.userImages) {
            try {
              await authService.updateProfileImage(uri);
            } catch {}
          }
        }

        let createdDog: any = null;
        if (onboarding.pet) {
          try {
            const createData: any = {
              name: onboarding.pet.name,
              description: onboarding.pet.description,
              gender: onboarding.pet.genre,
            };

            if (onboarding.pet.raceId) createData.raceId = onboarding.pet.raceId;
            if (onboarding.pet.taille) createData.size = onboarding.pet.taille;

            if (onboarding.pet.age) {
              const ageNumber = typeof onboarding.pet.age === 'string'
                ? parseInt(onboarding.pet.age, 10)
                : onboarding.pet.age;
              createData.birthDate = `${new Date().getFullYear() - ageNumber}-01-01`;
            }

            if (onboarding.petKeywords?.length > 0) {
              createData.keywords = onboarding.petKeywords;
            }

            createdDog = await dogService.createDog(createData);
          } catch {
            Alert.alert('Erreur', 'Impossible de créer le profil de votre chien. Veuillez réessayer.', [{ text: 'OK' }]);
          }
        }

        if (createdDog && onboarding.petImages?.length > 0) {
          for (const uri of onboarding.petImages) {
            try {
              await dogService.updateDogImage(createdDog.id, uri);
            } catch {}
          }
        }

        await AsyncStorage.removeItem('onboarding');
        await refreshUser();

        try {
          const freshUser = await authService.getMe();
          redirectAfterAuth(freshUser);
        } catch {
          redirectAfterAuth({ isVerified: false, is_complete: false } as any);
        }
      } catch {
        redirectAfterAuth({ isVerified: false, is_complete: false } as any);
      }
    })();
  }, [location, currentUser, authService, dogService, refreshUser, redirectAfterAuth]);
}
