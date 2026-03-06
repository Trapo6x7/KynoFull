import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import { API_CONFIG } from '@/src/config/api';
import { getAge } from '@/src/utils/formatters';
import type { User } from '@/src/types';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;
const PLACEHOLDER = 'https://via.placeholder.com/400';
const toImageUrl = (f: string) => `${API_CONFIG.BASE_URL}/uploads/images/${f}`;

interface LikerCardProps {
  item: User;
}

export function LikerCard({ item }: LikerCardProps) {
  const image = item.images?.[0] ? toImageUrl(item.images[0]) : PLACEHOLDER;
  const dog = item.dogs?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: '/profile-detail',
          params: { userId: String(item.id), name: item.name ?? item.firstName },
        })
      }
    >
      <Image source={{ uri: image }} style={styles.cardImage} resizeMode="cover" blurRadius={5} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name ?? item.firstName}
          {item.birthdate ? ` , ${getAge(item.birthdate)}` : ''}
        </Text>
        {dog && (
          <View style={styles.cardDog}>
            <Ionicons name="paw" size={11} color={Colors.white} />
            <Text style={styles.cardDogName} numberOfLines={1}>{dog.name}</Text>
          </View>
        )}
      </View>
      <View style={styles.heartBadge}>
        <Ionicons name="heart" size={14} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.3,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.buttonPrimary,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },
  cardName: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  cardDog: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDogName: {
    color: Colors.white,
    fontSize: 11,
  },
  heartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
