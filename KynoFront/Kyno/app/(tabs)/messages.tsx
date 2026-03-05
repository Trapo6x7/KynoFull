import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/src/constants/colors';
import BottomNav from '@/components/BottomNav';
import { useServices } from '@/src/context/ServicesContext';
import { useAuth } from '@/src/context/AuthContext';
import { API_CONFIG } from '@/src/config/api';
import type { Conversation } from '@/src/services/interfaces/IChatService';

// --- Helpers -------------------------------------------------------------------

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "A l'instant";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} j`;
}

function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

// --- ConversationItem ----------------------------------------------------------

interface ConversationItemProps {
  conversation: Conversation;
  myId: number;
  onPress: () => void;
  otherId?: number;
  otherImage?: string;
}

function ConversationItem({ conversation, myId, onPress, otherId, otherImage }: ConversationItemProps) {
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
    // unreadCount2 = messages non lus par moi (participant1)
    unread = isP1 ? conversation.unreadCount2 : conversation.unreadCount1;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {isGroup ? (
          <View style={[styles.avatar, styles.avatarGroup]}>
            <Ionicons name="people" size={26} color={Colors.primaryDark} />
          </View>
        ) : avatarUri ? (
          <TouchableOpacity
            onPress={() => otherId && router.push({ pathname: '/profile-detail', params: { userId: String(otherId), name: displayName, mainImage: otherImage ?? '' } } as any)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => otherId && router.push({ pathname: '/profile-detail', params: { userId: String(otherId), name: displayName, mainImage: otherImage ?? '' } } as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenu */}
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardName, { marginRight: 8 }]} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.cardTime}>{timeAgo(conversation.lastMessageAt)}</Text>
        </View>
        <Text style={styles.cardPreview} numberOfLines={2} ellipsizeMode="tail">
          {conversation.lastMessageContent ?? 'Commencer la conversation'}
        </Text>
      </View>

      {/* Badge droite */}
      <View style={styles.cardBadgeWrapper}>
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

// --- MatchBubble ---------------------------------------------------------------

function MatchBubble({ conversation, myId, onPress }: { conversation: Conversation; myId: number; onPress: () => void }) {
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

// --- MessagesScreen ------------------------------------------------------------

export default function MessagesScreen() {
  const { chatService } = useServices();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        NavigationBar.setBackgroundColorAsync(Colors.buttonPrimary);
      }
      loadConversations();
    }, [])
  );

  async function loadConversations() {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (e) {
      console.error('MessagesScreen: loadConversations error', e);
    } finally {
      setLoading(false);
    }
  }

  const myId = user?.id ?? 0;

  const newMatches = conversations.filter(c => c.type !== 'group' && !c.lastMessageContent);
  const activeConvos = conversations.filter(c => c.type === 'group' || !!c.lastMessageContent);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Message</Text>
        <TouchableOpacity style={styles.headerSearch} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={56} color={Colors.grayLight} />
          <Text style={styles.emptyTitle}>Aucune conversation</Text>
          <Text style={styles.emptySubtitle}>Likez des profils pour commencer a discuter !</Text>
        </View>
      ) : (
        <>
          {/* ── Nouveaux Matchs ── */}
          {newMatches.length > 0 && (
            <View style={styles.matchesSection}>
              <Text style={styles.sectionTitle}>Nouveaux Matchs</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.matchesRow}
              >
                {newMatches.map(conv => (
                  <MatchBubble
                    key={conv.id}
                    conversation={conv}
                    myId={myId}
                    onPress={() => {
                      const isP1 = conv.participant1?.id === myId;
                      const other = isP1 ? conv.participant2 : conv.participant1;
                      const name = other?.firstName ?? other?.name ?? 'Utilisateur';
                      const img = other?.images?.[0];
                      const otherImage = img ? `${API_CONFIG.BASE_URL}/uploads/images/${img}` : undefined;
                      router.push({
                        pathname: '/chat',
                        params: { conversationId: conv.id, otherName: name, otherImage, isGroup: '0' },
                      } as any);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Messages ── */}
          {activeConvos.length > 0 && (
            <View style={styles.messagesHeader}>
              <Text style={styles.sectionTitle}>Messages</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{activeConvos.length}</Text>
              </View>
            </View>
          )}

          {activeConvos.length > 0 ? (
            <FlatList
              data={activeConvos}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => {
                const isP1r = item.participant1?.id === myId;
                const otherUser = isP1r ? item.participant2 : item.participant1;
                const img = otherUser?.images?.[0];
                const otherImageUri = img ? `${API_CONFIG.BASE_URL}/uploads/images/${img}` : undefined;
                return (
                  <ConversationItem
                    conversation={item}
                    myId={myId}
                    otherId={otherUser?.id}
                    otherImage={otherImageUri}
                    onPress={() => {
                      const isGroup = item.type === 'group';
                      const isP1 = item.participant1?.id === myId;
                      const other = isP1 ? item.participant2 : item.participant1;
                      const chatTitle = isGroup
                        ? (item.group?.name ?? 'Groupe')
                        : (other?.name ?? 'Utilisateur');
                      const img = other?.images?.[0];
                      const otherImage = img ? `${API_CONFIG.BASE_URL}/uploads/images/${img}` : undefined;
                      router.push({
                        pathname: '/chat',
                        params: { conversationId: item.id, otherName: chatTitle, otherImage, isGroup: isGroup ? '1' : '0' },
                      } as any);
                    }}
                  />
                );
              }}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyConvos}>
              <Text style={styles.emptySubtitle}>Commence à écrire à tes nouveaux matchs !</Text>
            </View>
          )}
        </>
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab="messages" style={styles.bottomNav} />
    </SafeAreaView>
  );
}

// --- Styles --------------------------------------------------------------------

const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: STATUS_H,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    fontSize: 18,
    paddingStart: 15,
    fontWeight: '700',
    color: Colors.grayDark,
  },
  headerSearch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loader: { marginTop: 60 },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0d6e8',
  },

  // Avatar
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
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
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
  },

  // Badges
  cardBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  newMatchBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMatchText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Card content
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardTime: {
    fontSize: 12,
    color: Colors.gray,
  },
  cardPreview: {
    fontSize: 12,
    color: Colors.gray,
    lineHeight: 17,
  },

  // Bottom nav
  bottomNav: {
    marginTop: 'auto',
  },

  // ── Nouveaux Matchs
  matchesSection: {
    paddingTop: 14,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0d6e8',
      paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  matchesRow: {
    paddingHorizontal: 12,
    gap: 16,
    paddingBottom: 14,
  },
  matchBubble: {
    alignItems: 'center',
    width: 72,
  },
  matchAvatarRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    padding: 2,
    marginBottom: 6,
  },
  matchAvatar: {
    width: 61,
    height: 61,
    borderRadius: 31,
  },
  matchAvatarFallback: {
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  matchName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grayDark,
    textAlign: 'center',
  },

  // ── Messages header
  messagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    verticalAlign: "middle",
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 8,
  },
  countPill: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },

  // ── Empty convos
  emptyConvos: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
});