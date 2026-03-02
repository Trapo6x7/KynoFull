export interface UserMatch {
  id: number;
  user: { id: number };
  targetUser: { id: number };
  action: 'like' | 'dislike';
  matchScore?: number;
  createdAt: string;
}

export interface RecordLikeResult {
  match: UserMatch;
  isMatch: boolean;
}

export interface IMatchService {
  /** Enregistre un "like" vers un utilisateur cible */
  recordLike(targetUserId: number, userId?: number): Promise<RecordLikeResult>;

  /** Enregistre un "dislike" vers un utilisateur cible */
  recordDislike(targetUserId: number, userId?: number): Promise<UserMatch>;

  /** Retourne les matches mutuels (les deux ont liké) */
  getMutualMatches(): Promise<UserMatch[]>;

  /** Retourne tous les matches de l'utilisateur connecté */
  getMyMatches(): Promise<UserMatch[]>;

  /** Retourne les IDs des utilisateurs déjà vus (like ou dislike) */
  getSeenUserIds(): Promise<number[]>;
}
