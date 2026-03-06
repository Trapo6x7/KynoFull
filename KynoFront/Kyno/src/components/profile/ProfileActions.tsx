import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, StatusBar, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/colors";
import { ProfileMode } from "@/src/types";

const { height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.46;

interface ProfileActionsProps {
  mode: ProfileMode;
  onLike?: () => void;
  onDislike?: () => void;
  onNext?: () => void;
  onSettings?: () => void;
  onChat?: () => void;
  onSubProfile?: () => void;
  subProfileIcon?: React.ComponentProps<typeof Ionicons>["name"];
  isPetProfile?: boolean;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({ mode, onLike, onDislike, onNext, onSettings, onChat, onSubProfile, subProfileIcon = "paw-outline", isPetProfile }) => (
  <>
    {mode === "preview" && (onLike || onDislike) && (
      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.previewBtn} onPress={onDislike} activeOpacity={0.85}>
          <Ionicons name="close" size={32} color={Colors.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.previewBtn, styles.likeBtn]} onPress={onLike} activeOpacity={0.85}>
          <Ionicons name="heart" size={32} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.previewBtn} onPress={onNext} activeOpacity={0.85}>
          <Ionicons name="refresh" size={28} color={Colors.gray} />
        </TouchableOpacity>
      </View>
    )}
    {((mode === "me" && onSettings) || (mode === "group" && onChat)) && (
      <View style={styles.topRight}>
        <TouchableOpacity style={styles.actionBtn} onPress={mode === "me" ? onSettings : onChat} activeOpacity={0.85}>
          <Ionicons name={mode === "me" ? "ellipsis-horizontal" : "chatbubble-ellipses"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    )}
    {onSubProfile && (
      <TouchableOpacity style={styles.subProfileBtn} onPress={onSubProfile} activeOpacity={0.85}>
        <Ionicons name={subProfileIcon} size={22} color={isPetProfile ? Colors.primary : Colors.gray} />
      </TouchableOpacity>
    )}
  </>
);

const styles = StyleSheet.create({
  previewActions: { position: "absolute", top: HERO_HEIGHT - 40, left: 0, right: 0, flexDirection: "row", gap: 30, justifyContent: "center", alignItems: "center", zIndex: 10 },
  previewBtn: { width: 45, height: 45, borderRadius: 30, backgroundColor: Colors.grayLight, justifyContent: "center", alignItems: "center" },
  likeBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.buttonPrimary },
  topRight: { position: "absolute", top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 52, right: 14 },
  actionBtn: { width: 32, height: 32, backgroundColor: "rgba(0,0,0,0.30)", borderRadius: 24, justifyContent: "center", alignItems: "center" },
  subProfileBtn: { position: "absolute", bottom: 28, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, justifyContent: "center", alignItems: "center" },
});
