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
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/src/constants/colors';
import { useServices } from '@/src/context/ServicesContext';
import { useAuth } from '@/src/context/AuthContext';
import { MessageBubble } from '@/src/components/chat/MessageBubble';
import type { Message } from '@/src/services/interfaces/IChatService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

// ─── ChatScreen ───────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { chatService } = useServices();
  const { user } = useAuth();

  const params = useLocalSearchParams<{
    conversationId?: string;
    otherName?: string;
    otherImage?: string;
    otherId?: string;
    isGroup?: string;
  }>();

  const conversationId = params.conversationId ? Number(params.conversationId) : null;
  const otherName = params.otherName ?? 'Utilisateur';
  const otherImage = params.otherImage ?? null;
  const otherId = params.otherId ? Number(params.otherId) : null;
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
      // Remettre le compteur non lu à 0 pour l'utilisateur courant
      chatService.markConversationAsRead(conversationId).catch(e => console.error('[chat] markConversationAsRead failed:', e));
    } catch (e) {
      console.error('ChatScreen: loadMessages error', e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // ── Polling toutes les 5 s pour voir les nouveaux messages ───────────────
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => {
      chatService.getMessages(conversationId).then(data => setMessages(data)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

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
      // S'assurer que notre propre compteur reste à 0 après envoi
      chatService.markConversationAsRead(conversationId).catch(e => console.error('[chat] markConversationAsRead failed:', e));
    } catch (e) {
      console.error('ChatScreen: sendMessage error', e);
      // Remettre le brouillon en cas d'erreur
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  // ── Render bubble ─────────────────────────────────────────────────────────
  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <MessageBubble
      item={item}
      myId={myId}
      myImagePath={user?.images?.[0] ?? null}
      myName={user?.name}
      otherImage={otherImage}
      otherName={otherName}
      isGroup={isGroup}
    />
  ), [myId, user, otherName, otherImage, isGroup]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerCenter}
          activeOpacity={otherId && !isGroup ? 0.7 : 1}
          onPress={() => {
            if (otherId && !isGroup) {
              router.push({ pathname: '/profile-detail', params: { userId: String(otherId), name: otherName, mainImage: otherImage ?? '', hideActions: '1' } } as any);
            }
          }}
        >
          {!isGroup && (
            otherImage ? (
              <Image source={{ uri: otherImage }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
                <Text style={styles.headerAvatarText}>{otherName[0]?.toUpperCase() ?? '?'}</Text>
              </View>
            )
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>{otherName}</Text>
        </TouchableOpacity>

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
              onPress={() => {
                setMenuVisible(false);
                Alert.alert('Signaler', 'Fonctionnalité bientôt disponible.');
              }}
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
              onPress={() => {
                setMenuVisible(false);
                Alert.alert('Bloquer', 'Fonctionnalité bientôt disponible.');
              }}
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
              onPress={() => {
                setMenuVisible(false);
                Alert.alert('Suppression', 'Fonctionnalité bientôt disponible.');
              }}
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
    backgroundColor: Colors.background,
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
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarFallback: {
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  headerTitle: {
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

  // ── Input bar ────────────────────────
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: Colors.background,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
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
