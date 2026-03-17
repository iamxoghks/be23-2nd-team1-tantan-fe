const getValidWsBaseUrl = () => {
  const envViteWs = import.meta.env.VITE_WS_BASE_URL;
  const envVueWs = import.meta.env.VUE_APP_WS_BASE_URL;
  const envViteApi = import.meta.env.VITE_API_BASE_URL;
  const envVueApi = import.meta.env.VUE_APP_API_BASE_URL;
  
  const candidates = [envViteWs, envVueWs, envViteApi, envVueApi];
  for (const val of candidates) {
    if (val && (val.startsWith('http') || val.startsWith('ws'))) return val;
  }
  
  return 'http://localhost:8080';
};

const WS_BASE_URL = getValidWsBaseUrl();

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
  inboxTopic() {
    return '/user/queue/chat/inbox';
  },
  roomTopic(roomId) {
    return `/user/queue/chat/rooms/${roomId}`;
  },
  wsBaseUrl: normalizeWsBaseUrl(WS_BASE_URL),
};
