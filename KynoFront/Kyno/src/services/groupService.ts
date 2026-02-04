import apiClient from './api';
import { API_CONFIG } from '../config/api';
import { Group, GroupRequest, PaginatedResponse } from '../types';

export interface CreateGroupData {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateGroupData extends Partial<CreateGroupData> {}

const groupService = {
  /**
   * Récupérer tous les groupes
   */
  getGroups: async (page: number = 1): Promise<PaginatedResponse<Group>> => {
    const response = await apiClient.get<PaginatedResponse<Group>>(
      `${API_CONFIG.ENDPOINTS.GROUPS}?page=${page}`
    );
    return response.data;
  },

  /**
   * Récupérer un groupe par son ID
   */
  getGroup: async (id: number): Promise<Group> => {
    const response = await apiClient.get<Group>(`${API_CONFIG.ENDPOINTS.GROUPS}/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau groupe
   */
  createGroup: async (data: CreateGroupData): Promise<Group> => {
    const response = await apiClient.post<Group>(API_CONFIG.ENDPOINTS.GROUPS, data);
    return response.data;
  },

  /**
   * Mettre à jour un groupe
   */
  updateGroup: async (id: number, data: UpdateGroupData): Promise<Group> => {
    const response = await apiClient.patch<Group>(
      `${API_CONFIG.ENDPOINTS.GROUPS}/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
      }
    );
    return response.data;
  },

  /**
   * Supprimer un groupe
   */
  deleteGroup: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.GROUPS}/${id}`);
  },

  /**
   * Mettre à jour l'image d'un groupe
   */
  updateGroupImage: async (id: number, imageUri: string): Promise<Group> => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'group.jpg',
    } as any);

    const response = await apiClient.post<Group>(
      `${API_CONFIG.ENDPOINTS.GROUPS}/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Récupérer les groupes de l'utilisateur connecté
   */
  getMyGroups: async (): Promise<Group[]> => {
    const response = await apiClient.get<PaginatedResponse<Group>>(
      `${API_CONFIG.ENDPOINTS.GROUPS}?members.user.id=me`
    );
    return response.data['hydra:member'];
  },

  /**
   * Envoyer une demande pour rejoindre un groupe
   */
  requestToJoin: async (groupId: number, message?: string): Promise<GroupRequest> => {
    const response = await apiClient.post<GroupRequest>(
      API_CONFIG.ENDPOINTS.GROUP_REQUESTS,
      {
        group: `/api/groups/${groupId}`,
        message,
      }
    );
    return response.data;
  },

  /**
   * Récupérer les demandes en attente pour un groupe (admin)
   */
  getPendingRequests: async (groupId: number): Promise<GroupRequest[]> => {
    const response = await apiClient.get<PaginatedResponse<GroupRequest>>(
      `${API_CONFIG.ENDPOINTS.GROUP_REQUESTS}?group.id=${groupId}&status=pending`
    );
    return response.data['hydra:member'];
  },

  /**
   * Accepter une demande
   */
  acceptRequest: async (requestId: number): Promise<void> => {
    await apiClient.post(`${API_CONFIG.ENDPOINTS.GROUP_REQUESTS}/${requestId}/accept`, {});
  },

  /**
   * Rejeter une demande
   */
  rejectRequest: async (requestId: number): Promise<void> => {
    await apiClient.post(`${API_CONFIG.ENDPOINTS.GROUP_REQUESTS}/${requestId}/reject`, {});
  },

  /**
   * Quitter un groupe
   */
  leaveGroup: async (groupId: number): Promise<void> => {
    await apiClient.post(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}/leave`, {});
  },
};

export default groupService;
