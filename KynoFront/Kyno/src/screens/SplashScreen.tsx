import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import Colors from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';
import { useSplashAnimation } from '@/hooks/useSplashAnimation';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const {
    showWelcome,
    splashAnimatedStyle,
    illustrationAnimatedStyle,
    textLogoAnimatedStyle,
    contentAnimatedStyle,
  } = useSplashAnimation(onFinish);


  const handleLogin = () => {
    router.push('/(auth)/login');
  };
  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/Bgimage.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centerContainer}>
          {/* Illustration */}
          <Animated.View style={[styles.logoContainer, illustrationAnimatedStyle]}>
            <Image
              source={require('@/assets/images/kynoillustration.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          {/* Logo texte */}
          <Animated.View style={[styles.textLogoContainer, textLogoAnimatedStyle]}>
            <Image
              source={require('@/assets/images/kynologo.png')}
              style={styles.textLogo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
        {/* Welcome content */}
        {showWelcome && (
          <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
            <Text style={styles.title}>
              Rencontre & <Text style={styles.titleAccent}>Joue</Text>
            </Text>
            <Text style={styles.description}>
              Kyno est une application qui met en relation chiens et propriétaires
              pour organiser des sorties, des playdates ou des rencontres de
              reproduction, en proposant des profils chiens détaillés, un
              matching par race/âge/comportement et des outils de sécurité
              pour les propriétaires.
            </Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonPrimaryText}>SE CONNECTER</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonSecondaryText}>S'INSCRIRE</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  textLogoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  textLogo: {
    width: width * 0.35,
    height: 45,
  },
  contentContainer: {
    position: 'absolute',
    bottom: '10%',
    width: '100%',
    paddingHorizontal: 35,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  titleAccent: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope_600SemiBold',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 10,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    letterSpacing: 1,
  },
  buttonSecondary: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
    letterSpacing: 1,
  },
});