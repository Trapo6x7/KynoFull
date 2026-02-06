import apiClient from './api';

export const userService = {
  async getProfessions(): Promise<string[]> {
    // userService.getProfessions - START
    // URL: /users/professions
    try {
      const response = await apiClient.get('/users/professions');
      // userService.getProfessions - SUCCESS
      // Response available in response.data
      return response.data;
    } catch (error) {
      // userService.getProfessions - ERROR
      // Error available in 'error'
      throw error;
    }
  },

  async getAllUsers(): Promise<any[]> {
    // getAllUsers - START
    // URL: /api/users
    try {
      const response = await apiClient.get('/api/users?itemsPerPage=200');
      // getAllUsers - SUCCESS
      // Response data available
      const users = response.data['hydra:member'] || response.data.member || [];
      // Users count available
      return users;
    } catch (error: any) {
      // getAllUsers - ERROR
      // Error details available in 'error'
      throw error;
    }
  },
};

export default userService;
