import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';

import Colors from '@/src/constants/colors';
import BottomNav from '@/components/BottomNav';
import TabScreenLayout from '@/src/components/TabScreenLayout';

// ─── Constants ──────────────────────────────────────────────────────────────
const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
const SEARCH_RADIUS_M = 2000; // 2 km — rayon réduit pour éviter les timeouts Overpass

// Plusieurs endpoints Overpass en fallback (le public est souvent surchargé)
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const DEFAULT_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// ─── Types ───────────────────────────────────────────────────────────────────
type SpotCategory = 'Tous' | 'Parcs' | 'Forêts' | 'Bords d\'eau' | 'Aires dogs';

interface WalkSpot {
  id: number;
  name: string;
  address: string;
  distance: string;
  distanceRaw: number; // en mètres, pour tri
  category: Exclude<SpotCategory, 'Tous'>;
  latitude: number;
  longitude: number;
}

// ─── Haversine ────────────────────────────────────────────────────────────────
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

// ─── Overpass OSM ─────────────────────────────────────────────────────────────

/**
 * Mots-clés à exclure côté client.
 * Fontaines, bassins décoratifs, équipements urbains ponctuels.
 */
const NAME_BLACKLIST = [
  'fontaine', 'fountain', 'jet d\'eau', 'piscine', 'lavoir',
  'bouche d\'égout', 'bac à sable', 'aire de jeux', 'place', 'espace'
];

/**
 * Tags OSM à exclure même si le nom est "propre".
 * Évite les réservoirs techniques, fossés, mares artificielles.
 */
const TAG_BLACKLIST: Array<{ key: string; value: string }> = [
  { key: 'waterway', value: 'ditch' },
  { key: 'waterway', value: 'drain' },
  { key: 'waterway', value: 'stream' },  // ruisseaux trop petits
  { key: 'man_made', value: 'reservoir_covered' },
  { key: 'landuse',  value: 'reservoir' },
  { key: 'leisure',  value: 'swimming_pool' },
  { key: 'leisure',  value: 'playground' },
];

async function fetchSpotsFromOSM(
  lat: number,
  lon: number,
  radiusM: number,
): Promise<WalkSpot[]> {
  const r = radiusM;
  const parts = [
    `way["leisure"~"park|garden|nature_reserve|dog_park"](around:${r},${lat},${lon});`,
    `way["landuse"~"forest|grass"](around:${r},${lat},${lon});`,
    `way["natural"~"wood|water"](around:${r},${lat},${lon});`,
  ].join('\n');

  const query = `[out:json][timeout:30];\n(\n${parts}\n);\nout center qt 30;`;

  let lastError: Error | null = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35_000);
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      console.log(`[OSM] ${json.elements?.length ?? 0} éléments via ${endpoint}`);
      return parseOSMElements(json.elements ?? [], lat, lon);
    } catch (e) {
      clearTimeout(timer);
      console.warn(`[OSM] échec ${endpoint}:`, e);
      lastError = e as Error;
    }
  }
  throw lastError ?? new Error('Tous les endpoints Overpass ont échoué');
}

function parseOSMElements(elements: any[], lat: number, lon: number): WalkSpot[] {
  const seen = new Set<string>();
  const spots: WalkSpot[] = [];

  for (const el of elements) {
    const elLat: number = el.lat ?? el.center?.lat;
    const elLon: number = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) continue;

    const rawName: string = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['official_name'] || '';
    if (!rawName) continue;

    const nameLower = rawName.toLowerCase().trim();

    if (NAME_BLACKLIST.some(b => nameLower.includes(b))) continue;
    if (TAG_BLACKLIST.some(({ key, value }) => el.tags?.[key] === value)) continue;
    if (seen.has(nameLower)) continue;
    seen.add(nameLower);

    let category: Exclude<SpotCategory, 'Tous'> = 'Parcs';
    if (el.tags?.leisure === 'dog_park') {
      category = 'Aires dogs';
    } else if (
      el.tags?.leisure === 'nature_reserve' ||
      el.tags?.landuse === 'forest' ||
      el.tags?.natural === 'wood'
    ) {
      category = 'Forêts';
    } else if (
      el.tags?.natural === 'water' ||
      el.tags?.waterway === 'river' ||
      el.tags?.waterway === 'canal'
    ) {
      category = "Bords d'eau";
    }

    const distM = haversineM(lat, lon, elLat, elLon);
    const city: string = el.tags?.['addr:city'] || el.tags?.['addr:suburb'] || el.tags?.['addr:district'] || '';

    spots.push({
      id: el.id,
      name: rawName,
      address: city || 'À proximité',
      distance: formatDistance(distM),
      distanceRaw: distM,
      category,
      latitude: elLat,
      longitude: elLon,
    });
  }

  return spots.sort((a, b) => a.distanceRaw - b.distanceRaw).slice(0, 30);
}

