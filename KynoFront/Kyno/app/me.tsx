import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';
import { ProfileDetailView } from '@/src/components/profile';
import { useProfileData } from '@/src/hooks/useProfileData';
import { useImageUpload } from '@/src/hooks/useImageUpload';
import Colors from '@/src/constants/colors';

export default function MeScreen() {
  const { user, refreshUser } = useAuth();
  const { authService } = useServices();
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
  const { handleAddImage } = useImageUpload(async (uri) => {
    await authService.updateProfileImage(uri);
    await refreshUser();
  });

  return (
    <View style={styles.container}>
      <ProfileDetailView
        mode="me"
        type={showDog ? 'pet' : 'owner'}
        name={profileData.currentName}
        images={profileData.currentImages}
        keywords={profileData.currentKeywords}
        description={profileData.currentDescription}
        onBack={() => router.back()}
        onEdit={() => router.push('/settings/edit-profile')}
        onSettings={() => router.push('/settings' as any)}
        onAddImage={handleAddImage}
        onSubProfile={profileData.dog ? () => setShowDog((v) => !v) : undefined}
        subProfileIcon={showDog ? 'person-outline' : 'paw-outline'}
        subProfileLabel={showDog ? profileData.ownerName : profileData.dog?.name}
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
