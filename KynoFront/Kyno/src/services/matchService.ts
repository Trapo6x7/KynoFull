import apiClient from './api';
import { API_CONFIG } from '../config/api';

export interface UserMatch {
  id: number;
  user: { id: number };
  targetUser: { id: number };
  action: 'like' | 'dislike';
  matchScore?: number;
  createdAt: string;
}

class MatchService {
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
      const allMatches = await this.getMyMatches();
      console.log('MATCH: Checking mutual match - userId:', userId, 'targetUserId:', targetUserId);
      console.log('MATCH: All matches:', allMatches);
      
      const isMatch = allMatches.some((m: any) => {
        const mUserId = typeof m.user === 'object' ? m.user.id : m.user;
        const mTargetId = typeof m.targetUser === 'object' ? m.targetUser.id : m.targetUser;
        const matches = mUserId === targetUserId && mTargetId === userId && m.action === 'like';
        console.log('MATCH: Checking match - mUserId:', mUserId, 'mTargetId:', mTargetId, 'action:', m.action, 'matches:', matches);
        return matches;
      });
      
      console.log('MATCH: isMatch result:', isMatch);
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

  async getSeenUserIds(): Promise<number[]> {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.USER_MATCHES}/seen`);
    const data: any = response.data;
    if (Array.isArray(data)) return data.map((n: any) => Number(n));
    return [];
  }
}

export default new MatchService();
