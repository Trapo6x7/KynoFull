import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, type Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as NavigationBar from "expo-navigation-bar";

import Colors from "@/src/constants/colors";
import BottomNav from "@/components/BottomNav";
import TabScreenLayout from "@/src/components/TabScreenLayout";
import { useAuth } from "@/src/context/AuthContext";
import {
  fetchSpots,
  getCachedSpots,
  setCachedSpots,
  fetchMyRatings,
  fetchAvgRatings,
  saveSpotRating,
  type WalkSpot,
} from "@/src/services/spotService";

// ─── Constants ──────────────────────────────────────────────────────────────
const STATUS_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

const DEFAULT_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// ─── Types ───────────────────────────────────────────────────────────────────
type SpotCategory = "Tous" | "Parcs" | "Forêts" | "Bords d'eau" | "Aires dogs";

const CATEGORY_META: Record<
  Exclude<SpotCategory, "Tous">,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  Parcs: { icon: "leaf-outline", color: "#66BB6A" },
  Forêts: { icon: "trail-sign-outline", color: "#8D6E63" },
  "Bords d'eau": { icon: "water-outline", color: "#42A5F5" },
  "Aires dogs": { icon: "paw-outline", color: Colors.buttonText },
};

// ─── Marqueur de spot custom ──────────────────────────────────────────────────
function darkenHex(hex: string, amount = 0.28): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.round(((n >> 16) & 0xff) * (1 - amount));
  const g = Math.round(((n >> 8) & 0xff) * (1 - amount));
  const b = Math.round((n & 0xff) * (1 - amount));
  return `rgb(${r},${g},${b})`;
}

function SpotMarker({
  category,
  size = 30,
  selected = false,
}: {
  category?: Exclude<SpotCategory, "Tous">;
  size?: number;
  selected?: boolean;
}) {
  const baseColor = category
    ? (CATEGORY_META[category]?.color ?? Colors.primary)
    : Colors.primary;
  const bgColor = selected ? darkenHex(baseColor) : baseColor;
  const actualSize = selected ? size * 1.45 : size;
  return (
    <View
      collapsable={false}
      style={{ padding: 3, backgroundColor: "transparent" }}
    >
      <View
        style={[
          styles.spotMarker,
          {
            width: actualSize,
            height: actualSize,
            borderRadius: actualSize / 2,
            backgroundColor: bgColor,
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? "#fff" : "transparent",
          },
        ]}
      >
        <MaterialCommunityIcons
          name="bone"
          size={actualSize * 0.55}
          color={Colors.white}
        />
      </View>
    </View>
  );
}

const FILTERS: SpotCategory[] = [
  "Tous",
  "Parcs",
  "Forêts",
  "Bords d'eau",
  "Aires dogs",
];

