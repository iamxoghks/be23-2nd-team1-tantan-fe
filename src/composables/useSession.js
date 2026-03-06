import { computed, ref } from 'vue';
import { userApi } from '@/services/apis';
import { clearAuthTokens, getAccessToken, getTokenRole, normalizeRole } from '@/services/token';
import { extractPayload } from '@/utils/api';

const sessionProfile = ref(null);
const isSessionHydrated = ref(false);
const isSessionLoading = ref(false);
const hasAccessToken = ref(Boolean(getAccessToken()));

let inflight = null;

const handleAuthInvalidated = () => {
  sessionProfile.value = null;
  isSessionHydrated.value = false;
  isSessionLoading.value = false;
  hasAccessToken.value = false;
  inflight = null;
};

if (typeof window !== 'undefined') {
  window.addEventListener('auth:invalidated', handleAuthInvalidated);
}

const refreshAuthState = () => {
  hasAccessToken.value = Boolean(getAccessToken());
};

const normalizeStatus = (value, fallbackSuspended = false) => {
  const status = String(value || '')
    .trim()
    .toUpperCase();
  if (status === 'SUSPENDED') return 'SUSPENDED';
  if (status === 'ACTIVE') return 'ACTIVE';
  return fallbackSuspended ? 'SUSPENDED' : 'ACTIVE';
};

const normalizeProfile = (raw = {}) => {
  const tokenRole = getTokenRole();
  const role = normalizeRole(raw.role) || tokenRole || 'USER';
  const status = normalizeStatus(raw.status, Boolean(raw.suspended));
  const displayName = raw.displayName ?? raw.nickName ?? raw.nickname ?? raw.userName ?? raw.name ?? '';

  return {
    id: raw.id ?? raw.userId ?? null,
    userName: raw.userName ?? raw.name ?? displayName,
    displayName,
    email: raw.email ?? '',
    role,
    status,
    raw,
  };
};

const primeSessionFromToken = () => {
  refreshAuthState();
  const token = getAccessToken();
  if (!token) return null;
  const role = getTokenRole(token);
  if (!role) return null;

  sessionProfile.value = {
    ...(sessionProfile.value || {}),
    role,
    status: sessionProfile.value?.status || 'ACTIVE',
  };
  return sessionProfile.value;
};

primeSessionFromToken();

const syncSessionFromServer = async ({ force = false } = {}) => {
  refreshAuthState();
  const token = getAccessToken();
  if (!token) {
    sessionProfile.value = null;
    isSessionHydrated.value = true;
    return null;
  }

  if (!force && isSessionHydrated.value && sessionProfile.value) {
    return sessionProfile.value;
  }

  if (inflight) return inflight;

  isSessionLoading.value = true;
  inflight = (async () => {
    try {
      const response = await userApi.profile();
      const payload = extractPayload(response);
      sessionProfile.value = normalizeProfile(payload);
      isSessionHydrated.value = true;
      return sessionProfile.value;
    } catch (error) {
      clearAuthTokens();
      sessionProfile.value = null;
      isSessionHydrated.value = true;
      throw error;
    } finally {
      isSessionLoading.value = false;
      inflight = null;
    }
  })();

  return inflight;
};

const resetSession = () => {
  sessionProfile.value = null;
  isSessionHydrated.value = false;
  isSessionLoading.value = false;
  refreshAuthState();
  inflight = null;
};

const hasRole = (roles) => {
  const current = sessionProfile.value?.role || getTokenRole();
  if (!current) return false;
  const candidates = Array.isArray(roles) ? roles : [roles];
  return candidates.includes(current);
};

export const useSession = () => ({
  sessionProfile,
  isSessionHydrated,
  isSessionLoading,
  isAuthenticated: computed(() => hasAccessToken.value),
  syncSessionFromServer,
  primeSessionFromToken,
  refreshAuthState,
  resetSession,
  hasRole,
});
