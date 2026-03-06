import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '@/src/constants/colors';
import type { WalkSpot } from '@/src/services/spotService';
import { CATEGORY_META } from './types';

interface SpotCardProps {
  spot: WalkSpot;
  onPress: () => void;
  userRating: number;
  avgRating: number;
}

export function SpotCard({ spot, onPress, userRating, avgRating }: SpotCardProps) {
  const meta = CATEGORY_META[spot.category];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      {spot.photoUrl ? (
        <Image source={{ uri: spot.photoUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, { backgroundColor: meta.color, justifyContent: 'center', alignItems: 'center' }]}>
          <MaterialCommunityIcons name="bone" size={26} color={Colors.white} />
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{spot.name}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color={Colors.grayDark} />
          <Text style={styles.infoTextAddress} numberOfLines={1}> {spot.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={13} color={Colors.gray} />
          <Text style={styles.infoText}> {spot.distance}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 4, gap: 5 }]}>
          <Text style={[styles.categoryText, { color: meta.color }]}>{spot.category}</Text>
          {avgRating > 0 ? (
            <>
              <Text style={{ color: Colors.grayLight }}>·</Text>
              <MaterialCommunityIcons name="star" size={11} color={Colors.primary} />
              <Text style={[styles.infoText, { fontWeight: '600' }]}>{avgRating.toFixed(1)}</Text>
            </>
          ) : (
            <>
              <Text style={{ color: Colors.grayLight }}>·</Text>
              <MaterialCommunityIcons name="star" size={11} color={Colors.grayLight} />
              <Text style={[styles.infoText, { fontWeight: '600', color: Colors.grayLight }]}>Non noté</Text>
            </>
          )}
          <Text style={{ color: Colors.grayLight }}>·</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    flexShrink: 0,
  },
  cardInfo: { flex: 1, gap: 5 },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 10, color: Colors.gray },
  infoTextAddress: { fontSize: 12, color: Colors.grayDark },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
