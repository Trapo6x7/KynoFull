import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dogService from '@/src/services/dogService';
import authService from '@/src/services/authService';
import emailService from '@/src/services/emailService';
import { useAuth } from '@/src/context/AuthContext';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Colors from '@/src/constants/colors';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 80) / 3;

export default function LocationScreen() {
  const { refreshUser, user: currentUser } = useAuth();
  const [images] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre localisation pour vous montrer les chiens à proximité.');
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Erreur de localisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('onboarding');
        const onboarding = stored ? JSON.parse(stored) : {};
        console.log('📦 Onboarding data:', JSON.stringify(onboarding, null, 2));

        // Get current user ID
        const userId = currentUser?.id;

        // Update user data (description, gender, profession, location)
        if (userId && (onboarding.userDetails || location)) {
          try {
            console.log('👤 Updating user data...');
            const updateData: any = {};
            
            if (onboarding.userDetails) {
              if (onboarding.userDetails.description) updateData.description = onboarding.userDetails.description;
              if (onboarding.userDetails.genre) updateData.gender = onboarding.userDetails.genre;
              if (onboarding.userDetails.profession) updateData.profession = onboarding.userDetails.profession;
            }
            
            // Ajouter les keywords utilisateur
            if (onboarding.userKeywords && onboarding.userKeywords.length > 0) {
              updateData.keywords = onboarding.userKeywords;
            }
            
            if (location) {
              // Try to resolve a human-readable city from coords
              try {
                const placemarks = await Location.reverseGeocodeAsync({ latitude: location.latitude, longitude: location.longitude });
                const placemark = placemarks && placemarks.length > 0 ? placemarks[0] : null;
                if (placemark) {
                  if (placemark.city) updateData.city = placemark.city;
                  else if (placemark.region) updateData.city = placemark.region;
                  else if (placemark.name) updateData.city = placemark.name;
                }
              } catch (e) {
                console.error('Erreur reverseGeocode:', e);
              }

              updateData.latitude = location.latitude.toString();
              updateData.longitude = location.longitude.toString();
            }
            
            if (Object.keys(updateData).length > 0) {
              await authService.updateUser(userId, updateData);
              console.log('✅ User data updated');
            }
          } catch (e: any) {
            console.error('❌ Erreur mise à jour user:', e);
            console.error('Response:', e.response?.data);
          }
        }

        // Upload all profile images if present
        if (onboarding.userImages && onboarding.userImages.length > 0) {
          console.log('📸 Uploading profile images...');
          for (const uri of onboarding.userImages) {
            try {
              await authService.updateProfileImage(uri);
              console.log('✅ Profile image uploaded:', uri);
            } catch (e: any) {
              console.error('❌ Erreur upload profile image:', e);
              console.error('Response:', e.response?.data);
            }
          }
        }

        // Create dog if pet data exists
        let createdDog: any = null;
        if (onboarding.pet) {
          try {
            const createData: any = {
              name: onboarding.pet.name,
              description: onboarding.pet.description,
              gender: onboarding.pet.genre,
            };
            
            // Add raceId only if provided
            if (onboarding.pet.raceId) {
              createData.raceId = onboarding.pet.raceId;
            }
            
            // Add size if provided
            if (onboarding.pet.taille) {
              createData.size = onboarding.pet.taille;
            }
            
            // Calculate birthDate from age if provided
            if (onboarding.pet.age) {
              const currentYear = new Date().getFullYear();
              const ageNumber = typeof onboarding.pet.age === 'string' 
                ? parseInt(onboarding.pet.age, 10) 
                : onboarding.pet.age;
              const birthYear = currentYear - ageNumber;
              // Backend expects ISO date format (YYYY-MM-DD)
              createData.birthDate = `${birthYear}-01-01`;
            }
            
            // Ajouter les keywords du chien
            if (onboarding.petKeywords && onboarding.petKeywords.length > 0) {
              createData.keywords = onboarding.petKeywords;
            }

            console.log('🐕 Creating dog with data:', JSON.stringify(createData, null, 2));
            createdDog = await dogService.createDog(createData);
            console.log('✅ Dog created:', createdDog);
          } catch (e: any) {
            console.error('❌ Erreur création chien:', e);
            console.error('Status:', e.response?.status);
            console.error('Data:', JSON.stringify(e.response?.data, null, 2));
            console.error('Headers:', e.response?.headers);
            Alert.alert(
              'Erreur',
              'Impossible de créer le profil de votre chien. Veuillez réessayer.',
              [{ text: 'OK' }]
            );
          }
        }

        // Upload pet images
        if (createdDog && onboarding.petImages && onboarding.petImages.length > 0) {
          for (const uri of onboarding.petImages) {
            try {
              await dogService.updateDogImage(createdDog.id, uri);
            } catch (e) {
              console.error('Erreur upload image chien:', e);
            }
          }
        }

        // Clear onboarding storage
        await AsyncStorage.removeItem('onboarding');

        // Rediriger vers la vérification d'email
        router.replace('/(onboarding)/verify-email');
      } catch (error) {
        console.error('Erreur finalisation onboarding:', error);
        router.replace('/(tabs)/explore');
      }
    })();
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Votre profil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <Text style={styles.title}>Votre Localisation</Text>
        <Text style={styles.subtitle}>
          Où vous promenez-vous ? Visible uniquement aux matches, vous pouvez désactiver la localisation à tout moment.
        </Text>

        {/* Grille d'images (preview) */}
        {/* <View style={styles.imageGrid}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageBox}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <View style={styles.cameraIcon}>
                    <Text style={styles.cameraIconText}>📷</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View> */}

        {/* Carte */}
        <View style={styles.mapContainer}>
          {isLoading ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color={Colors.buttonPrimary} />
              <Text style={[styles.mapPlaceholderText, { marginTop: 10 }]}>
                Chargement de votre position...
              </Text>
            </View>
          ) : location ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={location}
                title="Votre position"
              />
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                Localisation non disponible
              </Text>
            </View>
          )}
        </View>

        {/* Texte explicatif */}
        <Text style={styles.infoText}>
          En vous inscrivant à l'aide que pour y aller la définition (cette de limitation avec une application et via des résultats (le caractérisation a voué moment
        </Text>
      </ScrollView>

      {/* Bouton WOOF */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>WOOF !</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: Colors.black,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
    marginBottom: 25,
    lineHeight: 18,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  imageBox: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cameraIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconText: {
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
  },
  infoText: {
    fontSize: 10,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
    lineHeight: 14,
  },
  footer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    paddingBottom: 35,
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.black,
    letterSpacing: 1,
  },
});
