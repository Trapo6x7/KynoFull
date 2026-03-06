import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/colors";
import { ProfileMode } from "@/src/types";
import { ImageCarousel } from "./ImageCarousel";

const { width } = Dimensions.get("window");
const THUMB_SIZE = (width - 48) / 2;

interface ProfileImageGridProps {
  images: string[];
  mode: ProfileMode;
  onAddImage?: () => void;
}

export const ProfileImageGrid: React.FC<ProfileImageGridProps> = ({ images, mode, onAddImage }) => {
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

  if (images.length === 0) {
    if (mode !== "me") {
      return (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={48} color={Colors.grayLight} />
          <Text style={styles.emptyText}>Aucune photo</Text>
        </View>
      );
    }
    return (
      <View style={styles.grid}>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.thumb, styles.addThumb]} onPress={onAddImage} activeOpacity={0.8}>
            <Ionicons name="add" size={36} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const rows: string[][] = [];
  for (let i = 0; i < images.length; i += 2) rows.push(images.slice(i, i + 2));

  return (
    <View style={styles.grid}>
      {carouselIndex !== null && <ImageCarousel images={images} startIndex={carouselIndex} onClose={() => setCarouselIndex(null)} />}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((uri, ci) => (
            <TouchableOpacity key={ci} activeOpacity={0.85} onPress={() => setCarouselIndex(ri * 2 + ci)}>
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
            </TouchableOpacity>
          ))}
          {row.length === 1 && mode === "me" && (
            <TouchableOpacity style={[styles.thumb, styles.addThumb]} onPress={onAddImage} activeOpacity={0.8}>
              <Ionicons name="add" size={36} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {images.length % 2 === 0 && mode === "me" && (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.thumb, styles.addThumb]} onPress={onAddImage} activeOpacity={0.8}>
            <Ionicons name="add" size={36} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { gap: 8 },
  row: { flexDirection: "row", gap: 8 },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 12, backgroundColor: Colors.grayLight },
  addThumb: { justifyContent: "center", alignItems: "center", backgroundColor: Colors.buttonPrimary },
  empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.gray },
});
