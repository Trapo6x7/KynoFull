import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/src/constants/colors';
import { API_CONFIG } from '@/src/config/api';
import type { MatchViewModel } from '@/src/hooks/useMatches';

const { width } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  matchedUser: MatchViewModel | null;
  matchConversationId: number | null;
  currentUserImageUri: string | null;
  matchScale: Animated.Value;
  heartPulse: Animated.Value;
  onClose: () => void;
  onSendMessage: () => void;
}

export function MatchModal({
  visible,
  matchedUser,
  matchConversationId,
  currentUserImageUri,
  matchScale,
  heartPulse,
  onClose,
  onSendMessage,
}: MatchModalProps) {
  if (!visible || !matchedUser) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.modal, { transform: [{ scale: matchScale }] }]}>
        <Text style={styles.title}>C'est un match !</Text>

        <View style={styles.imagesContainer}>
          <Image
            source={{
              uri: currentUserImageUri ?? 'https://via.placeholder.com/150',
            }}
            style={styles.matchImage}
          />
          <Animated.View style={{ transform: [{ scale: heartPulse }] }}>
            <Ionicons name="heart" size={40} color={Colors.primary} style={styles.heart} />
          </Animated.View>
          <Image source={{ uri: matchedUser.mainImage }} style={styles.matchImage} />
        </View>

        <Text style={styles.matchText}>
          Vous et {matchedUser.name} vous êtes dans la même meute !
        </Text>

        <TouchableOpacity
          style={styles.btnMsg}
          onPress={onSendMessage}
          disabled={!matchConversationId}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.btnMsgText}>Envoyer un message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnContinue} onPress={onClose}>
          <Text style={styles.btnContinueText}>Continuer</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    width: width * 0.85,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  title: { fontSize: 28, fontWeight: '700', color: Colors.grayDark, marginBottom: 30 },
  imagesContainer: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 30 },
  matchImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.primary },
  heart: { marginHorizontal: 10 },
  matchText: { fontSize: 16, color: Colors.gray, textAlign: 'center', marginBottom: 30 },
  btnMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDark,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 12,
    minWidth: 220,
  },
  btnMsgText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnContinue: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    minWidth: 220,
    alignItems: 'center',
  },
  btnContinueText: { color: Colors.grayDark, fontSize: 16, fontWeight: '600' },
});
