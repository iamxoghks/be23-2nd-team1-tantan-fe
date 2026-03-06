import { computed, ref } from 'vue';
import { notificationApi } from '@/services/apis';
import { getAccessToken } from '@/services/token';
import { extractList, extractPayload } from '@/utils/api';

const unreadCount = ref(0);
const isUnreadHydrated = ref(false);
const isUnreadLoading = ref(false);

let inflight = null;

const handleAuthInvalidated = () => {
  clearUnread();
};

if (typeof window !== 'undefined') {
  window.addEventListener('auth:invalidated', handleAuthInvalidated);
}

const countUnreadFromList = (list = []) => list.reduce((count, item) => (
  count + (item?.isRead || item?.read ? 0 : 1)
), 0);

const setUnreadCount = (nextCount) => {
  unreadCount.value = Math.max(0, Number(nextCount) || 0);
  isUnreadHydrated.value = true;
};

const setUnreadFromList = (list = []) => {
  setUnreadCount(countUnreadFromList(list));
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
      const response = await notificationApi.listPaged({
        unreadOnly: true,
        page: 0,
        size: 1,
      });
      const payload = extractPayload(response);
      const list = extractList(payload);

      const totalUnread = Number(payload?.totalElements);
      if (Number.isFinite(totalUnread)) {
        setUnreadCount(totalUnread);
      } else {
        setUnreadCount(list.length || countUnreadFromList(list));
      }
      return unreadCount.value;
    } finally {
      isUnreadLoading.value = false;
      inflight = null;
    }
  })();

  return inflight;
};

export const useNotificationCenter = () => ({
  unreadCount,
  hasUnread: computed(() => unreadCount.value > 0),
  isUnreadHydrated,
  isUnreadLoading,
  setUnreadCount,
  setUnreadFromList,
  clearUnread,
  syncUnreadCount,
});
