import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/router/routes';
import { getAccessToken, normalizeRole } from '@/services/token';
import { useSession } from '@/composables/useSession';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const BYPASS_AUTH_GUARD = false;

router.beforeEach(async (to) => {
  if (BYPASS_AUTH_GUARD) return true;

  const requiresAuth = Boolean(to.meta?.requiresAuth);
  const allowedRoles = Array.isArray(to.meta?.roles) ? to.meta.roles : null;
  const accessToken = getAccessToken();
  const {
    sessionProfile,
    syncSessionFromServer,
    primeSessionFromToken,
    resetSession,
  } = useSession();

  if (!accessToken) {
    if (!requiresAuth) return true;
    return '/login';
  }

  if (!sessionProfile.value) {
    primeSessionFromToken();
  }

  if (requiresAuth || allowedRoles) {
    try {
      await syncSessionFromServer();
    } catch (error) {
      resetSession();
      return '/login';
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = normalizeRole(sessionProfile.value?.role);
    if (!currentRole || !allowedRoles.includes(currentRole)) {
      return '/';
    }
  }

  return true;
});

export default router;
