export interface MessageViewModel {
  id: number;
  content: string;
  senderId: number;
  isMe: boolean;
  timestamp: string;
  isRead: boolean;
  senderName?: string;
  senderImage?: string;
}

export interface ConversationViewModel {
  id: number;
  name: string;
  image?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isGroup: boolean;
  isNewMatch: boolean;
}

export interface ChatParticipant {
  id: number;
  name: string;
  image?: string;
}
