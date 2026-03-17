import { computed, ref } from 'vue';
import { chatApi } from '@/services/apis';
import { getAccessToken } from '@/services/token';
import { extractPayload } from '@/utils/api';

const unreadCount = ref(0);
const isUnreadHydrated = ref(false);
const isUnreadLoading = ref(false);

let inflight = null;

const setUnreadCount = (nextCount) => {
  unreadCount.value = Math.max(0, Number(nextCount) || 0);
  isUnreadHydrated.value = true;
};

const setUnreadFromRooms = (rooms = []) => {
  const total = Array.isArray(rooms)
    ? rooms.reduce((sum, room) => sum + Math.max(0, Number(room?.unread || 0)), 0)
    : 0;
  setUnreadCount(total);
};

const clearUnread = () => {
  unreadCount.value = 0;
  isUnreadHydrated.value = false;
  isUnreadLoading.value = false;
  inflight = null;
};

const syncUnreadCount = async ({ force = false } = {}) => {
  if (!getAccessToken()) {
    clearUnread();
    return 0;
  }

  if (!force && isUnreadHydrated.value) {
    return unreadCount.value;
  }

  if (inflight) return inflight;

  isUnreadLoading.value = true;
  inflight = (async () => {
    try {
      const response = await chatApi.unreadCount();
      const payload = extractPayload(response);
      setUnreadCount(payload?.unreadCount);
      return unreadCount.value;
    } finally {
      isUnreadLoading.value = false;
      inflight = null;
    }
  })();

  return inflight;
};

const handleAuthInvalidated = () => {
  clearUnread();
};

if (typeof window !== 'undefined') {
  window.addEventListener('auth:invalidated', handleAuthInvalidated);
}

export const useChatUnreadCenter = () => ({
  unreadCount,
  hasUnread: computed(() => unreadCount.value > 0),
  isUnreadHydrated,
  isUnreadLoading,
  setUnreadCount,
  setUnreadFromRooms,
  clearUnread,
  syncUnreadCount,
});
