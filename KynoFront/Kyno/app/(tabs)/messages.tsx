import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import BottomNav from '@/src/components/BottomNav';
import { ConversationItem } from '@/src/components/messages/ConversationItem';
import { MatchBubble } from '@/src/components/messages/MatchBubble';
import { useServices } from '@/src/context/ServicesContext';
import { useAuth } from '@/src/context/AuthContext';
import { API_CONFIG } from '@/src/config/api';
import type { Conversation } from '@/src/services/interfaces/IChatService';

const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

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

  function buildChatParams(item: Conversation) {
    const isGroup = item.type === 'group';
    const isP1 = item.participant1?.id === myId;
    const other = isP1 ? item.participant2 : item.participant1;
    const chatTitle = isGroup ? (item.group?.name ?? 'Groupe') : (other?.name ?? 'Utilisateur');
    const img = other?.images?.[0];
    return {
      conversationId: item.id,
      otherName: chatTitle,
      otherImage: img ? `${API_CONFIG.BASE_URL}/uploads/images/${img}` : undefined,
      otherId: isGroup ? '' : String(other?.id ?? ''),
      isGroup: isGroup ? '1' : '0',
    };
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Message</Text>
        <TouchableOpacity style={styles.headerSearch} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
      </View>

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
          {newMatches.length > 0 && (
            <View style={styles.matchesSection}>
              <Text style={styles.sectionTitle}>Nouveaux Matchs</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchesRow}>
                {newMatches.map(conv => (
                  <MatchBubble
                    key={conv.id}
                    conversation={conv}
                    myId={myId}
                    onPress={() => router.push({ pathname: '/chat', params: buildChatParams(conv) } as any)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {activeConvos.length > 0 && (
            <View style={styles.messagesHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Messages</Text>
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
                const isP1 = item.participant1?.id === myId;
                const other = isP1 ? item.participant2 : item.participant1;
                const img = other?.images?.[0];
                return (
                  <ConversationItem
                    conversation={item}
                    myId={myId}
                    otherId={other?.id}
                    otherImage={img ? `${API_CONFIG.BASE_URL}/uploads/images/${img}` : undefined}
                    onPress={() => router.push({ pathname: '/chat', params: buildChatParams(item) } as any)}
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

      <BottomNav activeTab="messages" style={styles.bottomNav} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background, paddingTop: STATUS_H },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerBack: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'left', fontSize: 18, paddingStart: 15, fontWeight: '700', color: Colors.grayDark },
  headerSearch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  loader: { marginTop: 60 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.gray, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 20 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
  bottomNav: { marginTop: 'auto' },
  matchesSection: { paddingTop: 14, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#f0d6e8', paddingHorizontal: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.grayDark, paddingHorizontal: 16, marginBottom: 10 },
  matchesRow: { paddingHorizontal: 12, gap: 16, paddingBottom: 14 },
  messagesHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, gap: 8 },
  countPill: { backgroundColor: Colors.primary, borderRadius: 10, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countPillText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  emptyConvos: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 40 },
});