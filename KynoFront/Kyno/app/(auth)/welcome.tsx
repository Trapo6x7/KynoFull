import React, { useEffect } from 'react';
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
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import Colors from '@/src/constants/colors';

const { width, height } = Dimensions.get('window');

// Durées des animations
const SLIDE_DURATION = 600;   // Transition slide
const FADE_DURATION = 400;    // Fade in des éléments

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  
  // Animation de l'illustration (monte + scale)
  const illustrationTranslateY = useSharedValue(0);
  const illustrationScale = useSharedValue(1.4);
  
  // Animation du logo texte (monte + scale down)
  const textLogoTranslateY = useSharedValue(0);
  const textLogoScale = useSharedValue(1.4);
  
  // Animation du contenu
  const contentOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(50);
  
  useEffect(() => {
    // Dézoom et translation
    illustrationScale.value = withTiming(1.2, {
      duration: SLIDE_DURATION,
      easing: Easing.out(Easing.ease),
    });
    illustrationTranslateY.value = withTiming(-height * 0.065, {
      duration: SLIDE_DURATION,
      easing: Easing.out(Easing.ease),
    });
    
    // Le logo texte monte au-dessus de l'illustration
    textLogoTranslateY.value = withTiming(-(width * 0.5 + 140), {
      duration: SLIDE_DURATION,
      easing: Easing.out(Easing.ease),
    });
    textLogoScale.value = withTiming(0.85, {
      duration: SLIDE_DURATION,
      easing: Easing.out(Easing.ease),
    });
    
    // Fade in du contenu
    contentOpacity.value = withDelay(SLIDE_DURATION * 0.4, 
      withTiming(1, { duration: FADE_DURATION })
    );
    
    // Animation des boutons
    buttonsTranslateY.value = withDelay(SLIDE_DURATION * 0.4,
      withTiming(0, { 
        duration: FADE_DURATION,
        easing: Easing.out(Easing.back(1.5)),
      })
    );
  }, []);
  
  // Style animé pour l'illustration
  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: illustrationScale.value },
      { translateY: illustrationTranslateY.value },
    ],
  }));
  
  // Style animé pour le logo texte
  const textLogoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: textLogoTranslateY.value },
      { scale: textLogoScale.value },
    ],
  }));
  
  // Style animé pour le contenu
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));
  
  const handleLogin = () => {
    router.push('/(auth)/login');
  };
  
  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/Bgimage.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Conteneur centré pour logo + illustration */}
        <View style={styles.centerContainer}>
          {/* Illustration */}
          <Animated.View style={[styles.logoContainer, illustrationAnimatedStyle]}>
            <Image
              source={require('@/assets/images/kynoillustration.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Logo KYNO texte - au-dessus de l'illustration */}
          <Animated.View style={[styles.textLogoContainer, textLogoAnimatedStyle]}>
            <Image
              source={require('@/assets/images/kynologo.png')}
              style={styles.textLogo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
        
        {/* Contenu avec animation */}
        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
          {/* Titre */}
          <Text style={styles.title}>
            Rencontre & <Text style={styles.titleAccent}>Joue</Text>
          </Text>
          
          {/* Description */}
          <Text style={styles.description}>
            Kyno est une application qui met en relation chiens et propriétaires 
            pour organiser des sorties, des playdates ou des rencontres de 
            reproduction, en proposant des profils chiens détaillés, un 
            matching par race/âge/comportement et des outils de sécurité 
            pour les propriétaires.
          </Text>
          
          {/* Boutons */}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