const CATEGORY_META: Record<Exclude<SpotCategory, 'Tous'>, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  'Parcs':         { icon: 'leaf-outline',       color: '#66BB6A' },
  'Forêts':        { icon: 'trail-sign-outline',  color: '#8D6E63' },
  "Bords d'eau":   { icon: 'water-outline',       color: '#42A5F5' },
  'Aires dogs':    { icon: 'paw-outline',         color: Colors.buttonText },
};

// ─── Marqueur de spot custom ──────────────────────────────────────────────────
function SpotMarker({ category, size = 30 }: { category: Exclude<SpotCategory, 'Tous'>; size?: number }) {
  const meta = CATEGORY_META[category];
  return (
    <View style={[
      styles.spotMarker,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: meta.color },
    ]}>
      <Ionicons name={meta.icon} size={size * 0.45} color={Colors.white} />
    </View>
  );
}

const FILTERS: SpotCategory[] = ['Tous', 'Parcs', 'Forêts', 'Bords d\'eau', 'Aires dogs'];

// ─── SpotCard ─────────────────────────────────────────────────────────────────
function SpotCard({ spot, onPress }: { spot: WalkSpot; onPress: () => void }) {
  const meta = CATEGORY_META[spot.category];
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.thumb, { backgroundColor: meta.color + '22' }]}>
        <Ionicons name={meta.icon} size={26} color={meta.color} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{spot.name}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color={Colors.gray} />
          <Text style={styles.infoText} numberOfLines={1}> {spot.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={13} color={Colors.gray} />
          <Text style={styles.infoText}> {spot.distance}</Text>
        </View>
      </View>
      <View style={styles.categoryBadge}>
        <Text style={[styles.categoryText, { color: meta.color }]}>{spot.category}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── MapScreen ───────────────────────────────────────────────────────────────
export default function MapScreen() {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [locationReady, setLocationReady] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SpotCategory>('Tous');
  const [spots, setSpots] = useState<WalkSpot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [spotsError, setSpotsError] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(Colors.buttonPrimary);
    }
  }, []);

  // 1) Obtenir la position
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        }
      } catch {
        // Exception inattendue → région par défaut
      } finally {
        setLocationReady(true); // toujours déclencher Overpass, même sans GPS
        setLocationLoading(false);
      }
    })();
  }, []);

  // 2) Dès que la position est prête, interroger Overpass OSM
  const loadSpots = useCallback(async (lat: number, lon: number) => {
    setSpotsLoading(true);
    setSpotsError(false);
    try {
      const data = await fetchSpotsFromOSM(lat, lon, SEARCH_RADIUS_M);
      console.log(`[OSM] ${data.length} spots après filtrage`);
      setSpots(data);
    } catch (e) {
      console.error('[OSM] Erreur fetchSpotsFromOSM:', e);
      setSpotsError(true);
    } finally {
      setSpotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (locationReady) {
      loadSpots(region.latitude, region.longitude);
    }
  }, [locationReady]);

  const filteredSpots = useMemo(
    () => activeFilter === 'Tous' ? spots : spots.filter(s => s.category === activeFilter),
    [spots, activeFilter],
  );

  // Marqueurs avec coordonnées réelles issues d'OSM
  const markers = useMemo(() =>
    filteredSpots.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      coordinate: { latitude: s.latitude, longitude: s.longitude },
    })),
    [filteredSpots],
  );

  // ─── Vue plein écran ──────────────────────────────────────────────────────
  if (fullscreen) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          provider={PROVIDER_DEFAULT}
          showsMyLocationButton={false}
        >
          {markers.map(m => (
            <Marker key={m.id} coordinate={m.coordinate} title={m.name} anchor={{ x: 0.5, y: 0.5 }}>
              <SpotMarker category={m.category} />
            </Marker>
          ))}
          {/* Marqueur position utilisateur */}
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} zIndex={1000} anchor={{ x: 0.5, y: 1 }}>
            <Entypo name="location-pin" size={42} color={Colors.primary} />
          </Marker>
        </MapView>

        {/* Bouton retour */}
        <TouchableOpacity style={styles.backBtn} onPress={() => setFullscreen(false)} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

        {/* Filtres flottants */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterFloating}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <BottomNav
          activeTab="map"
          style={styles.navWrapperFloat}
        />
      </View>
    );
  }

  // ─── Vue normale (header + carte + spots) ────────────────────────────────
  return (
    <TabScreenLayout
      title="Lieux de promenade"
      rightAction={
        <TouchableOpacity style={styles.headerRight} onPress={() => loadSpots(region.latitude, region.longitude)} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      }
    >

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Petite carte tappable ── */}
        <TouchableOpacity style={styles.mapWrapper} activeOpacity={0.9} onPress={() => setFullscreen(true)}>
          {locationLoading ? (
            <View style={[styles.map, styles.mapPlaceholder]}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <MapView
              style={styles.map}
              initialRegion={region}
              provider={PROVIDER_DEFAULT}
              showsMyLocationButton={false}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              pointerEvents="none"
            >
              {markers.map(m => (
                <Marker key={m.id} coordinate={m.coordinate} title={m.name} anchor={{ x: 0.5, y: 0.5 }}>
                  <SpotMarker category={m.category} size={26} />
                </Marker>
              ))}
              {/* Marqueur position utilisateur */}
              <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} zIndex={999} anchor={{ x: 0.5, y: 1 }}>
                <Entypo name="location-pin" size={36} color={Colors.primary} />
              </Marker>
            </MapView>
          )}
          {/* Hint "agrandir" */}
          <View style={styles.expandHint}>
            <Ionicons name="expand-outline" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* ── Filtres par catégorie ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>

      {/* ── Section spots (scroll indépendant) ── */}
      <View style={styles.spotsSection}>
  

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
          {spotsLoading ? (
            <View style={styles.spotsLoader}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.spotsLoaderText}>Chargement des spots près de chez vous…</Text>
            </View>
          ) : spotsError ? (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadSpots(region.latitude, region.longitude)}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          ) : filteredSpots.length === 0 ? (
            <Text style={styles.emptyText}>Aucun spot trouvé dans cette catégorie.</Text>
          ) : (
            filteredSpots.map(spot => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onPress={() => { /* TODO: détail spot + proposition de walk */ }}
              />
            ))
          )}
        </ScrollView>
      </View>

      <BottomNav activeTab="map" style={styles.navWrapperFloat} />
    </TabScreenLayout>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  headerRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── ScrollView (carte + filtres uniquement)
  scroll: { flexGrow: 0 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  // ── Section spots scrollable
  spotsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // ── Petite carte
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    height: 200,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    backgroundColor: Colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandHint: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    padding: 4,
  },

  // ── Marqueur position utilisateur
  userMarkerWrap: {
    padding: 5,
    overflow: 'visible',
  },
  spotMarker: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Filtres
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
    paddingTop: 2,
  },
  filterFloating: {
    position: 'absolute',
    top: STATUS_H + 60,
    left: 0,
    right: 0,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray,
  },
  chipTextActive: {
    color: Colors.white,
  },

  // ── Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.grayDark,
    marginBottom: 12,
  },

  // ── Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.grayDark,
    marginBottom: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 12, color: Colors.gray },
  dot: { fontSize: 12, color: Colors.grayLight },
  categoryBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    // backgroundColor: Colors.primaryLight,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Spots loading / error / empty
  spotsLoader: {
    alignItems: 'center',
    paddingVertical: 100,
    gap: 12,
  },
  spotsLoaderText: {
    fontSize: 13,
    color: Colors.gray,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.gray,
    paddingVertical: 24,
  },

  // ── BottomNav flottante (plein écran)
  navWrapperFloat: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  // ── Boutons plein écran
  backBtn: {
    position: 'absolute',
    top: STATUS_H + 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
