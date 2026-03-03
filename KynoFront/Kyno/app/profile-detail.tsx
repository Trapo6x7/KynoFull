import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

import ProfileDetailView from '@/components/ProfileDetailView';
import Colors from '@/src/constants/colors';
import { API_CONFIG } from '@/src/config/api';
import type { User } from '@/src/types';
import apiClient from '@/src/services/api';
import { useAuth } from '@/src/context/AuthContext';
import { useServices } from '@/src/context/ServicesContext';

const toImageUrl = (filename: string) =>
  `${API_CONFIG.BASE_URL}/uploads/images/${filename}`;

export default function ProfileDetailScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    /** Pré-charger le nom depuis la carte pour éviter un flash */
    name?: string;
    mainImage?: string;
  }>();

  const { userId, name: initialName, mainImage: initialImage } = params;

  const { user: currentUser } = useAuth();
  const { matchService } = useServices();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  /** toggle paw — même système que la carte */
  const [showDog, setShowDog] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('hidden');
      return () => {
        if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('visible');
      };
    }, []),
  );

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await apiClient.get(`/api/users/${userId}`);
        setUser(res.data);
      } catch {
        // fallback : on affiche avec les données initiales
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  const dog = user?.dogs?.[0];
  const ownerName = user?.name ?? user?.firstName ?? initialName ?? '...';

  const ownerImages = (user?.images ?? []).map(toImageUrl);
  const ownerKeywords = user?.keywords ?? [];

  const dogImages = (dog?.images ?? []).map(toImageUrl);
  const dogKeywords = dog?.keywords ?? [];

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
        name={showDog ? (dog?.name ?? 'Chien') : ownerName}
        mainImage={showDog ? dogImages[0] : (ownerImages[0] ?? initialImage)}
        images={showDog ? dogImages : ownerImages}
        keywords={showDog ? dogKeywords : ownerKeywords}
        description={showDog ? dog?.description : user?.description}
        onBack={() => router.back()}
        /* Paw toggle — même système que la carte */
        onSubProfile={dog ? () => setShowDog((v) => !v) : undefined}
        subProfileIcon={showDog ? 'person-outline' : 'paw-outline'}
        subProfileLabel={showDog ? ownerName : dog?.name}
        onLike={async () => {
          if (userId) {
            try {
              const { isMatch } = await matchService.recordLike(Number(userId), currentUser?.id);
              if (isMatch) {
                // Retour vers explore avec les infos du match pour afficher la modale
                router.navigate({
                  pathname: '/(tabs)/explore',
                  params: {
                    matchedUserId: userId,
                    matchedName: showDog ? (dog?.name ?? ownerName) : ownerName,
                    matchedImage: showDog ? dogImages[0] : (ownerImages[0] ?? initialImage ?? ''),
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
        onDislike={async () => {
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
