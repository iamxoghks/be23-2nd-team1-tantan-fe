import apiClient from '@/services/axios';

export const chatApi = {
  createRoom(payload) {
    return apiClient.post('/chat/rooms', payload);
  },

  rooms(params) {
    return apiClient.get('/chat/rooms', { params });
  },

  unreadCount() {
    return apiClient.get('/chat/unread-count');
  },

  messages(roomKey, params) {
    return apiClient.get(`/chat/rooms/${roomKey}/messages`, { params });
  },

  markRead(roomKey) {
    return apiClient.post(`/chat/rooms/${roomKey}/read`);
  },

  leave(roomKey) {
    return apiClient.post(`/chat/rooms/${roomKey}/leave`);
  },

  reportMessage(roomKey, messageId, payload) {
    return apiClient.post(`/chat/rooms/${roomKey}/messages/${messageId}/report`, payload);
  },
};
