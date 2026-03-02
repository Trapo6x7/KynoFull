/**
 * Calcule la distance haversine entre deux coordonnées GPS.
 * @returns Distance en kilomètres
 */
export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Formate une distance en km en chaîne affichable. */
export const formatDistance = (km: number): string =>
  km < 1 ? '< 1 km' : `${Math.round(km)} km`;
