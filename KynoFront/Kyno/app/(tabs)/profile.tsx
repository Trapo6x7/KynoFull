import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

import { useAuth } from '@/src/context/AuthContext';
import { API_CONFIG } from '@/src/config/api';
import ProfileDetailView from '@/components/ProfileDetailView';
import BottomNav from '@/components/BottomNav';
import Colors from '@/src/constants/colors';

const toImageUrl = (filename: string) =>
  `${API_CONFIG.BASE_URL}/uploads/images/${filename}`;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showDog, setShowDog] = useState(false);

  // Masquer la navbar Android
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('hidden');
      return () => {
        if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('visible');
      };
    }, []),
  );

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  // ── Données owner ────────────────────────────────────────────────────────────
  const ownerImages: string[] = (user?.images ?? []).map(toImageUrl);
  const ownerKeywords: string[] = user?.keywords ?? [];

  // ── Données premier chien ────────────────────────────────────────────────────
  const dog = user?.dogs?.[0];
  const dogImages: string[] = (dog?.images ?? []).map(toImageUrl);
  const dogKeywords: string[] = dog?.keywords ?? [];

  if (showDog && dog) {
    return (
      <View style={styles.container}>
        <ProfileDetailView
          mode="me"
          type="pet"
          name={dog.name}
          images={dogImages}
          keywords={dogKeywords}
          description={dog.description}
          onBack={() => setShowDog(false)}
          onSubProfile={() => setShowDog(false)}
          subProfileIcon="person-outline"
          subProfileLabel="Moi"
        />
        <BottomNav activeTab="profile" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileDetailView
        mode="me"
        type="owner"
        name={user ? `${user.firstName}` : 'Mon profil'}
        images={ownerImages}
        keywords={ownerKeywords}
        description={user?.description}
        onBack={handleLogout}
        onEdit={() => router.push('/settings')}
        onSubProfile={dog ? () => setShowDog(true) : undefined}
        subProfileIcon="paw-outline"
        subProfileLabel={dog?.name}
      />
      <BottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
