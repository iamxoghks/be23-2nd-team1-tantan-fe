import apiClient from '@/services/axios';

const toPostFormData = ({ post, images = [] }) => {
  if (post instanceof FormData) return post;
  const formData = new FormData();
  const postJson = typeof post === 'string' ? post : JSON.stringify(post || {});
  formData.append('post', new Blob([postJson], { type: 'application/json' }));
  images.forEach((file) => {
    formData.append('images', file);
  });
  return formData;
};

export const communityPostApi = {
  create({ post, images = [] }) {
    return apiClient.post('/community/post/create', toPostFormData({ post, images }));
  },

  list(params) {
    return apiClient.get('/community/post/list', { params });
  },

  detail(id) {
    return apiClient.get(`/community/post/${id}`);
  },

  delete(id) {
    return apiClient.delete(`/community/post/${id}`);
  },

  update(id, payload = {}) {
    const normalized = payload?.post || payload?.images
      ? payload
      : { post: payload, images: [] };
    const { post, images = [] } = normalized;
    return apiClient.put(`/community/post/${id}`, toPostFormData({ post, images }));
  },
};
