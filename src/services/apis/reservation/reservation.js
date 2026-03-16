import apiClient from '@/services/axios';

export const reservationApi = {
  getSlots(gymId, date) {
    return apiClient.get(`/api/v1/gyms/${gymId}/slots`, {
      params: { date },
    });
  },

  getCalendar(gymId, year, month) {
    return apiClient.get(`/api/v1/gyms/${gymId}/slots/calendar`, {
      params: { year, month },
    });
  },

  create(payload) {
    return apiClient.post('/api/v1/reservations/create', payload);
  },

  createDailySlots(gymId, payload) {
    return apiClient.post(`/api/v1/gyms/${gymId}/slots/daily`, payload);
  },
};
