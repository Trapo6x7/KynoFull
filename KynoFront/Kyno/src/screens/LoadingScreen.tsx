import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Animation de rotation continue
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1, // Répéter indéfiniment
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <ImageBackground
      source={require('@/assets/images/Bgimage.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Logo KYNO en haut */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/kynologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Os qui tourne au centre */}
      <View style={styles.boneContainer}>
        <Animated.Image
          source={require('@/assets/images/bone.png')}
          style={[styles.bone, animatedStyle]}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.35,
    height: 60,
  },
  boneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
  },
  bone: {
    width: 80,
    height: 80,
  },
});
