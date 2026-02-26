import apiClient from '@/services/axios';

const toReviewFormData = (payload = {}) => {
  const normalized = payload?.review || payload?.images
    ? payload
    : { review: payload, images: [] };
  const { review = {}, images = [] } = normalized;

  if (review instanceof FormData) return review;
  const formData = new FormData();
  const reviewJson = typeof review === 'string' ? review : JSON.stringify(review);
  formData.append('review', new Blob([reviewJson], { type: 'application/json' }));
  images.forEach((file) => formData.append('images', file));
  return formData;
};

export const reviewApi = {
  create(payload) {
    return apiClient.post('/review/create', toReviewFormData(payload));
  },

  list(params) {
    return apiClient.get('/review/list', { params });
  },

  listPage(params) {
    return apiClient.get('/review/listPage', { params });
  },

  detail(id) {
    return apiClient.get(`/review/detail/${id}`);
  },

  edit(id, payload) {
    return apiClient.put(`/review/${id}`, toReviewFormData(payload));
  },

  delete(id) {
    return apiClient.delete(`/review/delete/${id}`);
  },

  report(id, payload) {
    return apiClient.post(`/review/report/${id}`, payload);
  },
};
