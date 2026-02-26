import apiClient from '@/services/axios';

export const mapApi = {
  geocode(query) {
    return apiClient.get('/api/map/geocode', {
      params: { query },
    });
  },

  searchGyms(params) {
    return apiClient.get('/api/map/gyms/search', { params });
  },

  categories() {
    return apiClient.get('/api/map/categories');
  },

  directionsDriving(params) {
    return apiClient.get('/api/map/directions/driving', { params });
  },

  // Backward-compatible alias
  drivingRoute(params) {
    return apiClient.get('/api/map/directions/driving', { params });
  },
};
