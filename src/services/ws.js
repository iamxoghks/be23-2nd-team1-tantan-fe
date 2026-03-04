const WS_BASE_URL =
  import.meta.env.VUE_APP_WS_BASE_URL ||
  import.meta.env.VITE_WS_BASE_URL ||
  import.meta.env.VUE_APP_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

function toWsUrl(httpOrWsUrl) {
  if (httpOrWsUrl.startsWith('ws://') || httpOrWsUrl.startsWith('wss://')) {
    return httpOrWsUrl;
  }

  if (httpOrWsUrl.startsWith('https://')) {
    return httpOrWsUrl.replace('https://', 'wss://');
  }

  return httpOrWsUrl.replace('http://', 'ws://');
}

function normalizeWsBaseUrl(rawUrl) {
  const wsUrl = toWsUrl(String(rawUrl || ''));
  // Allow env values like ".../ws" while connectEndpoint is also "/ws".
  return wsUrl.replace(/\/ws\/?$/, '');
}

export const wsConfig = {
  connectEndpoint: '/ws',
  sendDestination: '/app/send',
  typingDestination: '/app/typing',
  roomTopic(roomId) {
    return `/user/queue/chat/rooms/${roomId}`;
  },
  wsBaseUrl: normalizeWsBaseUrl(WS_BASE_URL),
};
