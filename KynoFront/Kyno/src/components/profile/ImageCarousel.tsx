import React, { useState, useRef } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Modal, FlatList, StatusBar, Platform, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface ImageCarouselProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, startIndex, onClose }) => {
  const flatRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(startIndex);

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <FlatList
          ref={flatRef}
          data={images}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={(e) => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
            </View>
          )}
        />
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => <View key={i} style={[styles.dot, i === current && styles.dotActive]} />)}
          </View>
        )}
        <View style={styles.counter}>
          <Text style={styles.counterText}>{current + 1} / {images.length}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  page: { width, flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width, height: "100%" },
  closeBtn: { position: "absolute", top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 52, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  counter: { position: "absolute", top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 14 : 58, alignSelf: "center" },
  counterText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  dots: { position: "absolute", bottom: 32, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.4)" },
  dotActive: { backgroundColor: "#fff", width: 20 },
});
