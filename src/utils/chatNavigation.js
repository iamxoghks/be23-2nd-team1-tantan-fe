const PENDING_CHAT_ROOM_STORAGE_KEY = 'tantan.pending-chat-room';

const isBrowser = () => typeof window !== 'undefined' && !!window.sessionStorage;

export const savePendingChatRoom = (roomSummary) => {
  const roomKey = String(roomSummary?.roomKey || '').trim();
  if (!roomKey || !isBrowser()) return;

  window.sessionStorage.setItem(
    PENDING_CHAT_ROOM_STORAGE_KEY,
    JSON.stringify({
      ...roomSummary,
      roomKey,
    }),
  );
};

export const consumePendingChatRoom = (expectedRoomKey = '') => {
  if (!isBrowser()) return null;

  const rawValue = window.sessionStorage.getItem(PENDING_CHAT_ROOM_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    const roomKey = String(parsed?.roomKey || '').trim();
    if (!roomKey) {
      window.sessionStorage.removeItem(PENDING_CHAT_ROOM_STORAGE_KEY);
      return null;
    }

    if (expectedRoomKey && roomKey !== String(expectedRoomKey).trim()) {
      return null;
    }

    window.sessionStorage.removeItem(PENDING_CHAT_ROOM_STORAGE_KEY);
    return {
      ...parsed,
      roomKey,
    };
  } catch (error) {
    window.sessionStorage.removeItem(PENDING_CHAT_ROOM_STORAGE_KEY);
    return null;
  }
};
