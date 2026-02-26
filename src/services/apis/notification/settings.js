import apiClient from '@/services/axios';

export const notificationSettingsApi = {
  get() {
    return apiClient.get('/notifications/settings');
  },

  update(payload) {
    return apiClient.put('/notifications/settings', payload);
  },
};
