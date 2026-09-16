import { apiClient } from './client';

export const auditApi = {
  getAuditEvents: (params) => apiClient.get('/audit/events', { params }),
  getAuditTrail: (resourceId) => apiClient.get(`/audit/trail/${resourceId}`),
  getAuditSummary: () => apiClient.get('/audit/summary'),
};
