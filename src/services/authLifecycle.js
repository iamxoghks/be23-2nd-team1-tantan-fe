import { clearAuthTokens } from '@/services/token';

const cleanupCallbacks = new Set();

export function registerAuthCleanup(callback) {
  if (typeof callback !== 'function') {
    return () => {};
  }
  cleanupCallbacks.add(callback);
  return () => {
    cleanupCallbacks.delete(callback);
  };
}

export function notifyAuthInvalidated(detail = {}) {
  clearAuthTokens();

  cleanupCallbacks.forEach((callback) => {
    try {
      callback(detail);
    } catch (error) {
      // Ignore cleanup callback failures so other cleanup can continue.
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:invalidated', { detail }));
  }
}
