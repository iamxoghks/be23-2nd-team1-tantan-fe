import apiClient from '@/services/axios';

export const reportApi = {
  create(payload) {
    return apiClient.post('/reports', payload);
  },
};
