import apiClient from './api';
import type { User } from '../types';
import type { IUserService } from './interfaces/IUserService';

export const userService: IUserService = {
  async getProfessions(): Promise<string[]> {
    try {
      const response = await apiClient.get('/users/professions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get('/api/users?itemsPerPage=200');
      const users: User[] = response.data['hydra:member'] || response.data.member || [];
      return users;
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
