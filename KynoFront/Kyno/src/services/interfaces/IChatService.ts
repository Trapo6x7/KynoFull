export interface ConversationGroup {
  id: number;
  name: string;
}

export interface ConversationParticipant {
  id: number;
  name?: string;
  firstName?: string;
  /** Tableau de noms de fichiers (filenames) — prendre [0] pour l'avatar */
  images?: string[];
}

export interface Conversation {
  id: number;
  type: 'private' | 'group';
  /** Présent si type === 'group' */
  group?: ConversationGroup | null;
  /** Présent si type === 'private' */
  participant1?: ConversationParticipant;
  /** Présent si type === 'private' */
  participant2?: ConversationParticipant;
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  unreadCount1: number;
  unreadCount2: number;
  createdAt: string;
}

export interface Message {
  id: number;
  conversation: string | { id: number }; // IRI ou objet désérialisé
  sender: ConversationParticipant;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface IChatService {
  /** Retourne toutes les conversations (privées + groupe) de l'utilisateur connecté */
  getConversations(): Promise<Conversation[]>;

  /** Trouve ou crée une conversation privée avec `otherUserId` (idempotent) */
  getOrCreateConversation(otherUserId: number): Promise<Conversation>;

  /** Trouve ou crée la conversation d'un groupe (idempotent) */
  getOrCreateGroupConversation(groupId: number): Promise<Conversation>;

  /** Retourne les messages d'une conversation, triés par createdAt ASC */
  getMessages(conversationId: number): Promise<Message[]>;

  /** Envoie un message dans une conversation */
  sendMessage(conversationId: number, content: string): Promise<Message>;

  /** Marque un message comme lu */
  markMessageAsRead(messageId: number): Promise<Message>;

  /** Remet à zéro le compteur non lu d'une conversation pour l'utilisateur courant */
  markConversationAsRead(conversationId: number): Promise<void>;
}
