import { apiClient } from './client';

export const consentApi = {
  getPendingConsents: (citizenId) => apiClient.get(`/consent/pending/${citizenId}`),
  respondConsent: (consentId, responseData) => apiClient.put(`/consent/${consentId}/respond`, responseData),
  getConsentHistory: (citizenId) => apiClient.get(`/consent/history/${citizenId}`),
  revokeConsent: (consentId) => apiClient.put(`/consent/${consentId}/revoke`),
  getConsentById: (consentId) => apiClient.get(`/consent/${consentId}`),
};
