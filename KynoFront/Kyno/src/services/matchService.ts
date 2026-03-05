import apiClient from './api';
import { API_CONFIG } from '../config/api';
import type { IMatchService, UserMatch } from './interfaces/IMatchService';

// Re-export pour compatibilité des imports existants
export type { UserMatch };

class MatchService implements IMatchService {
  async recordLike(targetUserId: number, userId?: number): Promise<{ match: UserMatch; isMatch: boolean }> {
    const payload = {
      targetUser: `/api/users/${targetUserId}`,
      action: 'like',
      ...(userId ? { user: `/api/users/${userId}` } : {}),
    };
    try {
      console.log('MATCH: POST', API_CONFIG.ENDPOINTS.USER_MATCHES, 'payload:', payload);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.USER_MATCHES, payload);
      
      // Vérifier si c'est un match mutuel (targetUser a déjà liké userId)
      const isMatch = userId != null && await (async () => {
        const allMatches = await this.getMyMatches();
        return allMatches.some((m: any) => {
          const mUserId = Number(typeof m.user === 'object' ? m.user.id : m.user);
          const mTargetId = Number(typeof m.targetUser === 'object' ? m.targetUser.id : m.targetUser);
          return mUserId === targetUserId && mTargetId === userId && m.action === 'like';
        });
      })();
      return { match: response.data, isMatch };
    } catch (error: any) {
      console.error('MATCH: recordLike ERROR status:', error.response?.status);
      console.error('MATCH: recordLike ERROR data:', error.response?.data);
      throw error;
    }
  }

  async recordDislike(targetUserId: number, userId?: number): Promise<UserMatch> {
    // POST to USER_MATCHES - Dislike for targetUserId
    const payload = {
      targetUser: `/api/users/${targetUserId}`,
      action: 'dislike',
      ...(userId ? { user: `/api/users/${userId}` } : {}),
    };
    try {
      console.log('MATCH: POST', API_CONFIG.ENDPOINTS.USER_MATCHES, 'payload:', payload);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.USER_MATCHES, payload);
      return response.data;
    } catch (error: any) {
      console.error('MATCH: recordDislike ERROR status:', error.response?.status);
      console.error('MATCH: recordDislike ERROR data:', error.response?.data);
      throw error;
    }
  }

  async getMutualMatches(): Promise<UserMatch[]> {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.USER_MATCHES}?action=like`);
    return response.data['hydra:member'];
  }

  async getMyMatches(): Promise<UserMatch[]> {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.USER_MATCHES}?itemsPerPage=200`);
    const data: any = response.data;
    return data['hydra:member'] || data['member'] || (Array.isArray(data) ? data : []);
  }

  async getSeenUserIds(myId: number): Promise<number[]> {
    // Dérivé de getMyMatches() — évite le conflit URL avec API Platform
    const all = await this.getMyMatches();
    console.log('[matchService] getSeenUserIds all matches:', all);
    const result = all
      .filter((m: any) => {
        const userId = Number(typeof m.user === 'object' ? m.user.id : m.user);
        return userId === myId;
      })
      .map((m: any) => Number(typeof m.targetUser === 'object' ? m.targetUser.id : m.targetUser));
    console.log('[matchService] getSeenUserIds result for myId', myId, ':', result);
    return result;
  }

  async getLikesReceived(myId: number): Promise<number[]> {
    const all = await this.getMyMatches();
    return all
      .filter((m: any) => {
        const targetId = typeof m.targetUser === 'object' ? m.targetUser.id : m.targetUser;
        const userId = typeof m.user === 'object' ? m.user.id : m.user;
        return Number(targetId) === myId && m.action === 'like' && Number(userId) !== myId;
      })
      .map((m: any) => {
        const userId = typeof m.user === 'object' ? m.user.id : m.user;
        return Number(userId);
      });
  }
}

export default new MatchService();
