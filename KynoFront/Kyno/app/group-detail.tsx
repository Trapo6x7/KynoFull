import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

import { useServices } from '@/src/context/ServicesContext';
import { useAuth } from '@/src/context/AuthContext';
import ProfileDetailView from '@/components/ProfileDetailView';
import { API_CONFIG } from '@/src/config/api';
import Colors from '@/src/constants/colors';
import type { Group } from '@/src/types';

const toImageUrl = (filename: string) =>
  `${API_CONFIG.BASE_URL}/uploads/images/${filename}`;

export default function GroupDetailScreen() {
  const { chatService } = useServices();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const groupId = params.groupId ? Number(params.groupId) : null;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('hidden');
      return () => {
        if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('visible');
      };
    }, [])
  );

  useEffect(() => {
    if (!groupId) return;
    loadGroup(groupId);
  }, [groupId]);

  async function loadGroup(id: number) {
    try {
      const { default: groupService } = await import('@/src/services/groupService');
      const data = await groupService.getGroup(id);
      setGroup(data);
    } catch (e) {
      console.error('GroupDetailScreen: loadGroup error', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleChat() {
    if (!groupId) return;
    try {
      const conv = await chatService.getOrCreateGroupConversation(groupId);
      router.push({
        pathname: '/chat',
        params: {
          conversationId: conv.id,
          otherName: group?.name ?? 'Groupe',
          isGroup: '1',
        },
      } as any);
    } catch (e) {
      console.error('GroupDetailScreen: handleChat error', e);
    }
  }

  if (loading || !group) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Construire la liste des membres à afficher (nom uniquement)
  const members = (group.members ?? []).map((m) => ({
    id: m.id,
    name: m.user?.firstName ?? m.user?.name ?? `Membre #${m.id}`,
  }));

  const heroUri = group.image ? toImageUrl(group.image) : undefined;

  // Seul un membre actif peut ajouter d'autres membres
  const isCurrentUserMember = (group.members ?? []).some(
    (m) => m.user?.id === user?.id
  );

  return (
    <ProfileDetailView
      mode="group"
      name={group.name}
      mainImage={heroUri}
      images={heroUri ? [heroUri] : []}
      description={group.description}
      members={members}
      onBack={() => router.back()}
      onChat={handleChat}
      onAddMember={
        isCurrentUserMember
          ? () => {/* TODO: ouvrir selector d'ajout de membre */}
          : undefined
      }
      // Bouton top-right = fermer
      onSubProfile={() => router.back()}
      subProfileIcon="close"
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
