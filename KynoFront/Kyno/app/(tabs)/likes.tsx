import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useFocusEffect } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/src/context/AuthContext";
import { useServices } from "@/src/context/ServicesContext";
import BottomNav from "@/src/components/BottomNav";
import TabScreenLayout from "@/src/components/TabScreenLayout";
import Colors from "@/src/constants/colors";
import { LikerCard } from "@/src/components/explore/LikerCard";
import type { User } from "@/src/types";

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
          renderItem={({ item }) => <LikerCard item={item} />}
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
    backgroundColor: Colors.grayDark,
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
});
