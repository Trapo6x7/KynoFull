import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

import Colors from '@/src/constants/colors';
import { API_CONFIG } from '@/src/config/api';
import { getInitials } from '@/src/utils/formatters';
import type { Conversation } from '@/src/services/interfaces/IChatService';

interface MatchBubbleProps {
  conversation: Conversation;
  myId: number;
  onPress: () => void;
}

export function MatchBubble({ conversation, myId, onPress }: MatchBubbleProps) {
  const isP1 = conversation.participant1?.id === myId;
  const other = isP1 ? conversation.participant2 : conversation.participant1;
  const img = other?.images?.[0];
  const avatarUri = img ? `${API_CONFIG.BASE_URL}/uploads/images/${img}` : undefined;
  const name = other?.firstName ?? other?.name ?? 'Utilisateur';
  const firstName = name.split(' ')[0];

  return (
    <TouchableOpacity style={styles.matchBubble} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.matchAvatarRing}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.matchAvatar} />
        ) : (
          <View style={[styles.matchAvatar, styles.matchAvatarFallback]}>
            <Text style={styles.matchInitials}>{getInitials(name)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.matchName} numberOfLines={1}>{firstName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  matchBubble: { alignItems: 'center', width: 72 },
  matchAvatarRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    padding: 2,
    marginBottom: 6,
  },
  matchAvatar: { width: 61, height: 61, borderRadius: 31 },
  matchAvatarFallback: {
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInitials: { fontSize: 18, fontWeight: '700', color: Colors.primaryDark },
  matchName: { fontSize: 12, fontWeight: '600', color: Colors.grayDark, textAlign: 'center' },
});
