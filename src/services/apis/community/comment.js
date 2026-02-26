import apiClient from '@/services/axios';

export const communityCommentApi = {
  create(payload) {
    return apiClient.post('/community/comment/create', payload);
  },

  list(postIdOrParams, pageable = {}) {
    const params = typeof postIdOrParams === 'object'
      ? postIdOrParams
      : { postId: postIdOrParams, ...pageable };

    return apiClient.get('/community/comment/list', {
      params,
    });
  },

  replies(params) {
    return apiClient.get('/community/comment/replies', { params });
  },

  delete(id) {
    return apiClient.delete(`/community/comment/${id}`);
  },

  update(id, payload) {
    return apiClient.put(`/community/comment/${id}`, payload);
  },
};
