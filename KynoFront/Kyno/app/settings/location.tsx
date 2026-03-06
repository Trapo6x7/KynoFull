import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsLayout from '@/src/components/SettingsLayout';
import * as Location from 'expo-location';
import Colors from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';

export default function LocationScreen() {
  const { user, refreshUser } = useAuth();
  const { authService } = useServices();

  const [city, setCity] = useState(user?.city ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseGPS = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', "L'accès à la localisation est nécessaire.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const detectedCity = geo?.city ?? geo?.subregion ?? '';
      setCity(detectedCity);

      if (user) {
        setIsSaving(true);
        await authService.updateUser(user.id, {
          city: detectedCity,
          latitude: String(loc.coords.latitude),
          longitude: String(loc.coords.longitude),
        });
        await refreshUser();
        Alert.alert('Localisation mise à jour', `Ville détectée : ${detectedCity || 'inconnue'}`);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de récupérer votre position.');
    } finally {
      setIsLocating(false);
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await authService.updateUser(user.id, { city });
      await refreshUser();
      Alert.alert('Succès', 'Votre ville a été mise à jour.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la ville.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsLayout title="Ma localisation">
      <View style={styles.content}>
        {/* Icon + description */}
        <View style={styles.iconWrapper}>
          <Ionicons name="location" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.description}>
          Votre localisation permet de trouver des promeneurs près de chez vous.
        </Text>

        {/* GPS button */}
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleUseGPS}
          disabled={isLocating || isSaving}
        >
          {isLocating ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="navigate" size={20} color={Colors.grayDark} style={{ marginRight: 8 }} />
              <Text style={styles.gpsButtonText}>Utiliser ma position actuelle</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* City input */}
        <Text style={styles.label}>Entrez votre ville manuellement</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Paris, Lyon, Marseille..."
          placeholderTextColor={Colors.gray}
          autoCapitalize="words"
        />

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, (isSaving || !city.trim()) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || !city.trim()}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>ENREGISTRER</Text>
          )}
        </TouchableOpacity>
      </View>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconWrapper: {
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  gpsButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  gpsButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.grayDark,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grayLight,
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.gray,
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.grayDark,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.grayDark,
    letterSpacing: 1,
  },
});
