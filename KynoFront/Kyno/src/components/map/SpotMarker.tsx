import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '@/src/constants/colors';
import { SpotCategory, CATEGORY_META } from './types';

function darkenHex(hex: string, amount = 0.28): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.round(((n >> 16) & 0xff) * (1 - amount));
  const g = Math.round(((n >> 8) & 0xff) * (1 - amount));
  const b = Math.round((n & 0xff) * (1 - amount));
  return `rgb(${r},${g},${b})`;
}

interface SpotMarkerProps {
  category?: Exclude<SpotCategory, 'Tous'>;
  size?: number;
  selected?: boolean;
}

export function SpotMarker({ category, size = 30, selected = false }: SpotMarkerProps) {
  const baseColor = category ? (CATEGORY_META[category]?.color ?? Colors.primary) : Colors.primary;
  const bgColor = selected ? darkenHex(baseColor) : baseColor;
  const actualSize = selected ? size * 1.45 : size;

  return (
    <View collapsable={false} style={{ padding: 3, backgroundColor: 'transparent' }}>
      <View
        style={[
          styles.spotMarker,
          {
            width: actualSize,
            height: actualSize,
            borderRadius: actualSize / 2,
            backgroundColor: bgColor,
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? '#fff' : 'transparent',
          },
        ]}
      >
        <MaterialCommunityIcons name="bone" size={actualSize * 0.55} color={Colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spotMarker: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: Colors.background,
  },
});
