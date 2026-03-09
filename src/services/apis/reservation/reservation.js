import apiClient from '@/services/axios';

export const reservationApi = {
  getSlots(gymId, date) {
    return apiClient.get(`/api/v1/gyms/${gymId}/slots`, {
      params: { date },
    });
  },

  create(payload) {
    return apiClient.post('/api/v1/reservations/create', payload);
  },
};
