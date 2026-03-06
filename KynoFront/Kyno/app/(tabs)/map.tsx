import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, type Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";

import Colors from "@/src/constants/colors";
import BottomNav from "@/src/components/BottomNav";
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
import { SpotMarker } from "@/src/components/map/SpotMarker";
import { UserMarker } from "@/src/components/map/UserMarker";
import { SpotModal } from "@/src/components/map/SpotModal";
import { SpotCard } from "@/src/components/map/SpotCard";
import { SpotCategory, FILTERS } from "@/src/components/map/types";

const STATUS_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

const DEFAULT_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

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
  const [avgRatings, setAvgRatings] = useState<Record<number, number>>({});

  useFocusEffect(
    useCallback(() => {
      return () => {
        setFullscreen(false);
        setSelectedSpot(null);
      };
    }, []),
  );

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(Colors.buttonPrimary);
    }
  }, []);

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
      .catch(() => {});
  }, [user?.id]);

  const loadSpots = useCallback(async (lat: number, lon: number, force = false) => {
    setSpotsLoading(true);
    setSpotsError(false);
    try {
      if (!force) {
        const cached = await getCachedSpots(lat, lon);
        if (cached) {
          setSpots(cached);
          return;
        }
      }
      const data = await fetchSpots(lat, lon);
      await setCachedSpots(lat, lon, data);
      setSpots(data);
    } catch (e) {
      console.error("[Spots] Erreur fetchSpots:", e);
      setSpotsError(true);
    } finally {
      setSpotsLoading(false);
    }
  }, []);

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
          setRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.04, longitudeDelta: 0.04 });
        }
      } catch {
        // Default region
      } finally {
        setLocationReady(true);
        setLocationLoading(false);
        loadSpots(lat, lon);
      }
    })();
  }, [loadSpots]);

  const handleRate = useCallback((osmId: number, stars: number) => {
    setRatings((r) => ({ ...r, [osmId]: stars }));
    saveSpotRating(osmId, stars)
      .then(() => {
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
      .catch(() => {});
  }, [spots]);

  const filteredSpots = useMemo(
    () => activeFilter === "Tous" ? spots : spots.filter((s) => s.category === activeFilter),
    [spots, activeFilter],
  );

  const markers = useMemo(
    () => filteredSpots.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      coordinate: { latitude: s.latitude, longitude: s.longitude },
    })),
    [filteredSpots],
  );

  if (fullscreen) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={fullscreenRegion}
          provider={PROVIDER_DEFAULT}
          showsMyLocationButton={false}
          onMapReady={() => { mapRef.current?.animateToRegion(fullscreenRegion, 0); }}
        >
          {markers.map((m) => (
            <Marker
              key={m.id}
              coordinate={m.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => setSelectedSpot(filteredSpots.find((s) => s.id === m.id) ?? null)}
            >
              <SpotMarker category={m.category} selected={selectedSpot?.id === m.id} />
            </Marker>
          ))}
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
            <UserMarker size={38} />
          </Marker>
        </MapView>

        <TouchableOpacity style={styles.backBtn} onPress={() => setFullscreen(false)} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

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
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
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
        <TouchableOpacity
          style={styles.mapWrapper}
          activeOpacity={0.9}
          onPress={() => { setFullscreenRegion(region); setFullscreen(true); }}
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
                <Marker key={m.id} coordinate={m.coordinate} title={m.name} anchor={{ x: 0.5, y: 0.5 }}>
                  <SpotMarker category={m.category} size={26} />
                </Marker>
              ))}
              <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} zIndex={999} anchor={{ x: 0.5, y: 0.5 }}>
                <UserMarker size={32} />
              </Marker>
            </MapView>
          )}
          <View style={styles.expandHint}>
            <Ionicons name="expand-outline" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>

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
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.spotsSection}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
          {spotsLoading ? (
            <View style={styles.spotsLoader}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.spotsLoaderText}>Chargement des spots a 10km autour de vous...</Text>
            </View>
          ) : spotsError ? (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadSpots(region.latitude, region.longitude, true)}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
              <Text style={styles.retryText}>Reessayer</Text>
            </TouchableOpacity>
          ) : filteredSpots.length === 0 ? (
            <Text style={styles.emptyText}>Aucun spot trouve dans cette categorie.</Text>
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

const styles = StyleSheet.create({
  headerRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flexGrow: 0 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  spotsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
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
  navWrapperFloat: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
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
});
