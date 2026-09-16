import { apiClient } from './client';

export const departmentsApi = {
  getSchemes: () => apiClient.get('/departments/welfare/schemes'),
  getRevenueCitizen: (id) => apiClient.get(`/departments/revenue/citizens/${id}`),
  getLandRecord: (id) => apiClient.get(`/departments/land/records/${id}`),
};
