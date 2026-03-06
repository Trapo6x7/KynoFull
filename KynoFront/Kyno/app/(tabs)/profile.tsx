import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

import { useAuth } from '@/src/context/AuthContext';
import { ProfileDetailView } from '@/src/components/profile';
import { useProfileData } from '@/src/hooks/useProfileData';
import BottomNav from '@/src/components/BottomNav';
import Colors from '@/src/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showDog, setShowDog] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('hidden');
      return () => {
        if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('visible');
      };
    }, []),
  );

  const profileData = useProfileData(user, showDog);

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

  if (showDog && profileData.dog) {
    return (
      <View style={styles.container}>
        <ProfileDetailView
          mode="me"
          type="pet"
          name={profileData.dog.name}
          images={profileData.dogImages}
          keywords={profileData.dogKeywords}
          description={profileData.dog.description}
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
        name={profileData.ownerName}
        images={profileData.ownerImages}
        keywords={profileData.ownerKeywords}
        description={user?.description}
        onBack={router.canGoBack() ? () => router.back() : handleLogout}
        onEdit={() => router.push('/settings/edit-profile')}
        onSubProfile={profileData.dog ? () => setShowDog(true) : undefined}
        subProfileIcon="paw-outline"
        subProfileLabel={profileData.dog?.name}
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