// ─── Marqueur utilisateur ────────────────────────────────────────────────────
function UserMarker({ size = 38 }: { size?: number }) {
  return (
    <View
      collapsable={false}
      style={{ padding: 3, backgroundColor: "transparent" }}
    >
      <View
        style={[
          styles.spotMarker,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: Colors.primary,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="paw"
          size={size * 0.55}
          color={Colors.white}
        />
      </View>
    </View>
  );
}

// ─── SpotModal ────────────────────────────────────────────────────
function SpotModal({
  spot,
  onClose,
  userRating,
  avgRating,
  onRate,
}: {
  spot: WalkSpot | null;
  onClose: () => void;
  userRating: number;
  avgRating: number;
  onRate: (stars: number) => void;
}) {
  if (!spot) return null;
  const meta = CATEGORY_META[spot.category];
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      {/* Couche 1 : assombrit */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "rgba(255,255,255,0.35)" },
        ]}
      />
      {/* Couche 2 : teinte rose givrée */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "rgba(240,210,225,0.25)" },
        ]}
      />
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
          {/* Photo */}
          {spot.photoUrl ? (
            <Image
              source={{ uri: spot.photoUrl }}
              style={styles.modalPhoto}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.modalPhoto,
                {
                  backgroundColor: meta.color + "33",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="bone"
                size={48}
                color={meta.color}
              />
            </View>
          )}

          {/* Infos */}
          <View style={styles.modalBody}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: meta.color + "22" },
                ]}
              >
                <Text style={[styles.categoryPillText, { color: meta.color }]}>
                  {spot.category}
                </Text>
              </View>
            </View>
            <Text style={styles.modalName}>{spot.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.grayDark}
              />
              <Text style={styles.infoTextAddress}> {spot.address}</Text>
            </View>
            <View style={[styles.infoRow, { marginTop: 2 }]}>
              <Ionicons name="navigate-outline" size={14} color={Colors.gray} />
              <Text style={styles.infoText}> {spot.distance}</Text>
            </View>

            {/* Moyenne communauté */}
            {avgRating > 0 && (
              <View style={[styles.infoRow, { marginTop: 8, gap: 4 }]}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={14}
                  color={Colors.gray}
                />
                <Text style={[styles.infoText, { color: Colors.gray }]}>
                  Moyenne communauté :
                </Text>
                <MaterialCommunityIcons name="star" size={13} color="#FFC107" />
                <Text style={[styles.infoText, { fontWeight: "600" }]}>
                  {avgRating.toFixed(1)}/5
                </Text>
              </View>
            )}

            {/* Étoiles utilisateur */}
            <Text
              style={[
                styles.ratingLabel,
                { marginTop: avgRating > 0 ? 10 : 0 },
              ]}
            >
              Votre note
            </Text>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => onRate(star)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons
                    name={star <= userRating ? "star" : "star-outline"}
                    size={30}
                    color={
                      star <= userRating ? Colors.primary : Colors.grayLight
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>
            {userRating > 0 && (
              <Text style={{ fontSize: 12, color: Colors.gray, marginTop: 6 }}>
                Vous avez noté ce lieu {userRating}/5
              </Text>
            )}
          </View>

          {/* Fermer */}
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.grayDark} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── SpotCard ─────────────────────────────────────────────────────────────────
function SpotCard({
  spot,
  onPress,
  userRating,
  avgRating,
}: {
  spot: WalkSpot;
  onPress: () => void;
  userRating: number;
  avgRating: number;
}) {
  const meta = CATEGORY_META[spot.category];
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Photo ou icône fallback */}
      {spot.photoUrl ? (
        <Image
          source={{ uri: spot.photoUrl }}
          style={styles.thumb}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: meta.color,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <MaterialCommunityIcons name="bone" size={26} color={Colors.white} />
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {spot.name}
        </Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color={Colors.grayDark} />
          <Text style={styles.infoTextAddress} numberOfLines={1}>
            {" "}
            {spot.address}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={13} color={Colors.gray} />
          <Text style={styles.infoText}> {spot.distance}</Text>
        </View>
        {/* Catégorie + notes */}
        <View style={[styles.infoRow, { marginTop: 4, gap: 5 }]}>
          <Text style={[styles.categoryText, { color: meta.color }]}>
            {spot.category}
          </Text>
          {avgRating > 0 ? (
            <>
              <Text style={{ color: Colors.grayLight }}>·</Text>
              <MaterialCommunityIcons
                name="star"
                size={11}
                color={Colors.primary}
              />
              <Text style={[styles.infoText, { fontWeight: "600" }]}>
                {avgRating.toFixed(1)}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ color: Colors.grayLight }}>·</Text>
              <MaterialCommunityIcons
                name="star"
                size={11}
                color={Colors.grayLight}
              />
              <Text
                style={[
                  styles.infoText,
                  { fontWeight: "600", color: Colors.grayLight },
                ]}
              >
                Non noté
              </Text>
            </>
          )}
          <Text style={{ color: Colors.grayLight }}>·</Text>
          {/* {[1, 2, 3, 4, 5].map((s) => (
            <MaterialCommunityIcons
              key={s}
              name={s <= userRating ? "star-circle" : "star-circle-outline"}
              size={11}
              color={userRating > 0 ? Colors.primary : Colors.grayLight}
            />
          ))}
          {userRating > 0 ? (
            <Text style={styles.infoText}> {userRating}/5</Text>
          ) : (
            <Text style={[styles.infoText, { color: Colors.grayLight }]}>
              {" "}
              Non noté
            </Text>
          )} */}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── MapScreen ───────────────────────────────────────────────────────────────
