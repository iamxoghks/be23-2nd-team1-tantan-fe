import apiClient from '@/services/axios';

export const followApi = {
  follow(userId) {
    return apiClient.post(`/api/v1/users/${userId}/follow`);
  },

  unfollow(userId) {
    return apiClient.delete(`/api/v1/users/${userId}/follow`);
  },

  followers(userId, params) {
    return apiClient.get(`/api/v1/users/${userId}/followers`, { params });
  },

  followings(userId, params) {
    return apiClient.get(`/api/v1/users/${userId}/followings`, { params });
  },

  count(userId) {
    return apiClient.get(`/api/v1/users/${userId}/follow-count`);
  },
};
