import React, { useEffect, useState } from 'react';
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

const { width, height } = Dimensions.get('window');

// Durées des animations
const PHASE1_DURATION = 1500; // Loader 1 affiché
const ZOOM_DURATION = 800;    // Transition zoom (phase 1 -> 2)
const PHASE2_DURATION = 1000; // Loader 2 affiché
const SLIDE_DURATION = 600;   // Transition slide (phase 2 -> 3)
const FADE_DURATION = 400;    // Fade in des éléments

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  
  // Charger la police Manrope
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  
  // Valeurs d'animation communes (illustration + logo zooment ensemble)
  const zoomScale = useSharedValue(1);
  
  // Animation spécifique à l'illustration (phase 3)
  const illustrationTranslateY = useSharedValue(0);
  const illustrationScale = useSharedValue(1);
  
  // Animation spécifique au logo texte (phase 3: translate vers le haut + scale down)
  const textLogoTranslateY = useSharedValue(0);
  const textLogoScale = useSharedValue(1);
  
  // Animation du contenu phase 3
  const contentOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(50);
  
  useEffect(() => {
    // Phase 1 -> Phase 2 : Zoom sur l'illustration ET le logo ensemble (sans dézoom)
    const timer1 = setTimeout(() => {
      zoomScale.value = withTiming(1.4, { 
        duration: ZOOM_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
      
      setTimeout(() => {
        runOnJS(setPhase)(2);
        // Pas de dézoom, on reste à 1.4
      }, ZOOM_DURATION);
    }, PHASE1_DURATION);
    
    // Phase 2 -> Phase 3 : Tout se recentre, le logo monte au-dessus de l'illustration
    const timer2 = setTimeout(() => {
      // Léger dézoom mais on reste assez grand
      zoomScale.value = withTiming(1.25, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      
      // Le logo texte translate vers le haut (doit passer AU-DESSUS de l'illustration)
      // Il part du bas de l'illustration, donc doit monter beaucoup plus
      textLogoTranslateY.value = withTiming(-(width * 0.5 + 140), {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      textLogoScale.value = withTiming(0.85, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      
      // L'illustration monte légèrement
      illustrationScale.value = withTiming(1.2, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      illustrationTranslateY.value = withTiming(-height * 0.065, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.ease),
      });
      
      // Changer la phase après le début de l'animation
      setTimeout(() => {
        runOnJS(setPhase)(3);
      }, SLIDE_DURATION * 0.3);
      
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
    }, PHASE1_DURATION + ZOOM_DURATION + PHASE2_DURATION);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  // Style animé pour le conteneur centré (zoom phases 1-2, puis dézoom phase 3)
  const centerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoomScale.value }],
  }));
  
  // Style animé pour l'illustration (scale + translation en phase 3)
  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: illustrationScale.value },
      { translateY: illustrationTranslateY.value },
    ],
  }));
  
  // Style animé pour le logo texte (translate vers le haut + scale down en phase 3)
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
        {/* Conteneur centré pour logo + illustration (toutes les phases) */}
        <Animated.View style={[styles.centerContainer, centerAnimatedStyle]}>
          {/* Illustration */}
          <Animated.View style={[styles.logoContainer, illustrationAnimatedStyle]}>
            <Image
              source={require('@/assets/images/kynoillustration.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Logo KYNO texte - en dessous de l'illustration */}
          <Animated.View style={[styles.textLogoContainer, textLogoAnimatedStyle]}>
            <Image
              source={require('@/assets/images/kynologo.png')}
              style={styles.textLogo}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
        
        {/* Contenu Phase 3 */}
        {phase === 3 && (
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
  // Conteneur pour centrer les deux éléments ensemble (flex column)
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
