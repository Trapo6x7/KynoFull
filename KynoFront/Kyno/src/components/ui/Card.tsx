import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/src/constants/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
