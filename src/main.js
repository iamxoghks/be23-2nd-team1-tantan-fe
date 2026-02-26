import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// Ignore benign browser ResizeObserver warnings that can surface during rapid viewport changes.
const isResizeObserverLoopError = (message) =>
  typeof message === 'string'
  && (
    message.includes('ResizeObserver loop completed with undelivered notifications')
    || message.includes('ResizeObserver loop limit exceeded')
  );

window.addEventListener('error', (event) => {
  const message = event?.message || '';
  if (isResizeObserverLoopError(message)) {
    event.preventDefault();
  }
});

createApp(App).use(router).mount('#app');
