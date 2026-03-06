<template>
  <nav class="rail-nav">
    <div class="rail-nav-logo">
      <RouterLink to="/" class="rail-logo-link" aria-label="짐맵 로고">
        <Dumbbell :size="28" :stroke-width="2.5" />
      </RouterLink>
    </div>

    <ul class="rail-nav-list">
      <li
        v-for="item in items"
        :key="item.id"
        :class="`rail-item ${item.className || ''}`"
      >
        <button
          v-if="item.action"
          type="button"
          :aria-label="item.label"
          :title="item.label"
          :class="`rail-item-link rail-item-link-inactive`"
          @click="item.action()"
        >
          <div class="rail-item-icon-wrap">
            <div class="rail-item-icon-box">
              <component :is="item.icon" :size="22" :stroke-width="2.5" />
            </div>
            <span
              v-if="item.hasDot"
              class="rail-item-dot"
            />
          </div>
          <span
            class="rail-item-label rail-item-label-inactive"
          >
            {{ item.label }}
          </span>
        </button>

        <RouterLink
          v-else
          :to="item.to"
          :aria-label="item.label"
          :title="item.label"
          :class="`rail-item-link ${route.path === item.to ? 'rail-item-link-active' : 'rail-item-link-inactive'}`"
        >
          <div class="rail-item-icon-wrap">
            <div class="rail-item-icon-box">
              <component :is="item.icon" :size="22" :stroke-width="2.5" />
            </div>
            <span
              v-if="item.hasDot && route.path !== item.to"
              class="rail-item-dot"
            />
          </div>
          <span
            :class="`rail-item-label ${route.path === item.to ? 'rail-item-label-active' : 'rail-item-label-inactive'}`"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  watch,
} from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Home, Send, Share2, Bell, User, Dumbbell, LogIn, LogOut, Shield } from 'lucide-vue-next';
import { useAuthModal } from '@/composables/useAuthModal';
import { useSession } from '@/composables/useSession';
import { useNotificationCenter } from '@/composables/useNotificationCenter';
import { userApi } from '@/services/apis';
import { notifyAuthInvalidated } from '@/services/authLifecycle';

const route = useRoute();
const router = useRouter();
const { openAuthModal } = useAuthModal();
const { sessionProfile, isAuthenticated, syncSessionFromServer, primeSessionFromToken } = useSession();
const { hasUnread, clearUnread, syncUnreadCount } = useNotificationCenter();

const logout = async () => {
  try {
    await userApi.logout();
  } catch (error) {
    // ignore logout API failure and continue local logout
  } finally {
    notifyAuthInvalidated({ reason: 'logout' });
    router.push('/');
  }
};

const refreshUnreadBadge = async ({ force = false } = {}) => {
  if (!isAuthenticated.value) {
    clearUnread();
    return;
  }
  try {
    await syncUnreadCount({ force });
  } catch (error) {
    // no-op: unread badge는 마지막 정상값을 유지합니다.
  }
};

const items = computed(() => {
  const chatItem = isAuthenticated.value
    ? { id: 'chat', icon: Send, label: '채팅', to: '/chat' }
    : { id: 'chat', icon: Send, label: '채팅', action: openAuthModal };
  const communityItem = isAuthenticated.value
    ? { id: 'community', icon: Share2, label: '커뮤니티', to: '/community' }
    : { id: 'community', icon: Share2, label: '커뮤니티', action: openAuthModal };
  const notificationItem = isAuthenticated.value
    ? { id: 'notifications', icon: Bell, label: '알림', to: '/notifications', hasDot: hasUnread.value }
    : { id: 'notifications', icon: Bell, label: '알림', action: openAuthModal };

  const base = [
    { id: 'home', icon: Home, label: '홈', to: '/' },
    chatItem,
    communityItem,
    notificationItem,
    isAuthenticated.value
      ? { id: 'profile', icon: User, label: '프로필', to: '/profile' }
      : { id: 'auth', icon: LogIn, label: '로그인/가입', action: openAuthModal, className: '' },
  ];

  if (isAuthenticated.value) {
    base.push({
      id: 'logout',
      icon: LogOut,
      label: '로그아웃',
      action: logout,
    });
  }

  if (sessionProfile.value?.role === 'ADMIN') {
    base.splice(base.length - 1, 0, {
      id: 'admin',
      icon: Shield,
      label: '관리자',
      to: '/admin',
      className: 'rail-desktop-only',
    });
  }

  return base;
});

onMounted(async () => {
  primeSessionFromToken();
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);

  if (!isAuthenticated.value) {
    clearUnread();
    return;
  }
  try {
    await syncSessionFromServer();
  } catch (error) {
    // no-op: route guard will handle hard redirects
  }
  await refreshUnreadBadge({ force: true });
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('focus', handleWindowFocus);
});

watch(
  () => isAuthenticated.value,
  (next) => {
    if (!next) {
      clearUnread();
      return;
    }
    refreshUnreadBadge({ force: true });
  },
);

watch(
  () => route.fullPath,
  (nextPath, prevPath) => {
    const touchedNotifications = String(nextPath).startsWith('/notifications')
      || String(prevPath).startsWith('/notifications');
    if (touchedNotifications) {
      refreshUnreadBadge({ force: true });
    }
  },
);

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    refreshUnreadBadge({ force: true });
  }
};

const handleWindowFocus = () => {
  refreshUnreadBadge({ force: true });
};
</script>
