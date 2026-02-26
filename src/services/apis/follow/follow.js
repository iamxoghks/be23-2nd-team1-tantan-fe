import apiClient from '@/services/axios';

export const followApi = {
  follow(userId) {
    return apiClient.post(`/api/v1/users/${userId}/follow`);
  },

  unfollow(userId) {
    return apiClient.delete(`/api/v1/users/${userId}/follow`);
  },
};
