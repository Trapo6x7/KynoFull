import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/src/constants/colors';
import { API_CONFIG } from '@/src/config/api';
import { formatTime, getInitials } from '@/src/utils/formatters';
import type { Message } from '@/src/services/interfaces/IChatService';

interface MessageBubbleProps {
  item: Message;
  myId: number;
  myImagePath?: string | null;
  myName?: string | null;
  otherImage?: string | null;
  otherName?: string;
  isGroup?: boolean;
}

export function MessageBubble({
  item,
  myId,
  myImagePath,
  myName,
  otherImage,
  otherName,
  isGroup,
}: MessageBubbleProps) {
  const senderId: number | undefined =
    typeof item.sender === 'object' && item.sender !== null
      ? (item.sender as any).id
      : typeof item.sender === 'string'
        ? parseInt((item.sender as string).split('/').pop() ?? '', 10)
        : undefined;

  const isMe = senderId === myId;

  const avatarEl = isMe ? (
    myImagePath ? (
      <Image source={{ uri: `${API_CONFIG.BASE_URL}/uploads/images/${myImagePath}` }} style={styles.msgAvatar} />
    ) : (
      <View style={[styles.msgAvatar, styles.msgAvatarFallback]}>
        <Text style={styles.msgAvatarText}>{getInitials(myName)}</Text>
      </View>
    )
  ) : (
    otherImage ? (
      <Image source={{ uri: otherImage }} style={styles.msgAvatar} />
    ) : isGroup ? (
      <View style={[styles.msgAvatar, styles.msgAvatarGroup]}>
        <Ionicons name="people" size={14} color={Colors.primaryDark} />
      </View>
    ) : (
      <View style={[styles.msgAvatar, styles.msgAvatarFallback]}>
        <Text style={styles.msgAvatarText}>{getInitials(otherName)}</Text>
      </View>
    )
  );

  return (
    <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
      {!isMe && <View style={styles.msgAvatarSlot}>{avatarEl}</View>}
      <View style={styles.msgBubbleCol}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.msgTime, isMe ? styles.msgTimeMe : styles.msgTimeThem]}>
          {formatTime(item.createdAt)}{isMe ? (item.isRead ? ' ✓✓' : ' ✓') : ''}
        </Text>
      </View>
      {isMe && <View style={styles.msgAvatarSlot}>{avatarEl}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  msgAvatarSlot: { width: 32 },
  msgAvatar: { width: 32, height: 32, borderRadius: 16 },
  msgAvatarFallback: {
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarGroup: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  msgAvatarText: { fontSize: 11, fontWeight: '700', color: Colors.primaryDark },
  msgBubbleCol: { maxWidth: '72%', gap: 3 },
  bubble: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleTextThem: { color: '#1a1a1a' },
  msgTime: { fontSize: 10, color: Colors.gray },
  msgTimeMe: { textAlign: 'right' },
  msgTimeThem: { textAlign: 'left' },
});
