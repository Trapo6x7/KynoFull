import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/src/constants/colors';
import { API_CONFIG } from '@/src/config/api';
import { timeAgo, getInitials } from '@/src/utils/formatters';
import type { Conversation } from '@/src/services/interfaces/IChatService';

interface ConversationItemProps {
  conversation: Conversation;
  myId: number;
  onPress: () => void;
  otherId?: number;
  otherImage?: string;
}

export function ConversationItem({ conversation, myId, onPress, otherId, otherImage }: ConversationItemProps) {
  const isGroup = conversation.type === 'group';

  let displayName: string;
  let avatarUri: string | null | undefined;
  let unread = 0;

  if (isGroup) {
    displayName = conversation.group?.name ?? 'Groupe';
  } else {
    const isP1 = conversation.participant1?.id === myId;
    const other = isP1 ? conversation.participant2 : conversation.participant1;
    displayName = other?.name ?? other?.firstName ?? 'Utilisateur';
    const img = other?.images?.[0];
    avatarUri = img ? `${API_CONFIG.BASE_URL}/uploads/images/${img}` : undefined;
    unread = isP1 ? conversation.unreadCount1 : conversation.unreadCount2;
  }

  const navigateToProfile = () => {
    if (otherId) {
      router.push({
        pathname: '/profile-detail',
        params: { userId: String(otherId), name: displayName, mainImage: otherImage ?? '', hideActions: '1' },
      } as any);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {isGroup ? (
          <View style={[styles.avatar, styles.avatarGroup]}>
            <Ionicons name="people" size={26} color={Colors.primaryDark} />
          </View>
        ) : avatarUri ? (
          <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.8}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.8}>
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.cardPreview} numberOfLines={2} ellipsizeMode="tail">
          {conversation.lastMessageContent ?? 'Commencer la conversation'}
        </Text>
      </View>

      {/* Right: time + badge */}
      <View style={styles.cardRight}>
        <Text style={styles.cardTime}>{timeAgo(conversation.lastMessageAt)}</Text>
        {!conversation.lastMessageContent ? (
          <View style={styles.newMatchBadge}>
            <Text style={styles.newMatchText}>Nouveau</Text>
          </View>
        ) : unread > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0d6e8',
  },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  avatarFallback: {
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGroup: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 18, fontWeight: '700', color: Colors.primaryDark },
  cardContent: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  cardPreview: { fontSize: 12, color: Colors.gray, lineHeight: 17 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'flex-start', gap: 6, paddingTop: 2 },
  cardTime: { fontSize: 12, color: Colors.gray },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  newMatchBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMatchText: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
});
