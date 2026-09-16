import { apiClient } from './client';

export const workflowApi = {
  submitApplication: (data) => apiClient.post('/workflow/applications', data),
  getApplications: (params) => apiClient.get('/workflow/applications', { params }),
  getApplicationById: (id) => apiClient.get(`/workflow/applications/${id}`),
  getApplicationTimeline: (id) => apiClient.get(`/workflow/applications/${id}/timeline`),
  reviewApplication: (id, reviewData) => apiClient.put(`/workflow/applications/${id}/review`, reviewData),
  getPendingReviews: (department) => apiClient.get('/workflow/pending-reviews', { params: { department } }),
  getStats: () => apiClient.get('/workflow/stats'),
};
