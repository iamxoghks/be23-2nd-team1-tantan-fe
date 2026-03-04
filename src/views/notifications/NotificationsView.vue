<template>
  <div class="app-screen app-screen-white">
    <NavigationRail />

    <div class="app-main-column app-main-column-no-scroll">
      <header class="v-noti-header-main">
        <div class="v-noti-header-inner">
          <div class="u-row-gap-3">
            <div class="sx-views-notifications-notificationsview-001"><Bell :size="24" /></div>
            <div>
              <h1 class="ux-views-notifications-notificationsview-001">알림</h1>
              <p class="v-noti-subtitle">새로운 소식을 확인해보세요</p>
            </div>
          </div>
          <div class="v-noti-actions">
            <button class="v-noti-mark-all-btn" :disabled="isLoading || isMarkingAll" @click="markAllAsRead">
              <CheckCheck :size="16" />
              <span class="v-noti-mark-all-text">{{ isMarkingAll ? '처리 중...' : '모두 읽음' }}</span>
            </button>
            <button class="v-noti-settings-btn" aria-label="알림 설정" @click="goNotificationSettings">
              <Settings :size="20" />
            </button>
          </div>
        </div>
      </header>

      <main class="v-noti-main">
        <div class="v-content-wrap-sm">
          <div class="v-noti-tab-wrap">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="v-noti-tab-btn"
              :class="activeTab === tab.id ? 'v-noti-tab-active' : 'v-noti-tab-inactive'"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
              <div v-if="activeTab === tab.id" class="v-noti-tab-underline" />
              <span v-if="tab.id === 'all' && unreadCount > 0" class="v-noti-tab-badge">{{ unreadCount }}</span>
            </button>
          </div>

          <div class="v-noti-list">
            <div v-if="isLoading" class="v-noti-empty">
              <p class="v-noti-empty-text">알림을 불러오는 중입니다.</p>
            </div>

            <div v-else-if="errorMessage" class="v-noti-empty">
              <p class="v-noti-empty-text">{{ errorMessage }}</p>
            </div>

            <template v-else>
              <div
                v-for="notif in filteredNotifications"
                :key="notif.id"
                class="v-noti-item"
                :class="notif.isRead ? 'v-noti-item-read' : 'v-noti-item-unread'"
                role="button"
                tabindex="0"
                @click="openNotificationTarget(notif)"
                @keyup.enter="openNotificationTarget(notif)"
              >
                <div v-if="!notif.isRead" class="v-noti-dot" />

                <div class="sx-views-notifications-notificationsview-004">
                  <img :src="notif.actor.image" alt="" class="v-noti-actor ux-views-notifications-notificationsview-003" />
                  <div class="v-noti-type-icon-wrap" :class="typeIconWrapClass(notif.type)">
                    <component
                      :is="iconByType[notif.type] || Info"
                      :size="14"
                      :class="typeIconClass(notif.type)"
                      :fill="typeIconFill(notif.type)"
                    />
                  </div>
                </div>

                <div class="u-flex-1-min">
                  <div class="v-noti-content-line ux-views-notifications-notificationsview-004">
                    <span v-if="notif.actor.name" class="ux-views-notifications-notificationsview-005">{{ notif.actor.name }}</span>
                    <span class="ux-views-notifications-notificationsview-006">{{ notif.content }}</span>
                  </div>
                  <div class="v-noti-meta-line">
                    <span class="ux-views-notifications-notificationsview-007">{{ notif.timestamp }}</span>
                    <template v-if="notif.targetContent">
                      <span class="v-noti-meta-dot">·</span>
                      <span class="v-noti-target-content">"{{ notif.targetContent }}"</span>
                    </template>
                  </div>
                </div>

                <div v-if="notif.targetImage" class="v-noti-target-image-wrap">
                  <img :src="notif.targetImage" alt="" class="v-noti-target-image" />
                </div>

                <div class="v-noti-item-actions" @click.stop>
                  <button
                    class="v-noti-read-btn"
                    :disabled="notif.isRead"
                    @click.stop="markAsRead(notif.id)"
                    aria-label="읽음 처리"
                  >
                    <Check :size="18" />
                  </button>
                  <button
                    class="v-noti-read-btn v-noti-delete-btn"
                    @click.stop="deleteNotification(notif.id)"
                    aria-label="알림 삭제"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>

              <div v-if="filteredNotifications.length === 0" class="v-noti-empty">
                <div class="v-noti-empty-icon-wrap"><Bell :size="32" class="v-noti-empty-icon" /></div>
                <p class="v-noti-empty-text">새로운 알림이 없습니다.</p>
              </div>
            </template>
          </div>

          <div v-if="!isLoading && !errorMessage && filteredNotifications.length > 0 && hasMoreNotifications" class="v-noti-load-more-wrap">
            <button class="v-noti-load-more-btn" :disabled="isLoadingMore" @click="loadMoreNotifications">
              {{ isLoadingMore ? '불러오는 중...' : '이전 알림 더보기' }}
            </button>
          </div>
        </div>
      </main>
    </div>

    <Teleport to="body">
      <div
        v-if="isBlockedTargetModalOpen"
        class="v-noti-blocked-backdrop"
        @click.self="closeBlockedTargetModal"
      >
        <div class="v-noti-blocked-modal">
          <h3 class="v-noti-blocked-title">이동할 수 없어요</h3>
          <p class="v-noti-blocked-desc">{{ blockedTargetMessage }}</p>
          <div class="v-noti-blocked-actions">
            <button type="button" class="v-noti-blocked-confirm" @click="closeBlockedTargetModal">확인</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { Bell, Settings, CheckCheck, Check, Heart, MessageSquare, UserPlus, Zap, Trophy, Info, Trash2 } from 'lucide-vue-next';
