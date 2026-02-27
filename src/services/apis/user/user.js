import apiClient from '@/services/axios';

const toJsonBlob = (value) => new Blob([JSON.stringify(value || {})], { type: 'application/json' });

const toUserUpdateFormData = (payload = {}) => {
  if (payload instanceof FormData) return payload;

  const formData = new FormData();
  const {
    profileImage,
    ...dto
  } = payload || {};

  formData.append('dto', toJsonBlob(dto));

  if (profileImage) {
    formData.append('profileImage', profileImage);
  }

  return formData;
};

export const userApi = {
  signUp(payload) {
    return apiClient.post('/user/signUp', payload);
  },

  sendEmailVerification(payload) {
    return apiClient.post('/auth/email/send', payload);
  },

  verifyEmailCode(payload) {
    return apiClient.post('/auth/email/verify', payload);
  },

  login(payload) {
    return apiClient.post('/user/login', payload);
  },

  findAll(params) {
    return apiClient.get('/user/findAll', { params });
  },

  profile(params) {
    return apiClient.get('/user/profile', { params });
  },

  // Backward-compatible alias for older views.
  myInfo(params) {
    return apiClient.get('/user/profile', { params });
  },

  refreshAt(payload) {
    return apiClient.post('/user/refresh-at', payload);
  },

  update(payload) {
    return apiClient.patch('/user/update', toUserUpdateFormData(payload));
  },

  changePassword(payload) {
    return apiClient.patch('/user/changePw', payload);
  },

  logout() {
    return apiClient.post('/user/logout');
  },

  sendPasswordResetMail(payload) {
    return apiClient.post('/user/password/reset-mail', payload);
  },

  resetPassword(payload) {
    return apiClient.post('/user/password/reset', payload);
  },

  delete() {
    return apiClient.delete('/user/delete');
  },

  getNotificationSettings() {
    return apiClient.get('/notifications/settings');
  },

  updateNotificationSettings(payload) {
    return apiClient.put('/notifications/settings', payload);
  },
};
