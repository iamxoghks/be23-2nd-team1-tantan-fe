const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const normalizeRole = (value) => {
  const role = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, '')
    .replace(/-/g, '_');

  if (role === 'USER') return 'USER';
  if (role === 'GYM_OWNER' || role === 'GYMOWNER' || role === 'OWNER') return 'GYM_OWNER';
  if (role === 'ADMIN') return 'ADMIN';
  return null;
};

const safeDecodeBase64Url = (raw) => {
  if (!raw) return null;
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
  } catch (error) {
    return null;
  }
};

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (!token) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function setRefreshToken(token) {
  if (!token) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setAuthTokens({ accessToken, refreshToken }) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const [, payload] = token.split('.');
  if (!payload) return null;
  const decoded = safeDecodeBase64Url(payload);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export function getTokenRole(token = getAccessToken()) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== 'object') return null;
  return normalizeRole(payload.role || payload.auth || payload.authority);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
