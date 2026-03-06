import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "@/src/constants/colors";

type TabType = "images" | "apropos";

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasActions?: boolean;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange, hasActions }) => (
  <View style={[styles.container, hasActions && { marginTop: 30 }]}>
    <TouchableOpacity style={[styles.tab, activeTab === "images" && styles.tabActive]} onPress={() => onTabChange("images")} activeOpacity={0.8}>
      <Text style={[styles.tabText, activeTab === "images" && styles.tabTextActive]}>IMAGES</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.tab, activeTab === "apropos" && styles.tabActive]} onPress={() => onTabChange("apropos")} activeOpacity={0.8}>
      <Text style={[styles.tabText, activeTab === "apropos" && styles.tabTextActive]}>À PROPOS</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.grayLight, backgroundColor: Colors.white },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: Colors.gray, letterSpacing: 0.5 },
  tabTextActive: { color: Colors.primary },
});
