import { apiClient } from './client';

export const mdmApi = {
  resolveCitizen: (data) => apiClient.post('/mdm/resolve', data),
  getMasterProfile: (masterId) => apiClient.get(`/mdm/master/${masterId}`),
  getMasterLinks: (masterId) => apiClient.get(`/mdm/master/${masterId}/links`),
  getDuplicates: () => apiClient.get('/mdm/duplicates'),
  confirmDuplicate: (id, data) => apiClient.post(`/mdm/duplicates/${id}/confirm`, data),
  getDataQuality: (department) => apiClient.get(`/mdm/quality/${department}`),
  getStats: () => apiClient.get('/mdm/stats'),
};
