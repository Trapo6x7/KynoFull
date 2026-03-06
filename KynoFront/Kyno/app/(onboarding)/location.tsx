import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Colors from '@/src/constants/colors';
import { useOnboardingFinish } from '@/src/hooks/useOnboardingFinish';

export default function LocationScreen() {
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleFinish = useOnboardingFinish(location);

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
    } catch {
      // silently fail — location stays null
    } finally {
      setIsLoading(false);
    }
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
    color: Colors.grayDark,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.grayDark,
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
    color: Colors.grayDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: Colors.grayDark,
    marginBottom: 25,
    lineHeight: 18,
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
    color: Colors.grayDark,
    letterSpacing: 1,
  },
});
