import type { MatchViewModel } from '@/src/hooks/useMatches';

export type ExploreState = 
  | { type: 'private' }
  | { type: 'loading' }
  | { type: 'empty' }
  | { 
      type: 'ready'; 
      matches: MatchViewModel[]; 
      currentIndex: number;
    };

export interface SwipeActions {
  onLike: () => void;
  onDislike: () => void;
  onRefresh: () => void;
}

export interface MatchModalData {
  match: MatchViewModel;
  conversationId: number | null;
}
