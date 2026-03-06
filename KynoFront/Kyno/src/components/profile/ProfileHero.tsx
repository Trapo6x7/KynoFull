import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/colors";

const { height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.46;

interface ProfileHeroProps {
  imageUri?: string;
  name: string;
  showPlaceholder: boolean;
  onBack?: () => void;
  onAddImage?: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ imageUri, name, showPlaceholder, onBack, onAddImage }) => (
  <View style={styles.container}>
    {imageUri ? (
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
    ) : showPlaceholder ? (
      <TouchableOpacity style={[styles.image, styles.placeholder]} onPress={onAddImage} activeOpacity={0.8}>
        <Ionicons name="camera-outline" size={36} color={Colors.white} />
        <Text style={styles.placeholderText}>Ajouter une photo</Text>
      </TouchableOpacity>
    ) : (
      <View style={[styles.image, styles.empty]} />
    )}
    {imageUri && <View style={styles.overlay} />}
    <View style={styles.topLeft}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Ionicons name="chevron-back" size={20} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.name}>{name}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { width: "100%", height: HERO_HEIGHT, position: "relative", backgroundColor: Colors.grayLight },
  image: { width: "100%", height: "100%" },
  placeholder: { backgroundColor: Colors.primaryLight, justifyContent: "center", alignItems: "center", gap: 10 },
  placeholderText: { color: Colors.white, fontSize: 15, fontWeight: "600", opacity: 0.9 },
  empty: { backgroundColor: "#1a1a1a" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.18)" },
  topLeft: { position: "absolute", top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 52, left: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.30)", justifyContent: "center", alignItems: "center" },
  name: { color: Colors.white, fontSize: 18, fontWeight: "700" },
});
