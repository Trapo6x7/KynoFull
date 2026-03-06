import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/colors";
import { useFocusEffect } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { router, useLocalSearchParams } from "expo-router";
import BottomNav from "@/src/components/BottomNav";
import TabScreenLayout from "@/src/components/TabScreenLayout";
import { MatchCard } from "@/src/components/MatchCard";
import { SwipeActions } from "@/src/components/SwipeActions";
import { MatchModal } from "@/src/components/explore/MatchModal";
import { useAuth } from "@/src/context/AuthContext";
import { useServices } from "@/src/context/ServicesContext";
import { useMatches, MatchViewModel } from "@/src/hooks/useMatches";
import { useSwipe } from "@/src/hooks/useSwipe";
import { API_CONFIG } from "@/src/config/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

export default function ExploreScreen() {
  const { user } = useAuth();
  const { chatService } = useServices();
  const { matches, isLoading, loadMatches, removeMatch } = useMatches();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDogInfo, setShowDogInfo] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<MatchViewModel | null>(null);
  const [matchConversationId, setMatchConversationId] = useState<number | null>(null);

  /** Crée (ou récupère) la conversation privée avec le match */
  const createMatchConversation = useCallback(async (otherUserId: number) => {
    try {
      const conv = await chatService.getOrCreateConversation(otherUserId);
      setMatchConversationId(conv.id);
    } catch (e) {
      console.error('Erreur création conversation match:', e);
    }
  }, [chatService]);

  // Détecter un match venant du profil detail
  const params = useLocalSearchParams<{
    matchedUserId?: string;
    matchedName?: string;
    matchedImage?: string;
  }>();

  useEffect(() => {
    if (params.matchedUserId && params.matchedName) {
      const uid = Number(params.matchedUserId);
      setMatchedUser({
        id: uid,
        name: params.matchedName,
        mainImage: params.matchedImage ?? '',
        distance: '',
        dogName: '',
        dogMainImage: '',
        additionalImages: [],
        dogAdditionalImages: [],
        totalImages: 0,
        dogTotalImages: 0,
        rawImages: [],
      });
      setMatchConversationId(null);
      createMatchConversation(uid);
      setShowMatchModal(true);
      // Animer la carte de match (sinon elle reste à scale 0)
      matchScale.setValue(0);
      Animated.spring(matchScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(heartPulse, { toValue: 1.3, duration: 400, useNativeDriver: true }),
          Animated.timing(heartPulse, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [params.matchedUserId]);

  /** Ouvre le profil complet en mode preview (avant like/dislike) */
  const handleViewProfile = useCallback(() => {
    const match = matches[currentIndex];
    if (!match) return;
    router.push({
      pathname: '/profile-detail',
      params: {
        userId: String(match.id),
        name: match.name,
        mainImage: match.mainImage,
      },
    });
  }, [matches, currentIndex]);

  // Remettre l'index à 0 quand un nouveau batch arrive
  useEffect(() => { setCurrentIndex(0); }, [matches]);

  const handleMatch = useCallback((match: MatchViewModel) => {
    setMatchedUser(match);
    setMatchConversationId(null);
    createMatchConversation(match.id);
    setShowMatchModal(true);
  }, [createMatchConversation]);

  const {
    pan, rotate, matchScale, heartPulse, radarRotation,
    panResponder, swipeLeft, swipeRight,
  } = useSwipe({
    matches,
    currentIndex,
    currentUserId: user?.id,
    onSwiped: removeMatch,
    onMatch: handleMatch,
    onTap: handleViewProfile,
  });

  // Animation radar (loading)
  useEffect(() => {
    if (!isLoading) return;
    radarRotation.setValue(0);
    const anim = Animated.loop(
      Animated.timing(radarRotation, { toValue: 1, duration: 3000, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [isLoading]);

  // Masquer la nav Android + refresh silencieux au retour sur l'écran
  const hasLoaded = useRef(false);
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === "android") NavigationBar.setVisibilityAsync("hidden");
      if (hasLoaded.current) {
        loadMatches(); // recharge avec animation radar
      }
      return () => { if (Platform.OS === "android") NavigationBar.setVisibilityAsync("visible"); };
    }, [loadMatches]),
  );

  // Chargement initial (délai 2s pour l'animation radar)
  useEffect(() => {
    const t = setTimeout(() => { hasLoaded.current = true; loadMatches(); }, 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spin = radarRotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const exploreLeft = (
    <TouchableOpacity style={styles.headerDogBtn} onPress={() => router.push('/me' as any)} activeOpacity={0.8}>
      <Image source={require("@/assets/images/dogillustration2.png")} style={styles.headerDogIcon} resizeMode="contain" />
    </TouchableOpacity>
  );
  const exploreRight = (
    <TouchableOpacity style={styles.headerOptionsBtn} onPress={() => router.push('/settings/match-settings')} activeOpacity={0.8}>
      <Ionicons name="options-outline" size={25} color={Colors.primary} />
    </TouchableOpacity>
  );

  // ─── Mode privé ──────────────────────────────────────────────────────────────
  if (user?.privateMode) {
    return (
      <TabScreenLayout title="Explorer" leftAction={exploreLeft} rightAction={exploreRight}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Image source={require("@/assets/images/dogprivate.png")} style={styles.emptyDog} resizeMode="contain" />
          </View>
          <Text style={styles.emptyText}>Mode privé activé</Text>
          <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8, opacity: 0.7 }]}>
            Votre profil est caché.{"\n"}Désactivez le mode privé dans les paramètres pour explorer.
          </Text>
        </View>
        <BottomNav activeTab="explore" />
      </TabScreenLayout>
    );
  }

  // ─── États de rendu ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <TabScreenLayout title="Explorer" leftAction={exploreLeft} rightAction={exploreRight}>
        <View style={styles.loadingContainer}>
          <Animated.Image
            source={require("@/assets/images/Radar.png")}
            style={[styles.radarImage, { transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
          <Image source={require("@/assets/images/dogillustration2.png")} style={styles.loadingDog} resizeMode="contain" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
        <BottomNav activeTab="explore" />
      </TabScreenLayout>
    );
  }

  if (matches.length === 0) {
    return (
      <TabScreenLayout title="Explorer" leftAction={exploreLeft} rightAction={exploreRight}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Image source={require("@/assets/images/dogillustration2.png")} style={styles.emptyDog} resizeMode="contain" />
          </View>
          <Text style={styles.emptyText}>Oups ! Aucun résultat pour le moment{"\n"}Reviens plus tard !</Text>
        </View>
        <BottomNav activeTab="explore" />
      </TabScreenLayout>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <View style={styles.container}>
      <TabScreenLayout title="Explorer" leftAction={exploreLeft} rightAction={exploreRight}>

      <View style={styles.cardContainer}>
        {/* Cartes en arrière-plan */}
        {matches.slice(currentIndex + 1, currentIndex + 3).reverse().map((match, index) => (
          <View
            key={match.id}
            style={[styles.card, styles.cardBehind, {
              transform: [{ scale: 1 - (index + 1) * 0.05 }, { translateY: -(index + 1) * 10 }],
              opacity: 1 - (index + 1) * 0.3,
            }]}
          >
            <View style={styles.profileHeader}>
              <Image source={{ uri: match.mainImage }} style={styles.profileImage} />
              <View>
                <Text style={styles.profileName}>{match.name}</Text>
                <Text style={styles.profileDistance}>{match.distance}</Text>
              </View>
            </View>
            <Image source={{ uri: match.mainImage }} style={styles.cardMainImage} />
          </View>
        ))}

        {/* Carte swipeable */}
        <MatchCard
          match={currentMatch}
          pan={pan}
          rotate={rotate}
          panResponder={panResponder}
          showDogInfo={showDogInfo}
          onToggleDogInfo={() => setShowDogInfo((v) => !v)}
          onViewProfile={handleViewProfile}
        />
      </View>

      <SwipeActions
        onPass={() => swipeLeft()}
        onLike={() => swipeRight()}
        onRefresh={loadMatches}
      />

      <BottomNav activeTab="explore" />
      </TabScreenLayout>

      {/* Modal match */}
      <MatchModal
        visible={showMatchModal}
        matchedUser={matchedUser}
        matchConversationId={matchConversationId}
        currentUserImageUri={
          user?.images?.[0]
            ? `${API_CONFIG.BASE_URL}/uploads/images/${user.images[0]}`
            : user?.image
            ? `${API_CONFIG.BASE_URL}/uploads/images/${user.image}`
            : null
        }
        matchScale={matchScale}
        heartPulse={heartPulse}
        onClose={() => {
          heartPulse.stopAnimation();
          heartPulse.setValue(1);
          matchScale.setValue(0);
          setShowMatchModal(false);
          setMatchedUser(null);
          setMatchConversationId(null);
        }}
        onSendMessage={() => {
          if (!matchConversationId || !matchedUser) return;
          heartPulse.stopAnimation();
          heartPulse.setValue(1);
          matchScale.setValue(0);
          setShowMatchModal(false);
          const name = matchedUser.name;
          const img  = matchedUser.mainImage;
          const cid  = matchConversationId;
          setMatchedUser(null);
          setMatchConversationId(null);
          router.push({
            pathname: '/chat',
            params: { conversationId: cid, otherName: name, otherImage: img, isGroup: '0' },
          } as any);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerDogBtn: { width: 45, height: 45, borderRadius: 30, backgroundColor: Colors.buttonPrimary, justifyContent: 'center', alignItems: 'center' },
  headerDogIcon: { width: 30, height: 30 },
  headerOptionsBtn: { width: 45, height: 45, borderRadius: 30, backgroundColor: Colors.buttonPrimary, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 },
  radarImage: { width: 200, height: 200, position: "absolute" },
  loadingDog: { width: 150, height: 150 },
  loadingText: { marginTop: 10, fontSize: 14, color: Colors.white },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingBottom: 80 },
  emptyCircle: { width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.buttonPrimary, justifyContent: "center", alignItems: "center", marginBottom: 30 },
  emptyDog: { width: 120, height: 120 },
  emptyText: { fontSize: 14, color: Colors.gray, textAlign: "center", lineHeight: 22 },
  cardContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  card: { width: CARD_WIDTH, borderRadius: 30, backgroundColor: Colors.white, overflow: "hidden", position: "absolute" },
  cardBehind: { zIndex: 1 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6, paddingHorizontal: 5 },
  profileImage: { marginTop: 6, width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: Colors.white },
  profileName: { fontSize: 20, fontWeight: "700", color: Colors.grayDark },
  profileDistance: { fontSize: 14, color: Colors.gray },
  cardMainImage: { width: "100%", height: 330 },
  matchModalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", zIndex: 1000 },
});
