import apiClient from '@/services/axios';
import { getAccessToken } from '@/services/token';

export const notificationApi = {
  listPaged(params) {
    return apiClient.get('/notifications/paged', { params });
  },

  markRead(id) {
    return apiClient.post(`/notifications/${id}/read`);
  },

  delete(id) {
    return apiClient.delete(`/notifications/${id}`);
  },

  subscribe({ onConnect, onNotification, onError } = {}) {
    const baseURL = String(apiClient.defaults.baseURL || '').replace(/\/+$/, '');
    const token = getAccessToken();
    const controller = new AbortController();

    const parseData = (raw) => {
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (error) {
        return raw;
      }
    };

    const run = async () => {
      try {
        const response = await fetch(`${baseURL}/notifications/subscribe`, {
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE subscribe failed: ${response.status}`);
        }
        if (!response.body) {
          throw new Error('SSE stream body is empty');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let buffer = '';
        let eventName = 'message';
        let dataLines = [];

        const flushEvent = () => {
          if (dataLines.length === 0) {
            eventName = 'message';
            return;
          }

          const rawData = dataLines.join('\n');
          const parsed = parseData(rawData);
          if (eventName === 'connect') onConnect?.(parsed);
          if (eventName === 'notification') onNotification?.(parsed);

          eventName = 'message';
          dataLines = [];
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';

          lines.forEach((line) => {
            if (!line) {
              flushEvent();
              return;
            }
            if (line.startsWith(':')) return;
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim() || 'message';
              return;
            }
            if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trimStart());
            }
          });
        }

        if (buffer.trim()) {
          const leftover = buffer.trim();
          if (leftover.startsWith('data:')) {
            const parsed = parseData(leftover.slice(5).trimStart());
            onNotification?.(parsed);
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          onError?.(error);
        }
      }
    };

    run();

    return () => {
      controller.abort();
    };
  },
};
