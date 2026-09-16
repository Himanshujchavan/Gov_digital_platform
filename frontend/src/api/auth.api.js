import { apiClient } from './client';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  getAllUsers: () => apiClient.get('/auth/users'),
  health: () => apiClient.get('/auth/health'),
};
