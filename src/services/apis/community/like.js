import apiClient from '@/services/axios';

export const communityLikeApi = {
  toggle(postId) {
    return apiClient.post(`/community/like/${postId}`);
  },
};
