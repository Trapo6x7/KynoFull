import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Colors from '@/src/constants/colors';
import { getInitials } from '@/src/utils/formatters';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
}

export function Avatar({ uri, name, size = 50 }: AvatarProps) {
  const radius = size / 2;
  const fontSize = size * 0.4;

  return uri ? (
    <Image source={{ uri }} style={[styles.avatar, { width: size, height: size, borderRadius: radius }]} />
  ) : (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.grayLight,
  },
  avatarFallback: {
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});
