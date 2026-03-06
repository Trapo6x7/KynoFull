import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useServices } from './ServicesContext';

interface BadgeContextType {
  messagesBadge: boolean;
  likesBadge: boolean;
  refreshBadge: () => void;
}

const BadgeContext = createContext<BadgeContextType>({
  messagesBadge: false,
  likesBadge: false,
  refreshBadge: () => {},
});

export const useBadge = () => useContext(BadgeContext);

export const BadgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { chatService, matchService } = useServices();
  const [messagesBadge, setMessagesBadge] = useState(false);
  const [likesBadge, setLikesBadge] = useState(false);

  const fetchBadge = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setMessagesBadge(false);
      setLikesBadge(false);
      return;
    }
    try {
      const [conversations, likerIds, seenIds] = await Promise.all([
        chatService.getConversations(),
        matchService.getLikesReceived(user.id),
        matchService.getSeenUserIds(user.id),
      ]);

      // Messages badge
      const myId = user.id;
      const hasMsgBadge = conversations.some(c => {
        if (c.type === 'group') return false;
        if (!c.lastMessageContent) return true;
        const isP1 = c.participant1?.id === myId;
        const unread = isP1 ? c.unreadCount1 : c.unreadCount2;
        return unread > 0;
      });
      setMessagesBadge(hasMsgBadge);

      // Likes badge : likes reçus non encore traités
      const seenSet = new Set(seenIds);
      setLikesBadge(likerIds.some(id => !seenSet.has(id)));
    } catch {
      // fail silently
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchBadge();
    const interval = setInterval(fetchBadge, 30_000);
    return () => clearInterval(interval);
  }, [fetchBadge]);

  return (
    <BadgeContext.Provider value={{ messagesBadge, likesBadge, refreshBadge: fetchBadge }}>
      {children}
    </BadgeContext.Provider>
  );
};
