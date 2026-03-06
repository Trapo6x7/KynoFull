import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface WalkSpot {
  id: number;
  name: string;
  address: string;
  distance: string;
  distanceRaw: number;
  category: "Parcs" | "Forêts" | "Bords d'eau" | "Aires dogs";
  latitude: number;
  longitude: number;
  photoUrl?: string | null;
  rating?: number | null;
}

// ─── Spots cache ──────────────────────────────────────────────────────────────
const SPOTS_CACHE_PREFIX = "spots_cache_";
const SPOTS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — mirrors backend TTL

interface SpotsCacheEntry {
  data: WalkSpot[];
  ts: number;
}

/** Round lat/lon to 2 decimal places to build a stable cache key (same as backend). */
function cacheKey(lat: number, lon: number): string {
  return `${SPOTS_CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

export async function getCachedSpots(
  lat: number,
  lon: number,
): Promise<WalkSpot[] | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(lat, lon));
    if (!raw) return null;
    const entry: SpotsCacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > SPOTS_CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export async function setCachedSpots(
  lat: number,
  lon: number,
  data: WalkSpot[],
): Promise<void> {
  try {
    const entry: SpotsCacheEntry = { data, ts: Date.now() };
    await AsyncStorage.setItem(cacheKey(lat, lon), JSON.stringify(entry));
  } catch {
    // Storage failure is non-critical — ignore silently.
  }
}

export async function fetchSpots(lat: number, lon: number): Promise<WalkSpot[]> {
  const response = await apiClient.get<WalkSpot[]>("/api/spots", {
    params: { lat, lon },
  });
  return response.data;
}

// ─── Spot ratings ─────────────────────────────────────────────────────────────

/** Returns a map of osmId → rating for the authenticated user. */
export async function fetchMyRatings(): Promise<Record<string, number>> {
  const response = await apiClient.get<Record<string, number>>(
    "/api/spots/ratings",
  );
  return response.data;
}

/** Returns a map of osmId → community average rating for the given osmIds. */
export async function fetchAvgRatings(
  osmIds: number[],
): Promise<Record<string, number>> {
  if (osmIds.length === 0) return {};
  const response = await apiClient.get<Record<string, number>>(
    "/api/spots/avg-ratings",
    { params: { osmIds: osmIds.join(",") } },
  );
  return response.data;
}

/** Persists a rating for an OSM spot to the backend. */
export async function saveSpotRating(
  osmId: number,
  rating: number,
): Promise<void> {
  await apiClient.post("/api/spots/rate", { osmId, rating });
}
