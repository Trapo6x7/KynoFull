import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '@/src/constants/colors';

interface UserMarkerProps {
  size?: number;
}

export function UserMarker({ size = 38 }: UserMarkerProps) {
  return (
    <View collapsable={false} style={{ padding: 3, backgroundColor: 'transparent' }}>
      <View
        style={[
          styles.spotMarker,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: Colors.primary,
          },
        ]}
      >
        <MaterialCommunityIcons name="paw" size={size * 0.55} color={Colors.white} />
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
