import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from '@/services/token';
import { notifyAuthInvalidated } from '@/services/authLifecycle';

const API_BASE_URL =
  import.meta.env.VUE_APP_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://server.nahcb572.shop';

const normalizedApiBaseUrl = String(API_BASE_URL).replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: normalizedApiBaseUrl,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let refreshWaitQueue = [];

function resolveRefreshQueue(error, token = null) {
  refreshWaitQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  refreshWaitQueue = [];
}

function isSuspendedResponse(error) {
  const status = error?.response?.status;
  if (status !== 403) return false;
  const data = error?.response?.data || {};
  return data?.error_code === 'USER_SUSPENDED';
}

function forceLogout(detail = {}) {
  notifyAuthInvalidated(detail);
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isSuspendedResponse(error)) {
      forceLogout({ reason: 'suspended' });
      return Promise.reject(error);
    }

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      forceLogout({ reason: 'missing_refresh_token' });
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshWaitQueue.push({ resolve, reject });
      }).then((newAccessToken) => {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(`${normalizedApiBaseUrl}/user/refresh-at`, {
        refreshToken,
      });

      const newAccessToken =
        refreshResponse.data?.accessToken ||
        refreshResponse.data?.data?.accessToken ||
        refreshResponse.data?.result?.accessToken;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      setAccessToken(newAccessToken);
      resolveRefreshQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      forceLogout({ reason: 'refresh_failed' });
      resolveRefreshQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
