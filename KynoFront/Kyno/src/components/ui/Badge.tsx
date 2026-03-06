import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/src/constants/colors';

interface BadgeProps {
  count: number;
  variant?: 'primary' | 'danger';
  size?: 'small' | 'medium';
}

export function Badge({ count, variant = 'primary', size = 'medium' }: BadgeProps) {
  if (count === 0) return null;

  const displayCount = count > 9 ? '9+' : count.toString();

  return (
    <View style={[styles.badge, styles[variant], styles[size]]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>{displayCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    height: 18,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    height: 24,
  },
  text: {
    color: Colors.white,
    fontWeight: '700',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
});