import { communityPostApi, notificationApi } from '@/services/apis';
import { extractList, extractPayload } from '@/utils/api';
import { useNotificationCenter } from '@/composables/useNotificationCenter';

const tabs = [
  { id: 'all', label: '전체' },
  { id: 'activity', label: '활동' },
  { id: 'community', label: '커뮤니티' },
  { id: 'system', label: '시스템' },
];

const router = useRouter();
const activeTab = ref('all');
const notifications = ref([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const isMarkingAll = ref(false);
const hasMoreNotifications = ref(false);
const currentPage = ref(0);
const PAGE_SIZE = 20;
const errorMessage = ref('');
const isBlockedTargetModalOpen = ref(false);
const blockedTargetMessage = ref('삭제되었거나 접근 권한이 없는 게시글입니다.');
let stopSse = null;
const { setUnreadFromList } = useNotificationCenter();

const iconByType = {
  like: Heart,
  comment: MessageSquare,
  follow: UserPlus,
  workout: Zap,
  achievement: Trophy,
  system: Info,
};

const filteredNotifications = computed(() => notifications.value.filter((n) => {
  if (activeTab.value === 'all') return true;
  if (activeTab.value === 'activity') return ['workout', 'achievement'].includes(n.type);
  if (activeTab.value === 'community') return ['like', 'comment', 'follow'].includes(n.type);
  if (activeTab.value === 'system') return n.type === 'system';
  return true;
}));

const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

const toTimeAgo = (value) => {
  if (!value) return '방금 전';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  return `${days}일 전`;
};

const inferType = (item) => {
  const raw = String(
    item?.refType
    || item?.type
    || item?.notificationType
    || item?.category
    || ''
  ).toLowerCase();
  if (raw.includes('like')) return 'like';
  if (raw.includes('comment') || raw.includes('reply')) return 'comment';
  if (raw.includes('follow')) return 'follow';
  if (raw.includes('workout') || raw.includes('gym') || raw.includes('notice')) return 'workout';
  if (raw.includes('achievement') || raw.includes('badge')) return 'achievement';
  return 'system';
};

const fallbackMessageByRefType = (refTypeRaw) => {
  const refType = String(refTypeRaw || '').toUpperCase();

  if (refType.includes('REVIEW')) {
    return '헬스장에 새로운 리뷰가 등록되었습니다.';
  }
  if (refType.includes('COMMENT') || refType.includes('REPLY')) {
    return '내 글에 새로운 댓글이 달렸습니다.';
  }
  if (refType.includes('LIKE')) {
    return '내 게시글에 새로운 좋아요가 달렸습니다!';
  }
  if (refType.includes('FAVORITE') || refType.includes('FAV')) {
    return '내 헬스장이 새로운 즐겨찾기로 등록되었습니다!';
  }
  if (refType.includes('EVENT') || refType.includes('NOTICE')) {
    return '즐겨찾기한 헬스장에서 새로운 이벤트가 있습니다!';
  }
  if (refType.includes('REPORT')) {
    return '회원님의 신고가 처리되었습니다.';
  }
  if (refType.includes('PROMOTION') || refType.includes('MARKETING')) {
    return '새로운 프로모션/혜택 정보가 도착했습니다.';
  }
  if (refType.includes('SYSTEM')) {
    return '시스템 알림이 도착했습니다.';
  }
  return '새로운 알림이 도착했습니다.';
};

const fallbackAvatar = (seed) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed || 'user')}&backgroundType=gradientLinear`;

const splitActorFromMessage = (message) => {
  const normalized = typeof message === 'string' ? message.trim() : '';
  if (!normalized) return { actor: '', content: '' };

  const actorPrefixMatch = normalized.match(/^(.+?)님이\s+(.+)$/);
  if (actorPrefixMatch) {
    return {
      actor: actorPrefixMatch[1]?.trim() || '',
      content: actorPrefixMatch[2]?.trim() || normalized,
    };
  }

  return { actor: '', content: normalized };
};

const normalizeNotification = (item, index) => {
  const type = inferType(item);
  const rawMessage = typeof item?.message === 'string' ? item.message.trim() : '';
  const fallbackMessage = fallbackMessageByRefType(item?.refType || item?.type || item?.notificationType);
  const messageForDisplay = rawMessage || fallbackMessage;
  const parsed = splitActorFromMessage(messageForDisplay);
  const explicitActorName = (
    item?.actorName
    || item?.senderName
    || item?.fromUserName
    || item?.userName
    || ''
  ).trim();
  const actorName = explicitActorName || (type !== 'system' ? parsed.actor : '시스템');
  const content = (!explicitActorName && parsed.actor && type !== 'system')
    ? parsed.content
    : messageForDisplay;
  const actorImageSeed = actorName || type || 'user';

  return {
    id: String(item?.id ?? item?.notificationId ?? index),
    refType: item?.refType || '',
    refId: item?.refId ?? null,
    type,
    actor: {
      name: actorName,
      image: item?.actorImage || item?.senderImage || item?.profileImage || fallbackAvatar(actorImageSeed),
    },
    content,
    timestamp: toTimeAgo(item?.createdTime || item?.createdAt || item?.timestamp || item?.sentAt),
    rawCreatedTime: item?.createdTime || item?.createdAt || item?.timestamp || item?.sentAt || null,
    isRead: Boolean(item?.isRead || item?.read),
    targetContent: item?.targetContent || item?.targetTitle || '',
    targetImage: item?.targetImage || '',
  };
};

const mergeNotifications = (base, incoming) => {
  if (!Array.isArray(base) || base.length === 0) return [...incoming];
  if (!Array.isArray(incoming) || incoming.length === 0) return [...base];

  const mergedById = new Map(base.map((item) => [String(item.id), item]));
  incoming.forEach((item) => {
    mergedById.set(String(item.id), item);
  });

  return Array.from(mergedById.values()).sort((a, b) => {
    const aTime = new Date(a?.rawCreatedTime || 0).getTime();
    const bTime = new Date(b?.rawCreatedTime || 0).getTime();
    return bTime - aTime;
  });
};

const upsertNotification = (incomingRaw) => {
  if (!incomingRaw || typeof incomingRaw !== 'object') return;
  const incoming = normalizeNotification(incomingRaw, 0);
  const exists = notifications.value.some((item) => String(item.id) === String(incoming.id));
  if (exists) {
    notifications.value = notifications.value.map((item) => (
      String(item.id) === String(incoming.id) ? { ...item, ...incoming } : item
    ));
    setUnreadFromList(notifications.value);
    return;
  }
  notifications.value = [incoming, ...notifications.value];
  setUnreadFromList(notifications.value);
};

const fetchNotificationPage = async (page, { append = false } = {}) => {
  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
    errorMessage.value = '';
  }

  try {
    const response = await notificationApi.listPaged({
      unreadOnly: false,
      page,
      size: PAGE_SIZE,
      sort: 'createdTime,DESC',
    });
    const payload = extractPayload(response, {});
    const pageItems = extractList(payload).map(normalizeNotification);

    notifications.value = append
      ? mergeNotifications(notifications.value, pageItems)
      : pageItems;

    hasMoreNotifications.value = Boolean(payload?.hasNext);
    currentPage.value = Number(payload?.number ?? page);
    setUnreadFromList(notifications.value);
  } catch (error) {
    if (!append) {
      notifications.value = [];
      errorMessage.value = '알림 목록을 불러오지 못했습니다.';
    }
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const loadNotifications = async () => {
  hasMoreNotifications.value = false;
  currentPage.value = 0;
  await fetchNotificationPage(0, { append: false });
};

const loadMoreNotifications = async () => {
  if (isLoadingMore.value || !hasMoreNotifications.value) return;
  await fetchNotificationPage(currentPage.value + 1, { append: true });
};

const markAsRead = async (id) => {
  try {
    await notificationApi.markRead(id);
    notifications.value = notifications.value.map((item) => (
      String(item.id) === String(id)
        ? { ...item, isRead: true }
        : item
    ));
    setUnreadFromList(notifications.value);
  } catch (error) {
    errorMessage.value = '알림 읽음 처리에 실패했습니다.';
  }
};

const deleteNotification = async (id) => {
  try {
    await notificationApi.delete(id);
    notifications.value = notifications.value.filter((item) => String(item.id) !== String(id));
    setUnreadFromList(notifications.value);
  } catch (error) {
    errorMessage.value = '알림 삭제에 실패했습니다.';
  }
};

const resolveNotificationTarget = (notification) => {
  const refType = String(notification?.refType || '').toUpperCase();
  const refId = notification?.refId;

  if (refType.includes('CHAT')) return { path: '/chat' };

  if (refType.includes('COMMENT') || refType.includes('POST') || refType.includes('COMMUNITY')) {
    return refId ? { path: `/community/${encodeURIComponent(String(refId))}` } : { path: '/community' };
  }

  if (refType.includes('GYM') || refType.includes('RESERVATION') || refType.includes('SLOT')) {
    return { path: '/' };
  }

  if (refType.includes('FOLLOW') || refType.includes('PROFILE') || refType.includes('WORKOUT')) {
    return { path: '/profile' };
  }

  return { path: '/notifications' };
};

const closeBlockedTargetModal = () => {
  isBlockedTargetModalOpen.value = false;
};

const openBlockedTargetModal = (message) => {
  blockedTargetMessage.value = String(message || '').trim() || '삭제되었거나 접근 권한이 없는 게시글입니다.';
  isBlockedTargetModalOpen.value = true;
};

const ensureNotificationTargetAccessible = async (notification, target) => {
  if (!target?.path || !String(target.path).startsWith('/community/')) {
    return true;
  }
  const refId = Number(notification?.refId || 0);
  if (!Number.isFinite(refId) || refId <= 0) {
    return true;
  }
  try {
    await communityPostApi.detail(refId, { countView: false });
    return true;
  } catch (error) {
    const status = Number(error?.response?.status || 0);
    if (status === 403) {
      openBlockedTargetModal('접근 권한이 없는 게시글입니다.');
      return false;
    }
    if (status === 404) {
      openBlockedTargetModal('삭제되었거나 존재하지 않는 게시글입니다.');
      return false;
    }
    openBlockedTargetModal('현재 게시글에 접근할 수 없습니다.');
    return false;
  }
};

const openNotificationTarget = async (notification) => {
  if (!notification) return;

  if (!notification.isRead) {
    await markAsRead(notification.id);
  }

  const target = resolveNotificationTarget(notification);
  const canMove = await ensureNotificationTargetAccessible(notification, target);
  if (!canMove) return;
  router.push(target);
};

const markAllAsRead = async () => {
  const unreadIds = notifications.value.filter((n) => !n.isRead).map((n) => n.id);
  if (unreadIds.length === 0) return;

  isMarkingAll.value = true;
  try {
    await Promise.all(unreadIds.map((id) => notificationApi.markRead(id)));
    notifications.value = notifications.value.map((n) => ({ ...n, isRead: true }));
    setUnreadFromList(notifications.value);
  } catch (error) {
    errorMessage.value = '알림 읽음 처리에 실패했습니다.';
  } finally {
    isMarkingAll.value = false;
  }
};

const goNotificationSettings = () => {
  router.push('/settings/notifications');
};

const typeIconWrapClass = (type) => ({
  like: 'v-noti-type-like-wrap',
  comment: 'v-noti-type-comment-wrap',
  follow: 'v-noti-type-follow-wrap',
  workout: 'v-noti-type-workout-wrap',
  achievement: 'v-noti-type-achievement-wrap',
  system: 'v-noti-type-system-wrap',
}[type] || 'v-noti-type-system-wrap');

const typeIconClass = (type) => ({
  like: 'v-noti-type-like',
  comment: 'v-noti-type-comment',
  follow: 'v-noti-type-follow',
  workout: 'v-noti-type-workout',
  achievement: 'v-noti-type-achievement',
  system: 'v-noti-type-system',
}[type] || 'v-noti-type-system');

const typeIconFill = (type) => (['like', 'comment', 'workout'].includes(type) ? 'currentColor' : 'none');

const startSseSubscription = () => {
  stopSse = notificationApi.subscribe({
    onConnect: () => {
      // no-op
    },
    onNotification: (payload) => {
      upsertNotification(payload);
    },
    onError: () => {
      // keep polling/list mode only when SSE fails
    },
  });
};

onMounted(async () => {
  await loadNotifications();
  startSseSubscription();
});

onBeforeUnmount(() => {
  if (typeof stopSse === 'function') {
    stopSse();
  }
});
</script>

<style scoped>
.v-noti-blocked-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2300;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.v-noti-blocked-modal {
  width: min(420px, 100%);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
  border: 1px solid #e2e8f0;
  padding: 22px 20px 18px;
}

.v-noti-blocked-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.v-noti-blocked-desc {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}

.v-noti-blocked-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.v-noti-blocked-confirm {
  min-width: 88px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}
</style>
