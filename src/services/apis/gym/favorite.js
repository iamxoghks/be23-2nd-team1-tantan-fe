import apiClient from '@/services/axios';

export const gymFavoriteApi = {
  add(gymId) {
    return apiClient.post(`/gym/fav/${gymId}/add`);
  },

  list() {
    return apiClient.get('/gym/fav/list');
  },

  check(gymId) {
    return apiClient.get(`/gym/fav/check/${gymId}`);
  },

  remove(gymId) {
    return apiClient.delete(`/gym/fav/remove/${gymId}`);
  },
};
