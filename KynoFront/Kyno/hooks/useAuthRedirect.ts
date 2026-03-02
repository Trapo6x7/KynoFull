/**
 * useAuthRedirect — OCP / SRP
 * Centralise la logique de redirection post-authentification.
 * Utilise la map de routes de getPostAuthRoute() pour respecter OCP :
 * toute nouvelle règle de navigation s'ajoute dans navigation.ts sans
 * toucher aux consommateurs.
 */
import { useCallback } from 'react';
import { router } from 'expo-router';
import { getPostAuthRoute } from '@/src/utils/navigation';
import type { User } from '@/src/types';

export function useAuthRedirect() {
  /**
   * Redirige l'utilisateur vers la route adaptée à son statut.
   * @param user - L'utilisateur fraîchement récupéré (post-login / post-onboarding).
   */
  const redirectAfterAuth = useCallback((user: User) => {
    const route = getPostAuthRoute(user);
    router.replace(route);
  }, []);

  return { redirectAfterAuth };
}
