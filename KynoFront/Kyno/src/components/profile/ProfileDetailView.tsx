import React, { useState, useRef } from "react";
import { View, StyleSheet, ScrollView, StatusBar, PanResponder, Dimensions } from "react-native";
import Colors from "@/src/constants/colors";
import { ProfileMode } from "@/src/types";
import { ProfileHero } from "./ProfileHero";
import { ProfileActions } from "./ProfileActions";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileImageGrid } from "./ProfileImageGrid";
import { ProfileAbout } from "./ProfileAbout";

const { height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.46;

export interface ProfileDetailViewProps {
  mode: ProfileMode;
  type?: "owner" | "pet";
  name: string;
  mainImage?: string;
  images?: string[];
  keywords?: string[];
  description?: string;
  onSubProfile?: () => void;
  subProfileIcon?: React.ComponentProps<typeof import("@expo/vector-icons").Ionicons>["name"];
  subProfileLabel?: string;
  onBack?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onNext?: () => void;
  onEdit?: () => void;
  onSettings?: () => void;
  onAddImage?: () => void;
  members?: { id: number; name: string }[];
  onAddMember?: () => void;
  onChat?: () => void;
}

export const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({
  mode,
  type = "owner",
  name,
  mainImage,
  images = [],
  keywords = [],
  description,
  onSubProfile,
  subProfileIcon = "paw-outline",
  onBack,
  onLike,
  onDislike,
  onNext,
  onEdit,
  onSettings,
  onAddImage,
  members = [],
  onAddMember,
  onChat,
}) => {
  const [activeTab, setActiveTab] = useState<"images" | "apropos">("images");

  const swipePan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 60 && g.vx > 0.2) onBack?.();
      },
    })
  ).current;

  const hasActions = mode === "preview" && (!!onLike || !!onDislike);
  const heroUri = mainImage || images[0];
  const galleryImages = images.length > 0 ? images : [];
  const headerLabel = mode === "me" ? (type === "pet" ? "Mon chien" : "Mon profil") : name;

  return (
    <View style={styles.container} {...swipePan.panHandlers}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[styles.heroWrapper, { height: HERO_HEIGHT, overflow: "visible", zIndex: hasActions ? 5 : undefined }]}>
        <ProfileHero imageUri={heroUri} name={headerLabel} showPlaceholder={mode === "me"} onBack={onBack} onAddImage={onAddImage} />
        <ProfileActions mode={mode} onLike={onLike} onDislike={onDislike} onNext={onNext} onSettings={onSettings} onChat={onChat} onSubProfile={onSubProfile} subProfileIcon={subProfileIcon} isPetProfile={type === "pet"} />
      </View>
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} hasActions={hasActions} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        {activeTab === "images" ? (
          <ProfileImageGrid images={galleryImages} mode={mode} onAddImage={onAddImage} />
        ) : (
          <ProfileAbout name={name} keywords={keywords} description={description} mode={mode} members={members} onAddMember={onAddMember} onEdit={onEdit} />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  heroWrapper: { width: "100%", position: "relative", backgroundColor: Colors.white },
  content: { flex: 1, backgroundColor: Colors.white },
  contentInner: { padding: 16, paddingBottom: 40 },
});
