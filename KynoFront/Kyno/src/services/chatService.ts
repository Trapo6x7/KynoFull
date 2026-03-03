import apiClient from './api';
import { API_CONFIG } from '../config/api';
import type { IChatService, Conversation, Message } from './interfaces/IChatService';

class ChatService implements IChatService {
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CONVERSATIONS);
    const data = response.data;
    console.log('[chatService] getConversations raw:', JSON.stringify(data, null, 2));
    // API Platform retourne { "hydra:member": [...] } ou un tableau
    const result = Array.isArray(data) ? data : (data['hydra:member'] ?? data['member'] ?? []);
    console.log('[chatService] getConversations parsed:', result.length, 'conversations', result);
    return result;
  }

  async getOrCreateConversation(otherUserId: number): Promise<Conversation> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CONVERSATIONS, {
      otherUserId,
    });
    return response.data;
  }

  async getOrCreateGroupConversation(groupId: number): Promise<Conversation> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CONVERSATIONS, {
      groupId,
    });
    return response.data;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    const conversationIri = `/api/conversations/${conversationId}`;
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.MESSAGES}?conversation=${encodeURIComponent(conversationIri)}`
    );
    const data = response.data;
    return Array.isArray(data) ? data : (data['hydra:member'] ?? data['member'] ?? []);
  }

  async sendMessage(conversationId: number, content: string): Promise<Message> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.MESSAGES, {
      conversation: `/api/conversations/${conversationId}`,
      content,
    });
    return response.data;
  }

  async markMessageAsRead(messageId: number): Promise<Message> {
    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.MESSAGES}/${messageId}/read`,
      { isRead: true },
      { headers: { 'Content-Type': 'application/merge-patch+json' } }
    );
    return response.data;
  }
}

const chatService = new ChatService();
export default chatService;
