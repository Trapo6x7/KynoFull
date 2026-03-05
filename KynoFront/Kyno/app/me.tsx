import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';
import { API_CONFIG } from '@/src/config/api';
import ProfileDetailView from '@/components/ProfileDetailView';
import Colors from '@/src/constants/colors';

const toImageUrl = (filename: string) =>
  `${API_CONFIG.BASE_URL}/uploads/images/${filename}`;

export default function MeScreen() {
  const { user, refreshUser } = useAuth();
  const { authService } = useServices();
  /** true = on affiche le chien, false = on affiche l'owner */
  const [showDog, setShowDog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('hidden');
      return () => {
        if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('visible');
      };
    }, []),
  );

  const dog = user?.dogs?.[0];

  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire pour ajouter une photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (result.canceled || !result.assets[0]) return;
    setUploadingImage(true);
    try {
      await authService.updateProfileImage(result.assets[0].uri);
      await refreshUser();
    } catch {
      Alert.alert('Erreur', 'Impossible d\'uploader la photo. Réessaie.');
    } finally {
      setUploadingImage(false);
    }
  };

  const ownerImages = (user?.images ?? []).map(toImageUrl);
  const ownerKeywords = user?.keywords ?? [];

  const dogImages = (dog?.images ?? []).map(toImageUrl);
  const dogKeywords = dog?.keywords ?? [];

  return (
    <View style={styles.container}>
      <ProfileDetailView
        mode="me"
        type={showDog ? 'pet' : 'owner'}
        name={showDog ? (dog?.name ?? 'Mon chien') : (user?.name ?? user?.firstName ?? 'Mon profil')}
        images={showDog ? dogImages : ownerImages}
        keywords={showDog ? dogKeywords : ownerKeywords}
        description={showDog ? dog?.description : user?.description}
        onBack={() => router.back()}
        onEdit={() => router.push('/settings/edit-profile')}
        onSettings={() => router.push('/settings' as any)}
        onAddImage={handleAddImage}
        /* Paw toggle — même système que la carte */
        onSubProfile={dog ? () => setShowDog((v) => !v) : undefined}
        subProfileIcon={showDog ? 'person-outline' : 'paw-outline'}
        subProfileLabel={showDog ? (user?.name ?? user?.firstName) : dog?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
