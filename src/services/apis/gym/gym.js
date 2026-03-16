import apiClient from '@/services/axios';

const toJsonBlob = (value) => new Blob([JSON.stringify(value || {})], { type: 'application/json' });

const toGymAllUpdateFormData = ({ gym = {}, images = [] } = {}) => {
  if (gym instanceof FormData) return gym;

  const formData = new FormData();
  formData.append('gym', toJsonBlob(gym));

  images.forEach((file) => {
    formData.append('images', file);
  });

  return formData;
};

const toNoticeFormData = ({ notice = {}, images = [] } = {}) => {
  if (notice instanceof FormData) return notice;

  const formData = new FormData();
  formData.append('notice', toJsonBlob(notice));
  images.forEach((file) => {
    formData.append('images', file);
  });
  return formData;
};

export const gymApi = {
  apply(registryNum) {
    return apiClient.post('/gym/apply', null, {
      params: { registryNum },
    });
  },

  list(params) {
    return apiClient.get('/gym/list', { params });
  },

  detail(id) {
    return apiClient.get(`/gym/detail/${id}`);
  },

  myGym() {
    return apiClient.get('/gym/my-gym');
  },

  delete() {
    return apiClient.patch('/gym/my-gym/delete');
  },

  updateAll(payload) {
    return apiClient.put('/gym/my-gym/all', toGymAllUpdateFormData(payload));
  },

  updateProfile(payload) {
    return apiClient.patch('/gym/my-gym/profile', payload);
  },

  replaceProducts(payload = []) {
    return apiClient.put('/gym/my-gym/products', payload);
  },

  replaceHours(payload = []) {
    return apiClient.put('/gym/my-gym/hours', payload);
  },

  replaceAmenities(payload = []) {
    return apiClient.put('/gym/my-gym/amenities', payload);
  },

  addImages(images = []) {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append('images', file);
    });
    return apiClient.post('/gym/my-gym/images', formData);
  },

  deleteImage(imageId) {
    return apiClient.delete(`/gym/my-gym/images/${imageId}`);
  },

  createNotice(payload) {
    return apiClient.post('/gym/my-gym/notice', toNoticeFormData(payload));
  },

  deleteNotice(id) {
    return apiClient.delete(`/gym/my-gym/notice/${id}`);
  },

  createException(payload) {
    return apiClient.post('/gym/my-gym/exception', payload);
  },

  listException(params) {
    return apiClient.get('/gym/my-gym/exception/list', { params });
  },

  deleteException(id) {
    return apiClient.delete(`/gym/my-gym/exception/${id}`);
  },

  homeEvent(gymId) {
    return apiClient.get(`/gym/${gymId}/home-event`);
  },

  photoEvent(gymId) {
    return apiClient.get(`/gym/${gymId}/photo-event`);
  },

  gymImagesCombinedReview(gymId) {
    return apiClient.get(`/gym/${gymId}/gymImagesCombinedReview`);
  },

  gymImagesCombinedReviewDetail(gymId) {
    return apiClient.get(`/gym/${gymId}/gymImagesCombinedReview/detail`);
  },

  // Backward-compatible alias
  update(payload) {
    return apiClient.put('/gym/my-gym/all', toGymAllUpdateFormData(payload));
  },
};
