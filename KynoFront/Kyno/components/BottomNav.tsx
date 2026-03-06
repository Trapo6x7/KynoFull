import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/src/constants/colors";
import { useBadge } from "@/src/context/BadgeContext";

const TAB_ROUTES: Record<string, string> = {
  explore: "/(tabs)/explore",
  messages: "/(tabs)/messages",
  likes: "/(tabs)/likes",
  profile: "/me",
  map: "/(tabs)/map",
  settings: "/settings",
};

export type BottomNavTab =
  | "explore"
  | "messages"
  | "likes"
  | "profile"
  | "map"
  | "settings";

type TabConfig = {
  key: BottomNavTab;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  size: number;
};

const TABS: TabConfig[] = [
  { key: "explore", icon: "paw-outline", size: 24 },
  { key: "map", icon: "location-outline", size: 24 },
  { key: "likes", icon: "heart-outline", size: 24 },
  { key: "messages", icon: "chatbubble-outline", size: 24 },
  { key: "profile", icon: "person-outline", size: 24 },
];

type BottomNavProps = {
  activeTab?: BottomNavTab;
  /** Retourner `true` pour empêcher la navigation par défaut */
  onSelectTab?: (tab: BottomNavTab) => boolean | void;
  style?: StyleProp<ViewStyle>;
};

export default function BottomNav({
  activeTab,
  onSelectTab,
  style,
}: BottomNavProps) {
  const { messagesBadge, likesBadge } = useBadge();
  return (
    <View style={[styles.bottomNav, style]}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.navButton,
            activeTab === tab.key ? styles.navButtonActive : undefined,
          ]}
          onPress={() => {
            const handled = onSelectTab?.(tab.key);
            if (handled) return;
            const route = TAB_ROUTES[tab.key];
            if (route) router.push(route as any);
          }}
        >
          <View>
            <Ionicons
              name={tab.icon}
              size={tab.size}
              color={activeTab === tab.key ? Colors.primary : Colors.gray}
            />
            {tab.key === "messages" && messagesBadge && (
              <View style={styles.badgeDot} />
            )}
            {tab.key === "likes" && likesBadge && (
              <View style={styles.badgeDot} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 40,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  navButton: {
    padding: 10,
  },
  navButtonActive: {},
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 12,
    height:12,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.buttonPrimary,
  },
});
