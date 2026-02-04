import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';

interface ImagePlaceholderProps {
  size?: number;
}

export default function ImagePlaceholder({ size = 100 }: ImagePlaceholderProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Background rectangle with rounded corners */}
        <Rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="12"
          fill="#FFFFFF"
          stroke="#F5A9D0"
          strokeWidth="3"
        />
        
        {/* Mountain/landscape icon */}
        <Path
          d="M25 65 L35 50 L45 60 L60 40 L75 65 Z"
          fill="#F5A9D0"
          opacity="0.6"
        />
        
        {/* Sun/circle in top right */}
        <Circle
          cx="65"
          cy="30"
          r="6"
          fill="#F5A9D0"
          opacity="0.6"
        />
        
        {/* Small heart decoration in top right corner */}
        <Path
          d="M85 15 C85 12 83 10 81 10 C79 10 78 11 77 12 C76 11 75 10 73 10 C71 10 69 12 69 15 C69 18 77 23 77 23 C77 23 85 18 85 15 Z"
          fill="#F5A9D0"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
