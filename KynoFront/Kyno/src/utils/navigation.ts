import type { User } from '../types';

// ─── Routes typées ────────────────────────────────────────────────────────────
export type PostAuthRoute =
  | '/(onboarding)/verify-email'
  | '/(onboarding)/your-detail'
  | '/(tabs)/explore';

type UserStatus = 'unverified' | 'incomplete' | 'complete';

// ─── Cartographie statut → route (OCP) ───────────────────────────────────────
// Pour ajouter un nouveau statut : modifier uniquement ROUTE_MAP, pas les screens.
const ROUTE_MAP: Record<UserStatus, PostAuthRoute> = {
  unverified: '/(onboarding)/verify-email',
  incomplete: '/(onboarding)/your-detail',
  complete: '/(tabs)/explore',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUserStatus = (user: User): UserStatus => {
  if (!user.isVerified) return 'unverified';
  if (!user.is_complete) return 'incomplete';
  return 'complete';
};

/**
 * Retourne la route cible après une authentification réussie.
 *
 * @example
 * const route = getPostAuthRoute(loggedInUser);
 * router.replace(route);
 */
export const getPostAuthRoute = (user: User): PostAuthRoute => {
  return ROUTE_MAP[getUserStatus(user)];
};
