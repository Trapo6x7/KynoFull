import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

import { ProfileDetailView } from '@/src/components/profile';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useProfileData } from '@/src/hooks/useProfileData';
import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';
import Colors from '@/src/constants/colors';

export default function ProfileDetailScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    /** Pré-charger le nom depuis la carte pour éviter un flash */
    name?: string;
    mainImage?: string;
    /** Depuis le chat : on a déjà matché, cacher like/dislike */
    hideActions?: string;
  }>();

  const { userId, name: initialName, mainImage: initialImage } = params;
  const hideActions = params.hideActions === '1';

  const { user: currentUser } = useAuth();
  const { matchService } = useServices();
  const { user, isLoading } = useUserProfile(userId);
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
  const ownerName = user?.name ?? user?.firstName ?? initialName ?? '...';

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileDetailView
        mode="preview"
        type={showDog ? 'pet' : 'owner'}
        name={showDog ? (profileData.dog?.name ?? 'Chien') : ownerName}
        mainImage={showDog ? profileData.dogImages[0] : (profileData.ownerImages[0] ?? initialImage)}
        images={profileData.currentImages}
        keywords={profileData.currentKeywords}
        description={profileData.currentDescription}
        onBack={() => router.back()}
        onSubProfile={profileData.dog ? () => setShowDog((v) => !v) : undefined}
        subProfileIcon={showDog ? 'person-outline' : 'paw-outline'}
        subProfileLabel={showDog ? ownerName : profileData.dog?.name}
        onLike={hideActions ? undefined : async () => {
          if (userId) {
            try {
              const { isMatch } = await matchService.recordLike(Number(userId), currentUser?.id);
              if (isMatch) {
                router.navigate({
                  pathname: '/(tabs)/explore',
                  params: {
                    matchedUserId: userId,
                    matchedName: showDog ? (profileData.dog?.name ?? ownerName) : ownerName,
                    matchedImage: showDog ? profileData.dogImages[0] : (profileData.ownerImages[0] ?? initialImage ?? ''),
                  },
                });
                return;
              }
            } catch (e) {
              console.error('❌ Erreur like:', e);
            }
          }
          router.back();
        }}
        onDislike={hideActions ? undefined : async () => {
          if (userId) {
            try {
              await matchService.recordDislike(Number(userId), currentUser?.id);
            } catch (e) {
              console.error('❌ Erreur dislike:', e);
            }
          }
          router.back();
        }}
        onNext={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
