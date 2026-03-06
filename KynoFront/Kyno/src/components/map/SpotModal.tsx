import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '@/src/constants/colors';
import type { WalkSpot } from '@/src/services/spotService';
import { CATEGORY_META } from './types';

interface SpotModalProps {
  spot: WalkSpot | null;
  onClose: () => void;
  userRating: number;
  avgRating: number;
  onRate: (stars: number) => void;
}

export function SpotModal({ spot, onClose, userRating, avgRating, onRate }: SpotModalProps) {
  if (!spot) return null;
  const meta = CATEGORY_META[spot.category];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.35)' }]}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(240,210,225,0.25)' }]}
      />
      <View style={styles.modalBackdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
          {spot.photoUrl ? (
            <Image source={{ uri: spot.photoUrl }} style={styles.modalPhoto} resizeMode="cover" />
          ) : (
            <View style={[styles.modalPhoto, { backgroundColor: meta.color + '33', justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialCommunityIcons name="bone" size={48} color={meta.color} />
            </View>
          )}

          <View style={styles.modalBody}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View style={[styles.categoryPill, { backgroundColor: meta.color + '22' }]}>
                <Text style={[styles.categoryPillText, { color: meta.color }]}>{spot.category}</Text>
              </View>
            </View>
            <Text style={styles.modalName}>{spot.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={Colors.grayDark} />
              <Text style={styles.infoTextAddress}> {spot.address}</Text>
            </View>
            <View style={[styles.infoRow, { marginTop: 2 }]}>
              <Ionicons name="navigate-outline" size={14} color={Colors.gray} />
              <Text style={styles.infoText}> {spot.distance}</Text>
            </View>

            {avgRating > 0 && (
              <View style={[styles.infoRow, { marginTop: 8, gap: 4 }]}>
                <MaterialCommunityIcons name="account-group-outline" size={14} color={Colors.gray} />
                <Text style={[styles.infoText, { color: Colors.gray }]}>Moyenne communauté :</Text>
                <MaterialCommunityIcons name="star" size={13} color="#FFC107" />
                <Text style={[styles.infoText, { fontWeight: '600' }]}>{avgRating.toFixed(1)}/5</Text>
              </View>
            )}

            <Text style={[styles.ratingLabel, { marginTop: avgRating > 0 ? 10 : 0 }]}>Votre note</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => onRate(star)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialCommunityIcons
                    name={star <= userRating ? 'star' : 'star-outline'}
                    size={30}
                    color={star <= userRating ? Colors.primary : Colors.grayLight}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {userRating > 0 && (
              <Text style={{ fontSize: 12, color: Colors.gray, marginTop: 6 }}>
                Vous avez noté ce lieu {userRating}/5
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.grayDark} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 4,
    borderColor: Colors.background,
    overflow: 'hidden',
    paddingBottom: 32,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  modalPhoto: {
    width: '100%',
    height: 200,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.grayDark,
    marginTop: 20,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 10, color: Colors.gray },
  infoTextAddress: { fontSize: 12, color: Colors.grayDark },
});