export default function MapScreen() {
  const { user } = useAuth();
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [fullscreenRegion, setFullscreenRegion] = useState<Region>(DEFAULT_REGION);
  const mapRef = React.useRef<MapView>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SpotCategory>("Tous");
  const [spots, setSpots] = useState<WalkSpot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [spotsError, setSpotsError] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<WalkSpot | null>(null);
  const [ratings, setRatings] = useState<Record<number, number>>({});

  // Reset fullscreen when leaving the tab
  useFocusEffect(
    useCallback(() => {
      return () => {
        setFullscreen(false);
        setSelectedSpot(null);
      };
    }, []),
  );
  const [avgRatings, setAvgRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(Colors.buttonPrimary);
    }
  }, []);

  // Load persisted ratings whenever the authenticated user changes
  useEffect(() => {
    if (!user) {
      setRatings({});
      return;
    }
    fetchMyRatings()
      .then((map) => {
        const numericMap: Record<number, number> = {};
        for (const [k, v] of Object.entries(map)) {
          numericMap[Number(k)] = v;
        }
        setRatings(numericMap);
      })
      .catch(() => {
        // Non-blocking — ratings just won't show until retry
      });
  }, [user?.id]);

  // ─── loadSpots : cache client AsyncStorage → backend si miss ────────────────
  const loadSpots = useCallback(
    async (lat: number, lon: number, force = false) => {
      setSpotsLoading(true);
      setSpotsError(false);
      try {
        if (!force) {
          const cached = await getCachedSpots(lat, lon);
          if (cached) {
            console.log(`[Spots] ${cached.length} spots depuis le cache`);
            setSpots(cached);
            return;
          }
        }

        const data = await fetchSpots(lat, lon);
        console.log(`[Spots] ${data.length} spots reçus du backend`);
        await setCachedSpots(lat, lon, data);
        setSpots(data);
      } catch (e) {
        console.error("[Spots] Erreur fetchSpots:", e);
        setSpotsError(true);
      } finally {
        setSpotsLoading(false);
      }
    },
    [],
  );

  // 1) Obtenir la position, puis charger les spots avec les coordonnées réelles
  useEffect(() => {
    (async () => {
      let lat = DEFAULT_REGION.latitude;
      let lon = DEFAULT_REGION.longitude;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
          setRegion({
            latitude: lat,
            longitude: lon,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        }
      } catch {
        // Exception inattendue → région par défaut
      } finally {
        setLocationReady(true);
        setLocationLoading(false);
        // Pass coordinates directly to avoid stale-closure on region state
        loadSpots(lat, lon);
      }
    })();
  }, [loadSpots]);

  const handleRate = useCallback((osmId: number, stars: number) => {
    setRatings((r) => ({ ...r, [osmId]: stars }));
    saveSpotRating(osmId, stars)
      .then(() => {
        // Refresh the real avg from backend after saving
        fetchAvgRatings([osmId])
          .then((map) => {
            const v = map[String(osmId)];
            if (v !== undefined) {
              setAvgRatings((a) => ({ ...a, [osmId]: v }));
            }
          })
          .catch(() => {});
      })
      .catch((e) => console.error("[Spots] Erreur saveSpotRating:", e));
  }, []);

  // Load community average ratings whenever the spots list changes
  useEffect(() => {
    if (spots.length === 0) return;
    const osmIds = spots.map((s) => s.id);
    fetchAvgRatings(osmIds)
      .then((map) => {
        const numericMap: Record<number, number> = {};
        for (const [k, v] of Object.entries(map)) {
          numericMap[Number(k)] = v;
        }
        setAvgRatings(numericMap);
      })
      .catch(() => {
        // Non-blocking
      });
  }, [spots]);

  const filteredSpots = useMemo(
    () =>
      activeFilter === "Tous"
        ? spots
        : spots.filter((s) => s.category === activeFilter),
    [spots, activeFilter],
  );

  // Marqueurs avec coordonnées réelles issues d'OSM
  const markers = useMemo(
    () =>
      filteredSpots.map((s) => ({
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
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={fullscreenRegion}
          provider={PROVIDER_DEFAULT}
          showsMyLocationButton={false}
          onMapReady={() => {
            mapRef.current?.animateToRegion(fullscreenRegion, 0);
          }}
        >
          {markers.map((m) => (
            <Marker
              key={m.id}
              coordinate={m.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() =>
                setSelectedSpot(
                  filteredSpots.find((s) => s.id === m.id) ?? null,
                )
              }
            >
              <SpotMarker category={m.category} selected={selectedSpot?.id === m.id} />
            </Marker>
          ))}
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <UserMarker size={38} />
          </Marker>
        </MapView>

        {/* Bouton retour */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setFullscreen(false)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

        {/* Filtres flottants */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterFloating}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f && styles.chipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!selectedSpot && <BottomNav activeTab="map" style={styles.navWrapperFloat} />}

        <SpotModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          userRating={selectedSpot ? (ratings[selectedSpot.id] ?? 0) : 0}
          avgRating={selectedSpot ? (avgRatings[selectedSpot.id] ?? 0) : 0}
          onRate={(stars) => selectedSpot && handleRate(selectedSpot.id, stars)}
        />
      </View>
    );
  }

  // ─── Vue normale (header + carte + spots) ────────────────────────────────
  return (
    <TabScreenLayout
      title="Lieux de promenade"
      rightAction={
        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => loadSpots(region.latitude, region.longitude, true)}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={22} color={Colors.grayDark} />
        </TouchableOpacity>
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Petite carte tappable ── */}
        <TouchableOpacity
          style={styles.mapWrapper}
          activeOpacity={0.9}
          onPress={() => {
            setFullscreenRegion(region);
            setFullscreen(true);
          }}
        >
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
              {markers.map((m) => (
                <Marker
                  key={m.id}
                  coordinate={m.coordinate}
                  title={m.name}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <SpotMarker category={m.category} size={26} />
                </Marker>
              ))}
              <Marker
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                zIndex={999}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <UserMarker size={32} />
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
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f && styles.chipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* ── Section spots (scroll indépendant) ── */}
      <View style={styles.spotsSection}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          {spotsLoading ? (
            <View style={styles.spotsLoader}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.spotsLoaderText}>
                Chargement des spots a 10km autour de vous…
              </Text>
            </View>
          ) : spotsError ? (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadSpots(region.latitude, region.longitude, true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          ) : filteredSpots.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucun spot trouvé dans cette catégorie.
            </Text>
          ) : (
            filteredSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                userRating={ratings[spot.id] ?? 0}
                avgRating={avgRatings[spot.id] ?? 0}
                onPress={() => {
                  setSelectedSpot(spot);
                  setFullscreenRegion({
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                  });
                  setFullscreen(true);
                }}
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
    alignItems: "center",
    justifyContent: "center",
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
    overflow: "hidden",
    marginBottom: 14,
    height: 200,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapPlaceholder: {
    backgroundColor: Colors.grayLight,
    justifyContent: "center",
    alignItems: "center",
  },
  expandHint: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    padding: 4,
  },

  spotMarker: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: Colors.background,
  },

  // ── Filtres
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterFloating: {
    position: "absolute",
    top: STATUS_H + 60,
    left: 0,
    right: 0,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    // borderWidth: 1,
    // borderColor: Colors.grayDark,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.grayDark,
  },
  chipTextActive: {
    color: Colors.white,
  },

  // ── Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.grayDark,
    marginBottom: 12,
  },

  // ── Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    flexShrink: 0,
  },
  cardInfo: { flex: 1, gap: 5 },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: { fontSize: 10, color: Colors.gray },
  infoTextAddress: { fontSize: 12, color: Colors.grayDark },
  dot: { fontSize: 12, color: Colors.grayLight },
  categoryBadge: {
    marginLeft: 8,
    borderRadius: 8,
    // backgroundColor: Colors.primaryLight,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Spots loading / error / empty
  spotsLoader: {
    alignItems: "center",
    paddingVertical: 100,
    gap: 12,
  },
  spotsLoaderText: {
    fontSize: 13,
    color: Colors.gray,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 13,
    color: Colors.gray,
    paddingVertical: 24,
  },

  // ── BottomNav flottante (plein écran)
  navWrapperFloat: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  // ── Boutons plein écran
  backBtn: {
    position: "absolute",
    top: STATUS_H + 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Modale spot
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 4,
    borderColor: Colors.background,
    overflow: "hidden",
    paddingBottom: 32,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  modalPhoto: {
    width: "100%",
    height: 200,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.grayDark,
    marginTop: 20,
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
});
