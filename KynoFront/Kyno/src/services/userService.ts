import apiClient from './api';

export const userService = {
  async getProfessions(): Promise<string[]> {
    const response = await apiClient.get('/api/users/professions');
    return response.data;
  },
};

export default userService;
