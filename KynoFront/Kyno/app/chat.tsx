import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Modal,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/src/constants/colors';
import { useServices } from '@/src/context/ServicesContext';
import { useAuth } from '@/src/context/AuthContext';
import { API_CONFIG } from '@/src/config/api';
import type { Message } from '@/src/services/interfaces/IChatService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

// ─── ChatScreen ───────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { chatService } = useServices();
  const { user } = useAuth();

  const params = useLocalSearchParams<{
    conversationId?: string;
    otherName?: string;
    otherImage?: string;
    isGroup?: string;
  }>();

  const conversationId = params.conversationId ? Number(params.conversationId) : null;
  const otherName = params.otherName ?? 'Utilisateur';
  const otherImage = params.otherImage ?? null;
  const isGroup = params.isGroup === '1';

  const [messages, setMessages]       = useState<Message[]>([]);
  const [loading, setLoading]         = useState(true);
  const [sending, setSending]         = useState(false);
  const [draft, setDraft]             = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const flatRef = useRef<FlatList>(null);
  const myId = user?.id ?? 0;

  // ── Load messages ────────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
    } catch (e) {
      console.error('ChatScreen: loadMessages error', e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // ── Send message ─────────────────────────────────────────────────────────
  async function handleSend() {
    const text = draft.trim();
    if (!text || !conversationId || sending) return;

    setDraft('');
    setSending(true);
    try {
      const msg = await chatService.sendMessage(conversationId, text);
      setMessages(prev => [...prev, msg]);
    } catch (e) {
      console.error('ChatScreen: sendMessage error', e);
      // Remettre le brouillon en cas d'erreur
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  // ── Render bubble ─────────────────────────────────────────────────────────
  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isMe = item.sender.id === myId;

    const avatarEl = isMe ? (
      user?.image ? (
        <Image source={{ uri: `${API_CONFIG.BASE_URL}/uploads/images/${user.image}` }} style={styles.msgAvatar} />
      ) : (
        <View style={[styles.msgAvatar, styles.msgAvatarFallback]}>
          <Text style={styles.msgAvatarText}>{getInitials(user?.name)}</Text>
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
  }, [myId, user, otherName, otherImage, isGroup]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{otherName}</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primaryDark} style={styles.loader} />
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={item => String(item.id)}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={48} color={Colors.grayLight} />
                <Text style={styles.emptyText}>Envoyez le premier message !</Text>
              </View>
            }
          />
        )}

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <View style={styles.inputPill}>
            <Ionicons name="mic-outline" size={20} color={Colors.gray} style={styles.micIcon} />
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Écrivez ici..."
              placeholderTextColor={Colors.gray}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!draft.trim() || sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Modale "..." ── */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setMenuVisible(false)}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons name="flag-outline" size={18} color={Colors.primaryDark} />
              </View>
              <Text style={styles.menuText}>Signaler</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setMenuVisible(false)}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons name="ban-outline" size={18} color={Colors.primaryDark} />
              </View>
              <Text style={styles.menuText}>Bloquer</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setMenuVisible(false)}
            >
              <View style={[styles.menuIconCircle, styles.menuIconDanger]}>
                <Ionicons name="trash-outline" size={18} color={Colors.primaryDark} />
              </View>
              <Text style={styles.menuText}>Suppression</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    paddingTop: STATUS_H,
  },
  flex: { flex: 1 },

  // ── Header ───────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  // ── List ─────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  loader: { marginTop: 40 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: { fontSize: 15, color: Colors.gray },

  // ── Message row ───────────────────────
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowMe:   { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },

  msgAvatarSlot: { width: 32 },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
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
  msgAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  msgBubbleCol: {
    maxWidth: '72%',
    gap: 3,
  },

  // ── Bubbles ──────────────────────────
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText:     { fontSize: 14, lineHeight: 20 },
  bubbleTextMe:   { color: '#fff' },
  bubbleTextThem: { color: '#1a1a1a' },

  msgTime:     { fontSize: 10, color: Colors.gray },
  msgTimeMe:   { textAlign: 'right' },
  msgTimeThem: { textAlign: 'left' },

  // ── Input bar ────────────────────────
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: Colors.primaryLight,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  micIcon: { marginRight: 2 },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 110,
    fontSize: 14,
    color: '#1a1a1a',
    paddingVertical: 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.grayLight },

  // ── Modale menu ──────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: STATUS_H + 60,
    paddingRight: 16,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 6,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: Colors.buttonPrimary,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
});
