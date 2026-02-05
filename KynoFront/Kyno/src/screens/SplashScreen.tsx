import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import Colors from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';

const { width, height } = Dimensions.get('window');

// Durées des animations
const PHASE1_DURATION = 1500; // Loader 1 affiché
const ZOOM_DURATION = 800;    // Transition zoom (phase 1 -> 2)
const PHASE2_DURATION = 1000; // Loader 2 affiché
const SLIDE_DURATION = 600;   // Transition slide (welcome)
const FADE_DURATION = 400;    // Fade in des éléments (welcome)

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [showWelcome, setShowWelcome] = useState(false);

  // Splash animation
  const zoomScale = useSharedValue(1);

  // Welcome animation
  const illustrationTranslateY = useSharedValue(0);
  const illustrationScale = useSharedValue(1.4);
  const textLogoTranslateY = useSharedValue(0);
  const textLogoScale = useSharedValue(1.4);
  const contentOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(50);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // prevent double start (dev/mount quirks)
    startedRef.current = true;
    // Splash zoom
    const timer1 = setTimeout(() => {
      zoomScale.value = withTiming(1.4, {
        duration: ZOOM_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    }, PHASE1_DURATION);

    // Après splash, lancer welcome
    let finishTimer: any;
    const timer2 = setTimeout(() => {
      setShowWelcome(true);
      // Welcome animation
      illustrationScale.value = withTiming(1.2, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      illustrationTranslateY.value = withTiming(-height * 0.065, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      textLogoTranslateY.value = withTiming(-(width * 0.5 + 140), {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      textLogoScale.value = withTiming(0.85, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      contentOpacity.value = withDelay(SLIDE_DURATION * 0.4,
        withTiming(1, { duration: FADE_DURATION })
      );
      buttonsTranslateY.value = withDelay(SLIDE_DURATION * 0.4,
        withTiming(0, {
          duration: FADE_DURATION,
          easing: Easing.out(Easing.back(1.5)),
        })
      );
      // Notify parent that splash/welcome sequence finished (once)
      finishTimer = setTimeout(() => {
        try {
          onFinish && onFinish();
        } catch (e) {
          // ignore
        }
      }, SLIDE_DURATION + FADE_DURATION + 50);
    }, PHASE1_DURATION + ZOOM_DURATION + PHASE2_DURATION);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (typeof finishTimer !== 'undefined') clearTimeout(finishTimer);
    };
  }, []);

  // Splash style
  const splashAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoomScale.value }],
  }));
  // Welcome styles
  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: showWelcome ? illustrationScale.value : zoomScale.value },
      { translateY: showWelcome ? illustrationTranslateY.value : 0 },
    ],
  }));
  const textLogoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: showWelcome ? textLogoTranslateY.value : 0 },
      { scale: showWelcome ? textLogoScale.value : zoomScale.value },
    ],
  }));
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  useEffect(() => {
    if (showWelcome && user) {
      // Rediriger automatiquement si l'utilisateur est connecté
      if (!user.is_complete) {
        router.replace('/(onboarding)/your-detail');
      } else if (!user.isVerified) {
        router.replace('/(onboarding)/verify-email');
      } else {
        router.replace('/(tabs)/explore');
      }
    }
  }, [showWelcome, user]);

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
    color: Colors.black,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.black,
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
    color: Colors.black,
    letterSpacing: 1,
  },
});