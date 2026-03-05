import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/src/context/AuthContext";
import { useServices } from "@/src/context/ServicesContext";
import BottomNav from "@/components/BottomNav";
import TabScreenLayout from "@/src/components/TabScreenLayout";
import Colors from "@/src/constants/colors";
import { API_CONFIG } from "@/src/config/api";
import type { User } from "@/src/types";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 2; // 2 colonnes avec marges

const toImageUrl = (f: string) => `${API_CONFIG.BASE_URL}/uploads/images/${f}`;
const PLACEHOLDER = "https://via.placeholder.com/400";

export default function LikesScreen() {
  const { user } = useAuth();
  const { matchService, userService } = useServices();

  const [likers, setLikers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") NavigationBar.setVisibilityAsync("hidden");
      loadLikers();
      return () => {
        if (Platform.OS === "android")
          NavigationBar.setVisibilityAsync("visible");
      };
    }, [user?.id]),
  );

  const loadLikers = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [likerIds, actedIds, allUsers] = await Promise.all([
        matchService.getLikesReceived(user.id),
        matchService.getSeenUserIds(user.id),
        userService.getAllUsers(),
      ]);
      const likerSet = new Set(likerIds);
      const actedSet = new Set(actedIds);
      setLikers(allUsers.filter((u) => likerSet.has(u.id) && !actedSet.has(u.id)));
    } catch {
      setLikers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCard = ({ item }: { item: User }) => {
    const image = item.images?.[0] ? toImageUrl(item.images[0]) : PLACEHOLDER;
    const dog = item.dogs?.[0];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/profile-detail",
            params: {
              userId: String(item.id),
              name: item.name ?? item.firstName,
            },
          })
        }
      >
        <Image
          source={{ uri: image }}
          style={styles.cardImage}
          resizeMode="cover"
          blurRadius={5}
        />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name ?? item.firstName}
            {item.birthdate
              ? ` , ${new Date().getFullYear() - new Date(item.birthdate).getFullYear()}`
              : ""}
          </Text>
          {dog && (
            <View style={styles.cardDog}>
              <Ionicons name="paw" size={11} color={Colors.white} />
              <Text style={styles.cardDogName} numberOfLines={1}>
                {dog.name}
              </Text>
            </View>
          )}
        </View>
        {/* Icône coeur */}
        <View style={styles.heartBadge}>
          <Ionicons name="heart" size={14} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TabScreenLayout
      title="Likes reçus"
      rightAction={
        !isLoading && likers.length > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{likers.length}</Text>
          </View>
        ) : undefined
      }
    >
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : likers.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={56} color={Colors.grayLight} />
          <Text style={styles.emptyText}>
            Personne n'a encore liké ton profil
          </Text>
        </View>
      ) : (
        <FlatList
          data={likers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      )}

      <BottomNav activeTab="likes" />
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    overflow: "hidden",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
  row: {
    gap: 14,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.3,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.buttonPrimary,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },
  cardName: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  cardDog: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDogName: {
    color: Colors.white,
    fontSize: 11,
  },
  heartBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
