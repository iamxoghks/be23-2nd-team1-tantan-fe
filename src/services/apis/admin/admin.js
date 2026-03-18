import apiClient from '@/services/axios';

export const adminApi = {
  dashboardSummary(params) {
    return apiClient.get('/admin/dashboard/summary', { params });
  },

  listUsers(params) {
    return apiClient.get('/admin/users', { params });
  },

  userDetail(userId) {
    return apiClient.get(`/admin/users/${userId}`);
  },

  suspendUser(userId, payload) {
    return apiClient.patch(`/admin/users/${userId}/suspend`, payload);
  },

  unsuspendUser(userId) {
    return apiClient.patch(`/admin/users/${userId}/unsuspend`);
  },

  listGyms(params) {
    return apiClient.get('/admin/gyms', { params });
  },

  gymDetail(gymId) {
    return apiClient.get(`/admin/gyms/${gymId}`);
  },

  suspendGym(gymId, payload) {
    return apiClient.patch(`/admin/gyms/${gymId}/suspend`, payload);
  },

  unsuspendGym(gymId) {
    return apiClient.patch(`/admin/gyms/${gymId}/unsuspend`);
  },

  listReports(params) {
    return apiClient.get('/reports/list', { params });
  },

  reportDetail(id) {
    return apiClient.get(`/reports/${id}`);
  },

  updateReportStatus(id, { status, deleteTarget = false } = {}) {
    return apiClient.patch(`/reports/${id}/status`, null, {
      params: { status, deleteTarget },
    });
  },

  resolveReportWithDeleteAndSuspend(id, payload) {
    return apiClient.patch(`/reports/${id}/resolve-delete-suspend`, payload);
  },
};
