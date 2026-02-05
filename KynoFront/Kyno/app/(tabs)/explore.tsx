import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.55;

interface Match {
  id: number;
  type: 'user' | 'dog';
  name: string;
  dogName?: string;
  distance: string;
  mainImage: string;
  additionalImages: string[];
  totalImages: number;
}

export default function ExploreScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const radarRotation = new Animated.Value(0);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden');
      }
      return () => {
        if (Platform.OS === 'android') {
          NavigationBar.setVisibilityAsync('visible');
        }
      };
    }, [])
  );

  useEffect(() => {
    // Animation du radar qui tourne
    Animated.loop(
      Animated.timing(radarRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Simuler le chargement des données
    setTimeout(() => {
      loadMatches();
    }, 2000);
  }, []);

  const loadMatches = () => {
    // TODO: Appeler l'API pour récupérer les matches
    const mockMatches: Match[] = [];
    setMatches(mockMatches);
    setIsLoading(false);
  };

  const spin = radarRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePass = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
      setIsLoading(true);
      setTimeout(() => loadMatches(), 1500);
    }
  };

  const handleLike = () => {
    // TODO: Envoyer le like à l'API
    console.log('Like:', matches[currentIndex]?.id);
    handlePass();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconLeft}>
            <Image 
              source={require('@/assets/images/dogillustration2.png')}
              style={styles.headerDogIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconRight} onPress={handleSettings}>
            <Ionicons name="options-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <Animated.Image
            source={require('@/assets/images/Radar.png')}
            style={[styles.radarImage, { transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/images/dogillustration2.png')}
            style={styles.loadingDog}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="paw" size={28} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="person-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="location-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconLeft}>
            <Image 
              source={require('@/assets/images/dogillustration2.png')}
              style={styles.headerDogIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconRight} onPress={handleSettings}>
            <Ionicons name="options-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Image
              source={require('@/assets/images/dogillustration2.png')}
              style={styles.emptyDog}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.emptyText}>
            Oups ! Aucun résultat pour le moment{'\n'}Reviens plus tard !
          </Text>
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="paw" size={28} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="person-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="location-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header icons only */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconLeft}>
          <Image 
            source={require('@/assets/images/dogillustration2.png')}
            style={styles.headerDogIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconRight} onPress={handleSettings}>
          <Ionicons name="options-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Profile info top - outside card */}
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: currentMatch.mainImage }}
              style={styles.profileImage}
            />
            <View>
              <Text style={styles.profileName}>{currentMatch.name}</Text>
              <Text style={styles.profileDistance}>{currentMatch.distance}</Text>
            </View>
          </View>

          {/* Main image */}
          <Image
            source={{ uri: currentMatch.mainImage }}
            style={styles.cardMainImage}
          />

          {/* Overlay info */}
          <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle}>
              {currentMatch.dogName} & <Text style={styles.cardTitleAccent}>{currentMatch.name}</Text>
            </Text>
            <View style={styles.additionalImagesContainer}>
              {currentMatch.additionalImages.slice(0, 2).map((img, index) => (
                <View key={index} style={styles.additionalImage}>
                  <View style={styles.additionalImagePlaceholder} />
                </View>
              ))}
              {currentMatch.totalImages > 2 && (
                <View style={[styles.additionalImage, styles.additionalImageLast]}>
                  <Text style={styles.additionalImageCount}>
                    +{currentMatch.totalImages - 2}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePass}>
          <Ionicons name="close" size={32} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
          <Ionicons name="heart" size={32} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
          <Ionicons name="refresh" size={28} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="paw" size={28} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chatbubble-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="location-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="settings-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.gray,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconLeft: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: Colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconRight: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: Colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDogIcon: {
    width: 30,
    height: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  radarImage: {
    width: 200,
    height: 200,
    position: 'absolute',
  },
  loadingDog: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyDog: {
    width: 120,
    height: 120,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 5,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 30,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  profileImage: {
    marginTop: 6,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
  },
  profileDistance: {
    fontSize: 14,
    color: Colors.gray,
  },
  cardMainImage: {
    width: '100%',
    height: CARD_HEIGHT,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    paddingBottom: 30,
    backgroundColor: 'linear-gradient(transparent, rgba(0, 0, 0, 0.6))',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 15,
  },
  cardTitleAccent: {
    color: Colors.primary,
  },
  additionalImagesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  additionalImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  additionalImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  additionalImageLast: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalImageCount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: Colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: Colors.buttonPrimary,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.buttonPrimary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  navButton: {
    padding: 10,
  },
});
