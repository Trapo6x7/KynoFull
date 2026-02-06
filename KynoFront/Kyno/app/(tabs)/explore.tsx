import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
  PanResponder,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/colors";
import { useFocusEffect } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { router } from "expo-router";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import userService from "@/src/services/userService";
import matchService from "@/src/services/matchService";
import { useAuth } from "@/src/context/AuthContext";
import { API_CONFIG } from "@/src/config/api";

const { width, height } = Dimensions.get("window");
const SCREEN_WIDTH = width;
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.55;

interface Match {
  id: number;
  type: "user" | "dog";
  name: string;
  userAge?: number;
  dogName?: string;
  dogBreed?: string;
  dogAge?: string;
  distance: string;
  mainImage: string;
  dogMainImage?: string;
  additionalImages: string[];
  dogAdditionalImages: string[];
  totalImages: number;
  dogTotalImages: number;
  rawUser?: any;
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDogInfo, setShowDogInfo] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Match | null>(null);
  const radarRotation = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const matchScale = useRef(new Animated.Value(0)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === "android") {
        NavigationBar.setVisibilityAsync("hidden");
      }
      return () => {
        if (Platform.OS === "android") {
          NavigationBar.setVisibilityAsync("visible");
        }
      };
    }, []),
  );

  useEffect(() => {
    // Simuler le chargement des données au démarrage
    setTimeout(() => {
      loadMatches();
    }, 2000);
  }, []);

  useEffect(() => {
    // Animation du radar qui tourne quand isLoading est true
    if (isLoading) {
      radarRotation.setValue(0);
      const animation = Animated.loop(
        Animated.timing(radarRotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isLoading]);

  const loadMatches = async () => {
    console.log("DEBUG - ExploreScreen loadMatches - connected user:", user);
    console.log(
      "DEBUG - ExploreScreen loadMatches - calling userService.getAllUsers & matchService.getSeenUserIds",
    );
    try {
      const users = await userService.getAllUsers();
      console.log(
        "DEBUG - getAllUsers returned users count:",
        Array.isArray(users) ? users.length : typeof users,
      );

      // Récupérer les IDs déjà vus (peut échouer si aucune interaction)
      let seenTargetIds = new Set<number>();
      try {
        const seenIds = await matchService.getSeenUserIds();
        seenTargetIds = new Set<number>(
          Array.isArray(seenIds) ? seenIds.map((n: any) => Number(n)) : [],
        );
        console.log(
          "DEBUG - seenTargetIds (from API):",
          Array.from(seenTargetIds),
        );
      } catch (error: any) {
        console.log(
          "DEBUG - Aucune interaction précédente (normal pour nouveau user)",
        );
      }

      // filter out current user and already seen targets
      const otherUsers = users.filter(
        (u: any) => u.id !== user?.id && !seenTargetIds.has(u.id),
      );
      console.log(
        "DEBUG - otherUsers length after filtering seen:",
        otherUsers.length,
      );

      const formattedMatches: Match[] = otherUsers.map((u) => {
        let distance = "? km";
        if (user?.latitude && user?.longitude && u.latitude && u.longitude) {
          const dist = calculateDistance(
            parseFloat(user.latitude),
            parseFloat(user.longitude),
            parseFloat(u.latitude),
            parseFloat(u.longitude),
          );
          distance = dist < 1 ? "1 km" : `${Math.round(dist)} km`;
        }

        const dog = u.dogs?.[0];
        console.log("DEBUG - User:", u.name, "Dog data:", dog);
        const dogAge = dog?.birthdate
          ? `${new Date().getFullYear() - new Date(dog.birthdate).getFullYear()}`
          : undefined;
        const userAge = u.birthdate
          ? new Date().getFullYear() - new Date(u.birthdate).getFullYear()
          : undefined;
        console.log(
          "DEBUG - User birthdate:",
          u.birthdate,
          "Calculated age:",
          userAge,
        );

        const userImages = u.images || [];
        const dogImages = dog?.images || [];
        console.log("DEBUG - Dog images:", dogImages);

        return {
          id: u.id,
          type: "user",
          name: u.name || "Utilisateur",
          userAge,
          dogName: dog?.name || "Chien",
          dogBreed: dog?.races?.[0]?.name || dog?.race?.name,
          dogAge,
          distance,
          mainImage: userImages[0]
            ? `${API_CONFIG.BASE_URL}/uploads/images/${userImages[0]}`
            : "https://via.placeholder.com/400",
          dogMainImage: dogImages[0]
            ? `${API_CONFIG.BASE_URL}/uploads/images/${dogImages[0]}`
            : "https://via.placeholder.com/400",
          additionalImages: userImages
            .slice(1)
            .map(
              (img: string) => `${API_CONFIG.BASE_URL}/uploads/images/${img}`,
            ),
          dogAdditionalImages: dogImages
            .slice(1)
            .map(
              (img: string) => `${API_CONFIG.BASE_URL}/uploads/images/${img}`,
            ),
          totalImages: userImages.length,
          dogTotalImages: dogImages.length,
          rawUser: u,
        };
      });

      setMatches(formattedMatches);
      setCurrentIndex(0);
    } catch (error) {
      console.error("❌ Erreur chargement users:", error);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const spin = radarRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
          rotate.setValue(gesture.dx / 10);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 120) {
            swipeRight();
          } else if (gesture.dx < -120) {
            swipeLeft();
          } else {
            Animated.parallel([
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
              }),
              Animated.spring(rotate, { toValue: 0, useNativeDriver: false }),
            ]).start();
          }
        },
      }),
    [matches, currentIndex],
  );

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    rotate.setValue(0);
  };

  const nextCard = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetCard();
    } else {
      // Fin de la liste - recharger
      setCurrentIndex(0);
      setIsLoading(true);
      resetCard();
      setTimeout(() => loadMatches(), 1500);
    }
  };

  const swipeLeft = () => {
    const targetUserId = matches[currentIndex]?.id;
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, {
        toValue: -20,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      nextCard();
      if (targetUserId) {
        console.log("SWIPE: sending dislike for", targetUserId);
        matchService
          .recordDislike(targetUserId, user?.id)
          .catch((error) => console.error("❌ Erreur dislike:", error));
      }
    });
  };

  const swipeRight = () => {
    const targetUserId = matches[currentIndex]?.id;
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: SCREEN_WIDTH + 100, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, {
        toValue: 20,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      nextCard();
      if (targetUserId) {
        console.log("SWIPE: sending like for", targetUserId);
        matchService
          .recordLike(targetUserId, user?.id)
          .then(({ isMatch }) => {
            if (isMatch) {
              setMatchedUser(matches[currentIndex]);
              setShowMatchModal(true);
              Animated.parallel([
                Animated.spring(matchScale, {
                  toValue: 1,
                  useNativeDriver: true,
                  friction: 8,
                }),
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(heartPulse, {
                      toValue: 1.3,
                      duration: 400,
                      useNativeDriver: true,
                    }),
                    Animated.timing(heartPulse, {
                      toValue: 1,
                      duration: 400,
                      useNativeDriver: true,
                    }),
                  ]),
                ),
              ]).start();
            }
          })
          .catch((error) => console.error("❌ Erreur like:", error));
      }
    });
  };

  const handlePass = () => swipeLeft();
  const handleLike = () => swipeRight();
  const handleRefresh = () => {
    setIsLoading(true);
    loadMatches();
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageHeader
          onPressRight={handleSettings}
          rightIconColor={Colors.primary}
        />

        <View style={styles.loadingContainer}>
          <Animated.Image
            source={require("@/assets/images/Radar.png")}
            style={[styles.radarImage, { transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
          <Image
            source={require("@/assets/images/dogillustration2.png")}
            style={styles.loadingDog}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>

        <BottomNav activeTab="explore" />
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.container}>
        <PageHeader
          onPressRight={handleSettings}
          rightIconColor={Colors.primary}
        />

        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Image
              source={require("@/assets/images/dogillustration2.png")}
              style={styles.emptyDog}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.emptyText}>
            Oups ! Aucun résultat pour le moment{"\n"}Reviens plus tard !
          </Text>
        </View>

        <BottomNav activeTab="explore" />
      </View>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header icons only */}
      <PageHeader onPressRight={handleSettings} />

      <View style={styles.cardContainer}>
        {/* Cards empilées en arrière-plan */}
        {matches
          .slice(currentIndex + 1, currentIndex + 3)
          .reverse()
          .map((match, index) => (
            <View
              key={match.id}
              style={[
                styles.card,
                styles.cardBehind,
                {
                  transform: [
                    { scale: 1 - (index + 1) * 0.05 },
                    { translateY: -(index + 1) * 10 },
                  ],
                  opacity: 1 - (index + 1) * 0.3,
                },
              ]}
            >
              <View style={styles.profileHeader}>
                <Image
                  source={{ uri: match.mainImage }}
                  style={styles.profileImage}
                />
                <View>
                  <Text style={styles.profileName}>{match.name}</Text>
                  <Text style={styles.profileDistance}>{match.distance}</Text>
                </View>
              </View>
              <Image
                source={{ uri: match.mainImage }}
                style={styles.cardMainImage}
              />
            </View>
          ))}

        {/* Carte principale (swipeable) */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            styles.cardTop,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                {
                  rotate: rotate.interpolate({
                    inputRange: [-20, 0, 20],
                    outputRange: ["-20deg", "0deg", "20deg"],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Profile info top - outside card */}
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: showDogInfo
                  ? currentMatch.dogMainImage
                  : currentMatch.mainImage,
              }}
              style={styles.profileImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {showDogInfo ? currentMatch.dogName : currentMatch.name}
                {!showDogInfo &&
                  currentMatch.userAge &&
                  `, ${currentMatch.userAge}`}
                {showDogInfo &&
                  currentMatch.dogAge &&
                  `, ${currentMatch.dogAge}`}
              </Text>
              <Text style={styles.profileDistance}>
                {showDogInfo && currentMatch.dogBreed
                  ? currentMatch.dogBreed
                  : currentMatch.distance}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowDogInfo(!showDogInfo)}
            >
              <Ionicons
                name="paw-outline"
                size={20}
                color={showDogInfo ? Colors.primary : Colors.gray}
              />
            </TouchableOpacity>
          </View>

          {/* Main image */}
          <Image
            source={{
              uri: showDogInfo
                ? currentMatch.dogMainImage
                : currentMatch.mainImage,
            }}
            style={styles.cardMainImage}
          />

          {/* Overlay info */}
          <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle}>
              {currentMatch.name} &{" "}
              <Text style={styles.cardTitleAccent}>{currentMatch.dogName}</Text>
            </Text>
            <View style={styles.additionalImagesContainer}>
              {(showDogInfo
                ? currentMatch.dogAdditionalImages || []
                : currentMatch.additionalImages || []
              ).map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.additionalImage}
                />
              ))}
              {(showDogInfo
                ? currentMatch.dogTotalImages
                : currentMatch.totalImages) >
                (showDogInfo
                  ? (currentMatch.dogAdditionalImages || []).length
                  : (currentMatch.additionalImages || []).length) +
                  1 && (
                <View
                  style={[styles.additionalImage, styles.additionalImageLast]}
                >
                  <Text style={styles.additionalImageCount}>
                    +
                    {(showDogInfo
                      ? currentMatch.dogTotalImages
                      : currentMatch.totalImages) -
                      (showDogInfo
                        ? (currentMatch.dogAdditionalImages || []).length
                        : (currentMatch.additionalImages || []).length) -
                      1}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePass}>
          <Ionicons name="close" size={32} color={Colors.gray} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleLike}
        >
          <Ionicons name="heart" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={28} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      <BottomNav activeTab="explore" />

      {/* Match Modal */}
      {showMatchModal && matchedUser && (
        <View style={styles.matchModalOverlay}>
          <Animated.View
            style={[styles.matchModal, { transform: [{ scale: matchScale }] }]}
          >
            <Text style={styles.matchTitle}>C'est un match !</Text>
            <View style={styles.matchImagesContainer}>
              <Image
                source={{
                  uri:
                    user && (user as any).images && (user as any).images[0]
                      ? `${API_CONFIG.BASE_URL}/uploads/images/${(user as any).images[0]}`
                      : user && (user as any).image
                        ? `${API_CONFIG.BASE_URL}/uploads/images/${(user as any).image}`
                        : "https://via.placeholder.com/150",
                }}
                style={styles.matchImage}
              />
              <Animated.View style={{ transform: [{ scale: heartPulse }] }}>
                <Ionicons
                  name="heart"
                  size={40}
                  color={Colors.primary}
                  style={styles.matchHeart}
                />
              </Animated.View>
              <Image
                source={{ uri: matchedUser.mainImage }}
                style={styles.matchImage}
              />
            </View>
            <Text style={styles.matchText}>
              Vous et {matchedUser.name} vous êtes dans la même meute !
            </Text>
            <TouchableOpacity
              style={styles.matchButton}
              onPress={() => {
                heartPulse.stopAnimation();
                heartPulse.setValue(1);
                matchScale.setValue(0);
                setShowMatchModal(false);
                setMatchedUser(null);
              }}
            >
              <Text style={styles.matchButtonText}>Continuer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  radarImage: {
    width: 200,
    height: 200,
    position: "absolute",
  },
  loadingDog: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.buttonPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  emptyDog: {
    width: 120,
    height: 120,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 5,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 30,
    backgroundColor: Colors.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: "absolute",
  },
  cardBehind: {
    zIndex: 1,
  },
  cardTop: {
    zIndex: 10,
  },
  cardHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 10,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  profileImage: {
    marginTop: 6,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.grayDark,
  },
  profileDistance: {
    fontSize: 14,
    color: Colors.gray,
  },
  toggleButton: {
    marginTop: 6,
    marginLeft: 6,
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: Colors.grayLight,
    justifyContent: "center",
    alignItems: "center",
  },
  dogInfoContainer: {
    gap: 8,
  },
  dogInfoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 5,
  },
  dogInfoText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "500",
  },
  cardMainImage: {
    width: "100%",
    height: CARD_HEIGHT,
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    paddingBottom: 30,
    backgroundColor: "linear-gradient(transparent, rgba(0, 0, 0, 0.6))",
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 15,
  },
  cardTitleAccent: {
    color: Colors.primary,
  },
  additionalImagesContainer: {
    flexDirection: "row",
    gap: 10,
  },
  additionalImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
  },
  additionalImageLast: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  additionalImageCount: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    paddingBottom: 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: Colors.grayLight,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: Colors.buttonPrimary,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  matchModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  matchModal: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    padding: 40,
    alignItems: "center",
    width: width * 0.85,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.grayDark,
    marginBottom: 30,
  },
  matchImagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 30,
  },
  matchImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  matchHeart: {
    marginHorizontal: 10,
  },
  matchText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 30,
  },
  matchButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  matchButtonText: {
    color: Colors.grayDark,
    fontSize: 16,
    fontWeight: "600",
  },
});
