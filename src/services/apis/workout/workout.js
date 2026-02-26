import apiClient from '@/services/axios';

export const workoutApi = {
  create(payload) {
    return apiClient.post('/workout/create', payload);
  },

  list(params) {
    return apiClient.get('/workout/list', { params });
  },

  day(date, params = {}) {
    return apiClient.get('/workout/day', {
      params: {
        date,
        ...params,
      },
    });
  },

  month(params) {
    return apiClient.get('/workout/month', { params });
  },

  heatmap(params) {
    return apiClient.get('/workout/heatmap', { params });
  },

  update(workoutId, payload) {
    return apiClient.put(`/workout/${workoutId}`, payload);
  },

  delete(workoutId) {
    return apiClient.delete(`/workout/${workoutId}`);
  },
};
