import { computed, ref } from 'vue';
import { Client } from '@stomp/stompjs';
import { chatApi } from '@/services/apis';
import { decodeJwtPayload, getAccessToken } from '@/services/token';
import { wsConfig } from '@/services/ws';
import { extractPayload } from '@/utils/api';

const unreadCount = ref(0);
const isUnreadHydrated = ref(false);
const isUnreadLoading = ref(false);

let inflight = null;
let connectInflight = null;
let stompClient = null;
let inboxSubscription = null;
let pendingForceRefresh = false;

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
  pendingForceRefresh = false;
};

const clearInboxSubscription = () => {
  if (!inboxSubscription) return;
  try {
    inboxSubscription.unsubscribe();
  } catch (error) {
    // ignore
  }
  inboxSubscription = null;
};

const disconnectInbox = () => {
  clearInboxSubscription();
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (error) {
      // ignore
    }
  }
  stompClient = null;
  connectInflight = null;
  pendingForceRefresh = false;
};

const syncUnreadCount = async ({ force = false } = {}) => {
  if (!getAccessToken()) {
    disconnectInbox();
    clearUnread();
    return 0;
  }

  if (!force && isUnreadHydrated.value) {
    return unreadCount.value;
  }

  if (inflight) {
    if (force) pendingForceRefresh = true;
    return inflight;
  }

  isUnreadLoading.value = true;
  const currentRequest = (async () => {
    try {
      const response = await chatApi.unreadCount();
      const payload = extractPayload(response);
      setUnreadCount(payload?.unreadCount);
      return unreadCount.value;
    } finally {
      isUnreadLoading.value = false;
    }
  })();
  inflight = currentRequest;

  try {
    return await currentRequest;
  } finally {
    if (inflight === currentRequest) {
      inflight = null;
    }
    if (pendingForceRefresh && getAccessToken()) {
      pendingForceRefresh = false;
      syncUnreadCount({ force: true }).catch(() => {
        // ignore queued unread refresh failure
      });
    }
  }
};

const getCurrentSessionEmail = () => {
  const payload = decodeJwtPayload(getAccessToken());
  return String(payload?.sub || payload?.email || '').trim().toLowerCase();
};

const parseInboxFrame = (frame) => {
  try {
    const payload = JSON.parse(frame?.body || '{}');
    const type = String(payload?.type || 'MESSAGE').toUpperCase();
    if (type === 'TYPING_START' || type === 'TYPING_STOP') {
      return { shouldRefresh: false, shouldIncrement: false };
    }

    const senderEmail = String(payload?.senderEmail || '').trim().toLowerCase();
    const currentEmail = getCurrentSessionEmail();
    if (senderEmail && currentEmail && senderEmail === currentEmail) {
      return { shouldRefresh: false, shouldIncrement: false };
    }

    return { shouldRefresh: true, shouldIncrement: true };
  } catch (error) {
    return { shouldRefresh: true, shouldIncrement: false };
  }
};

const handleInboxFrame = (frame) => {
  const { shouldRefresh, shouldIncrement } = parseInboxFrame(frame);
  if (!shouldRefresh) return;
  if (shouldIncrement) {
    setUnreadCount(unreadCount.value + 1);
  }
  syncUnreadCount({ force: true }).catch(() => {
    // ignore inbox refresh failure and keep last known badge
  });
};

const subscribeInbox = () => {
  if (!stompClient?.connected || inboxSubscription) return;
  inboxSubscription = stompClient.subscribe(wsConfig.inboxTopic(), handleInboxFrame);
};

const ensureInboxConnected = async () => {
  if (!getAccessToken()) {
    disconnectInbox();
    clearUnread();
    return false;
  }

  if (stompClient?.connected) {
    subscribeInbox();
    return true;
  }

  if (connectInflight) return connectInflight;

  connectInflight = new Promise((resolve) => {
    const token = getAccessToken();
    const client = new Client({
      brokerURL: `${wsConfig.wsBaseUrl}${wsConfig.connectEndpoint}`,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: async () => {
        stompClient = client;
        subscribeInbox();
        try {
          await syncUnreadCount({ force: true });
        } catch (error) {
          // ignore initial unread refresh failure
        }
        resolve(true);
      },
      onStompError: () => {
        clearInboxSubscription();
        resolve(false);
      },
      onWebSocketClose: () => {
        clearInboxSubscription();
        if (stompClient === client) {
          stompClient = null;
        }
      },
      onWebSocketError: () => {
        // ignore and let reconnectDelay handle reconnection
      },
    });

    stompClient = client;
    client.activate();
  }).finally(() => {
    connectInflight = null;
  });

  return connectInflight;
};

const handleAuthInvalidated = () => {
  disconnectInbox();
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
  ensureInboxConnected,
  disconnectInbox,
});
