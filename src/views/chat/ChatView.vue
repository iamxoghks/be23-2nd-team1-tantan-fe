<template>
  <div class="app-screen app-screen-chat">
    <NavigationRail />

    <div class="layout-with-rail-offset">
      <div class="chat-layout">
        <div class="v-chat-sidebar-panel" :class="selectedRoomId ? 'chat-sidebar-hidden-mobile' : 'chat-sidebar-visible'">
          <div class="chat-side-search-wrap">
            <div class="chat-side-search-shell">
              <input
                v-model="roomSearchTerm"
                type="text"
                placeholder="대화방 프로필명 검색"
                class="v-chat-search-input"
              />
              <Search class="chat-side-search-icon" :size="18" />
              <button
                v-if="hasRoomSearchTerm"
                type="button"
                class="chat-side-search-clear-btn"
                aria-label="대화방 검색어 지우기"
                @pointerdown.prevent.stop="clearRoomSearch"
                @click.prevent.stop="clearRoomSearch"
              >
                <X :size="14" />
              </button>
            </div>
          </div>

          <div class="chat-side-filter-row">
            <span class="chat-side-filter-title">전체</span>
            <div class="chat-side-filter-right">
              <span class="chat-side-filter-label">안읽음</span>
              <span class="chat-side-filter-count">{{ unreadTotal }}</span>
            </div>
          </div>

          <div class="chat-room-list">
            <div v-if="isLoadingRooms" class="chat-room-item">채팅방 불러오는 중...</div>
            <div v-else-if="chatLoadError" class="chat-room-item">{{ chatLoadError }}</div>
            <div
              v-for="room in filteredChatRooms"
              :key="room.id"
              class="chat-room-item"
              :class="selectedRoomId === room.id ? 'chat-room-item-active' : 'chat-room-item-hover'"
              @click="selectRoom(room.id)"
            >
              <div class="v-chat-room-avatar" :style="roomAvatarStyle(room)">
                <img
                  :src="room.avatarImageUrl"
                  :alt="`${room.name} 프로필`"
                  class="v-chat-room-avatar-image"
                  @error="handleUserAvatarError"
                />
              </div>
              <div class="chat-room-content">
                <div class="chat-room-head">
                  <div class="chat-room-title-wrap">
                    <span class="chat-room-title">{{ room.name }}</span>
                    <span v-if="room.verified" class="chat-room-verified">✓</span>
                    <span class="chat-room-date">· {{ room.date }}</span>
                  </div>
                  <span v-if="room.unread > 0" class="chat-unread-badge">{{ room.unread }}</span>
                </div>
                <p class="chat-room-last-msg">{{ room.lastMsg }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-main-layout" :class="!selectedRoomId ? 'chat-main-hidden-mobile' : 'chat-main-layout-visible'">
          <div v-if="selectedRoom" class="chat-main-panel">
            <div class="chat-main-header">
              <div class="chat-main-head-left">
                <button class="chat-back-btn chat-back-btn-mobile" @click="selectedRoomId = null"><ChevronLeft :size="24" /></button>
                <button class="v-chat-room-avatar-sm v-chat-avatar-btn" :style="roomAvatarStyle(selectedRoom)" @click="goToCounterpartProfile">
                  <img
                    :src="selectedRoom.avatarImageUrl"
                    :alt="`${selectedRoom.name} 프로필`"
                    class="v-chat-room-avatar-image"
                    @error="handleUserAvatarError"
                  />
                </button>
                <div class="v-chat-room-meta">
                  <span class="v-chat-room-name">{{ selectedRoom.name }}</span>
                  <span class="v-chat-room-status" :aria-label="counterpartStatusLabel">
                    <span v-if="counterpartStatus === 'typing'" class="chat-presence-typing">
                      <span class="chat-presence-dot"></span>
                      <span class="chat-presence-dot"></span>
                      <span class="chat-presence-dot"></span>
                    </span>
                    <span
                      v-else
                      class="chat-presence-single"
                      :class="counterpartStatus === 'online' ? 'chat-presence-single-online' : 'chat-presence-single-offline'"
                    ></span>
                  </span>
                </div>
              </div>
              <div class="v-chat-header-actions">
                <div v-if="isMessageSearchOpen" class="chat-main-search-shell">
                  <Search class="chat-main-search-icon" :size="14" />
                  <input
                    ref="messageSearchInputRef"
                    v-model="messageSearchTerm"
                    type="text"
                    placeholder="대화 내용 검색"
                    class="v-chat-message-search-input"
                    @keydown.esc.prevent="clearMessageSearch"
                  />
                  <button
                    type="button"
                    class="chat-main-search-clear-btn"
                    aria-label="대화 내용 검색 닫기"
                    @pointerdown.prevent.stop="clearMessageSearch"
                    @click.prevent.stop="clearMessageSearch"
                  >
                    <X :size="12" />
                  </button>
                </div>
                <button v-else type="button" class="v-chat-header-icon-btn" @click="toggleMessageSearch">
                  <Search :size="20" class="v-chat-action-icon" />
                </button>
                <div ref="roomMenuRef" class="chat-room-menu-wrap">
                  <button type="button" class="v-chat-header-icon-btn" @click="toggleRoomMenu">
                    <MoreHorizontal :size="20" class="v-chat-action-icon" />
                  </button>
                  <div v-if="isRoomMenuOpen" class="chat-room-menu-dropdown">
                    <button type="button" class="chat-room-menu-item" @click="leaveSelectedRoom">채팅방 나가기</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="chat-message-area-shell">
              <div ref="chatMessageAreaRef" class="chat-message-area" @scroll="handleMessageAreaScroll">
                <div class="chat-date-row"><span class="chat-date-chip">2026년 1월 28일 수요일</span></div>
                <div
                  v-for="message in selectedMessages"
                  :key="message.id"
                  :ref="(el) => setMessageElement(message.id, el)"
                  :class="message.isMine ? 'chat-msg-row-mine' : 'chat-msg-row-other'"
                  class="chat-msg-row"
                >
                  <template v-if="!message.isMine">
                    <button class="chat-msg-avatar chat-msg-avatar-btn" @click="goToCounterpartProfile">
                      <img
                        :src="selectedRoom.avatarImageUrl"
                        :alt="`${selectedRoom?.name || '상대방'} 프로필`"
                        class="chat-msg-avatar-image"
                        @error="handleUserAvatarError"
                      />
                    </button>
                    <div class="chat-msg-col">
                      <span class="chat-msg-sender">{{ selectedRoom?.name }}</span>
                      <div class="chat-msg-bubble-row chat-msg-bubble-row-other">
                        <div class="chat-bubble chat-bubble-other">
                          <template
                            v-for="(segment, segmentIndex) in getHighlightedMessageSegments(message)"
                            :key="`${message.id}-other-${segmentIndex}`"
                          >
                            <mark v-if="segment.match" class="chat-search-highlight">{{ segment.text }}</mark>
                            <span v-else>{{ segment.text }}</span>
                          </template>
                        </div>
                        <span class="chat-msg-time">{{ formatMessageDisplayTime(message) }}</span>
                        <button type="button" class="chat-msg-report-btn" @click="reportChatMessage(message)">
                          <Flag :size="10" />
                        </button>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="chat-msg-col chat-msg-col-mine">
                      <div class="chat-msg-bubble-row chat-msg-bubble-row-mine">
                        <span v-if="isLastReadMyMessage(message)" class="chat-msg-read-label">읽음</span>
                        <span class="chat-msg-time">{{ formatMessageDisplayTime(message) }}</span>
                        <div class="chat-bubble chat-bubble-mine">
                          <template
                            v-for="(segment, segmentIndex) in getHighlightedMessageSegments(message)"
                            :key="`${message.id}-mine-${segmentIndex}`"
                          >
                            <mark v-if="segment.match" class="chat-search-highlight">{{ segment.text }}</mark>
                            <span v-else>{{ segment.text }}</span>
                          </template>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <button
                v-if="isScrollToBottomVisible"
                type="button"
                class="chat-scroll-bottom-btn"
                aria-label="맨 아래 대화로 이동"
                @click="scrollMessagesToBottom"
              >
                <ChevronDown :size="21" />
              </button>
            </div>

            <div v-if="isMessageSearchOpen && hasMessageSearchTerm" class="chat-search-status-bar">
              <div class="chat-search-status-summary">
                <Search :size="15" class="chat-search-status-icon" />
                <span class="chat-search-status-count">{{ messageSearchResultLabel }}</span>
              </div>
              <div class="chat-search-status-actions">
                <button
                  type="button"
                  class="chat-search-status-btn"
                  :disabled="!canMoveToPreviousSearchResult"
                  aria-label="이전 검색 결과"
                  @click="moveToPreviousSearchResult"
                >
                  <ChevronUp :size="16" />
                </button>
                <button
                  type="button"
                  class="chat-search-status-btn"
                  :disabled="!canMoveToNextSearchResult"
                  aria-label="다음 검색 결과"
                  @click="moveToNextSearchResult"
                >
                  <ChevronDown :size="16" />
                </button>
              </div>
            </div>

            <div class="chat-input-section">
              <div class="chat-input-shell">
                <textarea
                  ref="messageInputRef"
                  v-model="messageInput"
                  rows="1"
                  placeholder="메시지를 입력하세요..."
                  class="v-chat-input-box"
                  @input="handleMessageInput"
                  @blur="stopTypingForRoom(selectedRoom?.roomKey || selectedRoomId)"
                  @keydown.enter.exact.prevent="sendMessage"
                />
                <button class="v-chat-send-btn" @click="sendMessage"><Send :size="16" /></button>
              </div>
            </div>
          </div>

          <div v-else class="chat-empty-panel">
            <div class="v-chat-empty-state">
              <div class="v-chat-empty-icon"><MessageSquare :size="40" class="v-text-white" /></div>
              <p class="v-chat-empty-title">{{ chatEmptyStateTitle }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ReportReasonModal
      :open="isReportModalOpen"
      :reason="reportReason"
      :error-message="reportErrorMessage"
      :submitting="isSubmittingReport"
      @update:reason="reportReason = $event"
      @close="closeReportModal"
      @submit="submitReport"
    />

    <Teleport to="body">
      <div v-if="reportToastMessage" class="v-report-toast">{{ reportToastMessage }}</div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Client } from '@stomp/stompjs';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import ReportReasonModal from '@/components/modals/ReportReasonModal.vue';
import { Search, MessageSquare, MoreHorizontal, Send, ChevronLeft, ChevronUp, ChevronDown, X, Flag } from 'lucide-vue-next';
import { chatApi, userApi } from '@/services/apis';
import { extractList, extractPayload } from '@/utils/api';
import { consumePendingChatRoom } from '@/utils/chatNavigation';
import { getAccessToken } from '@/services/token';
import { registerAuthCleanup } from '@/services/authLifecycle';
import { wsConfig } from '@/services/ws';
import { useChatUnreadCenter } from '@/composables/useChatUnreadCenter';
import { resolveUserAvatar, handleUserAvatarError } from '@/utils/userAvatar';
import { useRoute, useRouter } from 'vue-router';

const chatRoomsData = ref([]);
const selectedRoomId = ref(null);
const messageInput = ref('');
const roomSearchTerm = ref('');
const messageSearchTerm = ref('');
const isMessageSearchOpen = ref(false);
const messageSearchInputRef = ref(null);
const messageInputRef = ref(null);
const isScrollToBottomVisible = ref(false);
const currentSearchResultIndex = ref(0);
const selectedRoom = computed(() => chatRoomsData.value.find((r) => r.id === selectedRoomId.value));
const hasChatRooms = computed(() => chatRoomsData.value.length > 0);
const chatEmptyStateTitle = computed(() => (
  hasChatRooms.value
    ? '채팅방을 선택해주세요.'
    : '대화내역이 없습니다.'
));
const currentUserId = ref(null);
const isLoadingRooms = ref(false);
const chatLoadError = ref('');
const chatConnectionState = ref('disconnected');
const stompClient = ref(null);
const inboxSubscription = ref(null);
const activeRoomSubscription = ref(null);
const nowTick = ref(Date.now());
let timeTicker = null;
const route = useRoute();
const router = useRouter();
const pendingRequestedRoom = ref(null);
const isChatViewInitialized = ref(false);

const messagesByRoom = ref({});
const presenceByRoom = ref({});
const isRoomMenuOpen = ref(false);
const isReportingMessageId = ref(null);
const isReportModalOpen = ref(false);
const reportReason = ref('');
const reportErrorMessage = ref('');
const isSubmittingReport = ref(false);
const reportToastMessage = ref('');
const reportTargetMessageId = ref(null);
const roomMenuRef = ref(null);
const chatMessageAreaRef = ref(null);
const typingStopTimerByRoom = new Map();
const typingStateByRoom = new Map();
const presenceTimeoutByRoom = new Map();
let unregisterAuthCleanup = null;
let roomSelectionRequestSeq = 0;
let reportToastTimer = null;
const scrollToBottomThreshold = 96;
const hasRoomSearchTerm = computed(() => String(roomSearchTerm.value || '').trim().length > 0);
const hasMessageSearchTerm = computed(() => String(messageSearchTerm.value || '').trim().length > 0);
const requestedRoomKey = computed(() => String(route.query.roomKey || '').trim());
const { setUnreadFromRooms } = useChatUnreadCenter();

const filteredChatRooms = computed(() => {
  const keyword = String(roomSearchTerm.value || '').trim().toLowerCase();
  if (!keyword) return chatRoomsData.value;
  return chatRoomsData.value.filter((room) => {
    const haystack = `${room?.name || ''} ${room?.lastMsg || ''}`.toLowerCase();
    return haystack.includes(keyword);
  });
});

const selectedMessages = computed(() => {
  if (!selectedRoomId.value) return [];
  const selected = chatRoomsData.value.find((room) => room.id === selectedRoomId.value);
  if (!selected) return [];
  return messagesByRoom.value[selectedRoomId.value] || [];
});
const normalizedMessageSearchTerm = computed(() => String(messageSearchTerm.value || '').trim());
const matchedMessageIds = computed(() => {
  const keyword = normalizedMessageSearchTerm.value.toLowerCase();
  if (!keyword) return [];
  return selectedMessages.value
    .filter((message) => String(message?.text || '').toLowerCase().includes(keyword))
    .map((message) => String(message.id));
});
const messageSearchMatchCount = computed(() => matchedMessageIds.value.length);
const currentSearchResultMessageId = computed(() => {
  if (!messageSearchMatchCount.value) return null;
  const safeIndex = Math.min(currentSearchResultIndex.value, messageSearchMatchCount.value - 1);
  return matchedMessageIds.value[safeIndex] || null;
});
const messageSearchResultLabel = computed(() => {
  if (!normalizedMessageSearchTerm.value) return '0/0';
  if (!messageSearchMatchCount.value) return '0/0';
  return `${messageSearchMatchCount.value - currentSearchResultIndex.value}/${messageSearchMatchCount.value}`;
});
const canMoveToPreviousSearchResult = computed(() => currentSearchResultIndex.value > 0);
const canMoveToNextSearchResult = computed(() => (
  messageSearchMatchCount.value > 0 && currentSearchResultIndex.value < messageSearchMatchCount.value - 1
));

const unreadTotal = computed(() => chatRoomsData.value.reduce((sum, room) => sum + Number(room.unread || 0), 0));

const roomAvatarStyle = (room) => ({
  backgroundColor: room?.colorHex || '#1a1a1a',
});

const counterpartStatus = computed(() => {
  if (!selectedRoomId.value) return 'offline';
  return presenceByRoom.value[selectedRoomId.value] || 'offline';
});

const counterpartStatusLabel = computed(() => {
  if (counterpartStatus.value === 'typing') return '상대방 입력 중';
  if (counterpartStatus.value === 'online') return '상대방 접속 중';
  return '상대방 미접속';
});

const clearRoomSearch = () => {
  if (!hasRoomSearchTerm.value) return;
  roomSearchTerm.value = '';
};

const clearMessageSearch = () => {
  if (!isMessageSearchOpen.value && !hasMessageSearchTerm.value) return;
  messageSearchTerm.value = '';
  currentSearchResultIndex.value = 0;
  isMessageSearchOpen.value = false;
};

const toggleMessageSearch = async () => {
  isMessageSearchOpen.value = !isMessageSearchOpen.value;
  if (!isMessageSearchOpen.value) {
    messageSearchTerm.value = '';
    currentSearchResultIndex.value = 0;
    return;
  }
  await nextTick();
  messageSearchInputRef.value?.focus?.();
};

const toggleRoomMenu = () => {
  isRoomMenuOpen.value = !isRoomMenuOpen.value;
};

const applyChatRooms = (nextRooms) => {
  chatRoomsData.value = nextRooms;
  setUnreadFromRooms(nextRooms);
};

const clearRoomUnread = (roomId) => {
  const normalizedRoomId = String(roomId || '');
  if (!normalizedRoomId) return;

  applyChatRooms(chatRoomsData.value.map((room) => (
    String(room.id) === normalizedRoomId
      ? { ...room, unread: 0 }
      : room
  )));
};

const selectRoom = (roomId) => {
  clearRoomUnread(roomId);
  selectedRoomId.value = roomId;
};

const scrollMessagesToBottom = async () => {
  await nextTick();
  const container = chatMessageAreaRef.value;
  if (!container) return;
  container.scrollTop = container.scrollHeight;
  isScrollToBottomVisible.value = false;
};

const updateScrollToBottomVisibility = () => {
  const container = chatMessageAreaRef.value;
  if (!container) {
    isScrollToBottomVisible.value = false;
    return;
  }
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  isScrollToBottomVisible.value = distanceFromBottom > scrollToBottomThreshold;
};

const handleMessageAreaScroll = () => {
  updateScrollToBottomVisibility();
};

const messageElements = new Map();

const setMessageElement = (messageId, element) => {
  const key = String(messageId || '');
  if (!key) return;
  if (element) {
    messageElements.set(key, element);
    return;
  }
  messageElements.delete(key);
};

const scrollToCurrentSearchResult = async (behavior = 'smooth') => {
  await nextTick();
  const messageId = currentSearchResultMessageId.value;
  if (!messageId) return;
  const element = messageElements.get(String(messageId));
  if (!element) return;
  element.scrollIntoView({
    block: 'center',
    behavior,
  });
};

const moveToPreviousSearchResult = () => {
  if (!canMoveToPreviousSearchResult.value) return;
  currentSearchResultIndex.value -= 1;
  scrollToCurrentSearchResult();
};

const moveToNextSearchResult = () => {
  if (!canMoveToNextSearchResult.value) return;
  currentSearchResultIndex.value += 1;
  scrollToCurrentSearchResult();
};

const resizeMessageInput = async () => {
  await nextTick();
  const textarea = messageInputRef.value;
  if (!textarea) return;

  textarea.style.height = 'auto';

  const styles = window.getComputedStyle(textarea);
  const minHeight = Number.parseFloat(styles.minHeight) || textarea.scrollHeight;
  const maxHeight = Number.parseFloat(styles.maxHeight) || textarea.scrollHeight;
  const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
};

const handleDocumentPointerDown = (event) => {
  if (!isRoomMenuOpen.value) return;
  const root = roomMenuRef.value;
  if (!root) return;
  if (root.contains(event.target)) return;
  isRoomMenuOpen.value = false;
};

const toFriendlyApiError = (error, defaultMessage = '요청 처리에 실패했습니다.') => {
  const status = Number(error?.response?.status || 0);
  if (status === 401) return '로그인이 필요합니다.';
  if (status === 403) return '채팅 조회 권한이 없습니다.';
  if (status === 404) return '채팅 API 경로를 찾지 못했습니다. 프론트 API 주소를 확인해주세요.';
  if (status >= 500) return '서버 오류로 요청을 처리하지 못했습니다.';
  if (!error?.response) return '백엔드 연결에 실패했습니다. API 주소/CORS 설정을 확인해주세요.';
  return defaultMessage;
};

const toFriendlyChatReportError = (error) => {
  const status = Number(error?.response?.status || 0);
  if (status === 401) return '로그인이 필요합니다.';
  if (status === 403) return '신고 권한이 없습니다.';
  if (status === 404) return '신고 대상을 찾을 수 없습니다.';
  if (status >= 500) return '서버 오류로 신고에 실패했습니다.';
  if (!error?.response) return '백엔드 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
  return '신고 처리에 실패했습니다.';
};

const showReportToast = (message) => {
  if (reportToastTimer) {
    window.clearTimeout(reportToastTimer);
    reportToastTimer = null;
  }
  reportToastMessage.value = message;
  reportToastTimer = window.setTimeout(() => {
    reportToastMessage.value = '';
    reportToastTimer = null;
  }, 1800);
};

const sendMessage = () => {
  const text = messageInput.value.trim();
  if (!text || !selectedRoomId.value) return;

  const roomKey = String(selectedRoom.value?.roomKey || selectedRoomId.value);
  const optimistic = {
    id: `m-${Date.now()}`,
    text,
    isMine: true,
    pending: true,
    sentAt: new Date().toISOString(),
    isRead: false,
  };

  const canSendViaStomp = stompClient.value?.connected && chatConnectionState.value === 'connected';
  if (!canSendViaStomp) {
    const next = messagesByRoom.value[roomKey] ? [...messagesByRoom.value[roomKey]] : [...selectedMessages.value];
    next.push(optimistic);
    messagesByRoom.value[roomKey] = sortMessagesByTimeAsc(next);
    messageInput.value = '';
    resizeMessageInput();
    return;
  }

  try {
    stompClient.value.publish({
      destination: wsConfig.sendDestination,
      body: JSON.stringify({
        roomKey,
        message: text,
      }),
    });

    const next = messagesByRoom.value[roomKey] ? [...messagesByRoom.value[roomKey]] : [...selectedMessages.value];
    next.push(optimistic);
    messagesByRoom.value[roomKey] = sortMessagesByTimeAsc(next);
  } catch (error) {
    const next = messagesByRoom.value[roomKey] ? [...messagesByRoom.value[roomKey]] : [...selectedMessages.value];
    next.push(optimistic);
    messagesByRoom.value[roomKey] = sortMessagesByTimeAsc(next);
  }

  messageInput.value = '';
  resizeMessageInput();
  stopTypingForRoom(roomKey);
};

const formatRoomDate = (value) => {
  if (!value) return '방금 전';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return `${parsed.getMonth() + 1}월 ${parsed.getDate()}일`;
};

const toRoomLastMessageEpoch = (room) => {
  const epoch = toEpochMs(room?.lastMessageAt);
  if (epoch != null) return epoch;
  const fallback = toEpochMs(room?.updatedAt || room?.createdAt);
  if (fallback != null) return fallback;
  return 0;
};

const sortRoomsByLastMessageDesc = (rooms = []) => (
  [...rooms].sort((a, b) => toRoomLastMessageEpoch(b) - toRoomLastMessageEpoch(a))
);

const getRoomIdentifier = (room) => String(room?.roomKey || room?.id || '');

const mapRoom = (room, index) => {
  const roomKey = room.roomKey || room.id || room.roomId || `room-${index + 1}`;
  const otherProfile = room.otherProfile || {};
  const roomName = otherProfile.displayName || room.roomName || room.otherUserName || room.name || `채팅방 ${index + 1}`;
  const lastMsg = room.lastMessage || room.lastMsg || '대화를 시작해보세요.';
  const unread = Number(room.unreadCount ?? room.unread ?? 0);
  const lastMessageAt = room.lastMessageAt || room.lastMessageCreatedAt || room.updatedAt || room.createdAt || null;
  const avatarImageUrl = resolveUserAvatar(
    otherProfile.profileImageUrl || room.profileImageUrl || room.otherUserProfileImageUrl,
  );

  return {
    id: String(roomKey),
    roomKey: String(roomKey),
    otherUserId: room.otherUserId || otherProfile.userId || null,
    name: roomName,
    lastMsg,
    date: formatRoomDate(lastMessageAt),
    lastMessageAt,
    unread,
    avatarImageUrl,
    verified: false,
    colorHex: room.colorHex || '#1a1a1a',
  };
};

const mergeMappedRooms = (primaryRooms = [], fallbackRooms = []) => {
  const seenRoomKeys = new Set();
  const mergedRooms = [];

  [...primaryRooms, ...fallbackRooms].forEach((room) => {
    const roomKey = getRoomIdentifier(room);
    if (!roomKey || seenRoomKeys.has(roomKey)) return;
    seenRoomKeys.add(roomKey);
    mergedRooms.push(room);
  });

  return sortRoomsByLastMessageDesc(mergedRooms);
};

const hydratePendingRequestedRoom = (roomKey) => {
  if (!roomKey) {
    pendingRequestedRoom.value = null;
    return null;
  }

  if (String(pendingRequestedRoom.value?.roomKey || '') === String(roomKey)) {
    return pendingRequestedRoom.value;
  }

  pendingRequestedRoom.value = consumePendingChatRoom(roomKey);
  return pendingRequestedRoom.value;
};

const ensureRequestedRoomInList = (roomKey) => {
  const normalizedRoomKey = String(roomKey || '').trim();
  if (!normalizedRoomKey) return false;

  const hasKnownRoom = chatRoomsData.value.some((room) => getRoomIdentifier(room) === normalizedRoomKey);
  if (hasKnownRoom) return true;

  const pendingRoom = hydratePendingRequestedRoom(normalizedRoomKey);
  if (!pendingRoom) return false;

  applyChatRooms(mergeMappedRooms(
    chatRoomsData.value,
    [mapRoom(pendingRoom, chatRoomsData.value.length)],
  ));
  return true;
};

const selectRequestedRoomByKey = (roomKey) => {
  const normalizedRoomKey = String(roomKey || '').trim();
  if (!normalizedRoomKey) return false;

  ensureRequestedRoomInList(normalizedRoomKey);
  const room = chatRoomsData.value.find((entry) => getRoomIdentifier(entry) === normalizedRoomKey);
  if (!room) return false;

  if (String(selectedRoomId.value || '') !== String(room.id)) {
    selectRoom(room.id);
  }
  return true;
};

const formatMessageTime = (value) => {
  if (!value) return '방금 전';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  const hours = parsed.getHours();
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  return `${period} ${String(displayHours).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
};

const toEpochMs = (value) => {
  const parsed = new Date(value || '');
  const epoch = parsed.getTime();
  return Number.isNaN(epoch) ? null : epoch;
};

const formatMessageDisplayTime = (message) => {
  const sentAt = message?.sentAt || message?.createdAt || null;
  const epoch = toEpochMs(sentAt);
  if (epoch == null) return message?.time || '방금 전';

  const elapsed = nowTick.value - epoch;
  if (elapsed < 60 * 1000) return '방금 전';
  return formatMessageTime(sentAt);
};

const toMessageSortKey = (message) => {
  const sentAt = message?.sentAt || message?.createdAt || null;
  const epoch = toEpochMs(sentAt);
  if (epoch != null) return epoch;
  const idEpoch = Number(String(message?.id || '').replace(/\D/g, ''));
  return Number.isFinite(idEpoch) ? idEpoch : 0;
};

const sortMessagesByTimeAsc = (list = []) => (
  [...list].sort((a, b) => toMessageSortKey(a) - toMessageSortKey(b))
);

const isReadFlagTrue = (value) => value === true || value === 'Y' || value === 'READ';

const selectedLastReadMyMessageId = computed(() => {
  let target = null;
  selectedMessages.value.forEach((message) => {
    if (!message?.isMine) return;
    if (!message?.isRead) return;
    target = message.id;
  });
  return target;
});

const isLastReadMyMessage = (message) => String(message?.id || '') === String(selectedLastReadMyMessageId.value || '');
const isCurrentSearchResult = (message) => (
  String(message?.id || '') === String(currentSearchResultMessageId.value || '')
);

const buildHighlightedSegments = (text, keyword) => {
  const source = String(text || '');
  if (!keyword) {
    return [{ text: source, match: false }];
  }

  const segments = [];
  const normalizedKeyword = keyword.toLowerCase();
  const normalizedSource = source.toLowerCase();
  let cursor = 0;

  while (cursor < source.length) {
    const matchIndex = normalizedSource.indexOf(normalizedKeyword, cursor);
    if (matchIndex === -1) {
      segments.push({ text: source.slice(cursor), match: false });
      break;
    }

    if (matchIndex > cursor) {
      segments.push({ text: source.slice(cursor, matchIndex), match: false });
    }

    segments.push({
      text: source.slice(matchIndex, matchIndex + keyword.length),
      match: true,
    });
    cursor = matchIndex + keyword.length;
  }

  return segments.length > 0 ? segments : [{ text: source, match: false }];
};

const getHighlightedMessageSegments = (message) => {
  if (!normalizedMessageSearchTerm.value || !isCurrentSearchResult(message)) {
    return [{ text: String(message?.text || ''), match: false }];
  }
  return buildHighlightedSegments(message?.text, normalizedMessageSearchTerm.value);
};

const setRoomPresence = (roomKey, status, ttlMs = 12000) => {
  if (!roomKey) return;
  const key = String(roomKey);
  presenceByRoom.value = {
    ...presenceByRoom.value,
    [key]: status,
  };
  if (presenceTimeoutByRoom.has(key)) {
    window.clearTimeout(presenceTimeoutByRoom.get(key));
  }
  if (status === 'offline') {
    presenceTimeoutByRoom.delete(key);
    return;
  }
  const timeout = window.setTimeout(() => {
    presenceByRoom.value = {
      ...presenceByRoom.value,
      [key]: 'offline',
    };
    presenceTimeoutByRoom.delete(key);
  }, ttlMs);
  presenceTimeoutByRoom.set(key, timeout);
};

const normalizeIncomingMessage = (payload, fallbackRoomKey) => {
  const roomKey = String(payload?.roomKey || payload?.roomId || fallbackRoomKey || '');
  const senderId = payload?.senderId ?? payload?.userId ?? payload?.fromUserId ?? null;
  const text = payload?.message || payload?.content || payload?.contents || '';
  const createdAt = payload?.createdAt || payload?.sentAt || payload?.timestamp || new Date().toISOString();
  const parsed = new Date(createdAt);
  const time = Number.isNaN(parsed.getTime())
    ? '방금 전'
    : `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
  const isMine = currentUserId.value != null
    ? Number(senderId) === Number(currentUserId.value)
    : false;

  return {
    roomKey,
    type: String(payload?.type || 'MESSAGE'),
    message: {
      id: payload?.messageId ?? payload?.id ?? `ws-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      text: String(text || ''),
      isMine,
      time,
      sentAt: createdAt,
      isRead: isReadFlagTrue(payload?.isRead),
    },
  };
};

const upsertRoomMeta = (roomKey, messageText) => {
  const roomId = String(roomKey);
  const roomIndex = chatRoomsData.value.findIndex((room) => String(room.roomKey || room.id) === roomId);
  if (roomIndex < 0) return;

  const room = chatRoomsData.value[roomIndex];
  const isCurrentRoom = String(selectedRoomId.value) === String(room.id);
  const unread = Number(room.unread || 0) + (isCurrentRoom ? 0 : 1);

  const updated = {
    ...room,
    lastMsg: messageText || room.lastMsg,
    date: '방금 전',
    lastMessageAt: new Date().toISOString(),
    unread,
  };

  const nextRooms = [...chatRoomsData.value];
  nextRooms.splice(roomIndex, 1);
  nextRooms.push(updated);
  applyChatRooms(sortRoomsByLastMessageDesc(nextRooms));
};

const handleInboxFrame = async (rawBody) => {
  let payload = null;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch (error) {
    payload = { message: String(rawBody || '') };
  }

  const { roomKey, type, message } = normalizeIncomingMessage(payload, null);
  if (!roomKey) return;
  if (type === 'TYPING_START' || type === 'TYPING_STOP') return;
  if (!message.text) return;

  const hasKnownRoom = chatRoomsData.value.some((room) => String(room.roomKey || room.id) === String(roomKey));
  if (!hasKnownRoom) {
    await loadRooms();
    return;
  }

  upsertRoomMeta(roomKey, message.text);
};

const handleStompFrame = (rawBody, fallbackRoomKey) => {
  let payload = null;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch (error) {
    payload = { message: String(rawBody || '') };
  }

  const { roomKey, type, message } = normalizeIncomingMessage(payload, fallbackRoomKey);
  if (!roomKey) return;

  if (type === 'TYPING_START' && !message.isMine) {
    setRoomPresence(roomKey, 'typing');
    return;
  }

  if (type === 'TYPING_STOP' && !message.isMine) {
    setRoomPresence(roomKey, 'online');
    return;
  }

  if (!message.text) return;

  const current = messagesByRoom.value[roomKey] ? [...messagesByRoom.value[roomKey]] : [];

  if (message.isMine) {
    const pendingIndex = current.findIndex((item) => item?.pending && item?.isMine && String(item?.text || '') === message.text);
    if (pendingIndex >= 0) {
      current[pendingIndex] = {
        ...message,
        pending: false,
      };
      messagesByRoom.value[roomKey] = sortMessagesByTimeAsc(current);
      upsertRoomMeta(roomKey, message.text);
      if (message.isRead) {
        setRoomPresence(roomKey, 'online');
      }
      return;
    }
  }

  const exists = current.some((item) => String(item.id) === String(message.id));
  if (!exists) {
    current.push(message);
    messagesByRoom.value[roomKey] = sortMessagesByTimeAsc(current);
  }

  if (!message.isMine) {
    setRoomPresence(roomKey, 'online');
  } else if (message.isRead) {
    setRoomPresence(roomKey, 'online');
  }
  upsertRoomMeta(roomKey, message.text);
};

const publishTyping = (roomKey, typing) => {
  if (!roomKey) return;
  if (!stompClient.value?.connected || chatConnectionState.value !== 'connected') return;
  try {
    stompClient.value.publish({
      destination: wsConfig.typingDestination,
      body: JSON.stringify({
        roomKey,
        typing: Boolean(typing),
      }),
    });
  } catch (error) {
    // ignore
  }
};

const handleInputTyping = () => {
  if (!selectedRoomId.value) return;
  const roomKey = String(selectedRoom.value?.roomKey || selectedRoomId.value);
  const hasText = String(messageInput.value || '').trim().length > 0;

  if (hasText && !typingStateByRoom.get(roomKey)) {
    typingStateByRoom.set(roomKey, true);
    publishTyping(roomKey, true);
  }

  if (!hasText && typingStateByRoom.get(roomKey)) {
    typingStateByRoom.set(roomKey, false);
    publishTyping(roomKey, false);
  }

  if (typingStopTimerByRoom.has(roomKey)) {
    window.clearTimeout(typingStopTimerByRoom.get(roomKey));
  }

  if (hasText) {
    const timer = window.setTimeout(() => {
      if (typingStateByRoom.get(roomKey)) {
        typingStateByRoom.set(roomKey, false);
        publishTyping(roomKey, false);
      }
      typingStopTimerByRoom.delete(roomKey);
    }, 1200);
    typingStopTimerByRoom.set(roomKey, timer);
  }
};

const handleMessageInput = () => {
  resizeMessageInput();
  handleInputTyping();
};

const stopTypingForRoom = (roomKey) => {
  if (!roomKey) return;
  const key = String(roomKey);
  if (typingStopTimerByRoom.has(key)) {
    window.clearTimeout(typingStopTimerByRoom.get(key));
    typingStopTimerByRoom.delete(key);
  }
  if (typingStateByRoom.get(key)) {
    typingStateByRoom.set(key, false);
    publishTyping(key, false);
  }
};

const goToCounterpartProfile = () => {
  const userId = Number(selectedRoom.value?.otherUserId || 0);
  if (!Number.isFinite(userId) || userId <= 0) return;
  router.push({ path: '/profile', query: { userId: String(userId) } });
};

const leaveSelectedRoom = async () => {
  const room = selectedRoom.value;
  if (!room) return;
  const ok = window.confirm('채팅방을 나가시겠습니까?');
  if (!ok) return;

  try {
    await chatApi.leave(room.roomKey || room.id);
    isRoomMenuOpen.value = false;
    applyChatRooms(chatRoomsData.value.filter((item) => String(item.id) !== String(room.id)));
    const nextMessagesByRoom = { ...messagesByRoom.value };
    delete nextMessagesByRoom[room.roomKey || room.id];
    messagesByRoom.value = nextMessagesByRoom;
    selectedRoomId.value = null;
  } catch (error) {
    window.alert(toFriendlyApiError(error, '채팅방 나가기에 실패했습니다.'));
  }
};

const reportChatMessage = async (message) => {
  if (!selectedRoom.value) return;
  if (message?.isMine) return;
  if (!message?.id || String(message.id).startsWith('m-') || String(message.id).startsWith('ws-')) return;
  if (isReportingMessageId.value || isSubmittingReport.value) return;
  reportTargetMessageId.value = String(message.id);
  reportReason.value = '';
  reportErrorMessage.value = '';
  isReportModalOpen.value = true;
};

const closeReportModal = () => {
  if (isSubmittingReport.value) return;
  isReportModalOpen.value = false;
  reportReason.value = '';
  reportErrorMessage.value = '';
  reportTargetMessageId.value = null;
};

const submitReport = async () => {
  if (!selectedRoom.value) return;
  const targetMessageId = String(reportTargetMessageId.value || '').trim();
  if (!targetMessageId) return;

  const reason = String(reportReason.value || '').trim();
  if (reason.length < 5 || reason.length > 500) {
    reportErrorMessage.value = '신고 사유는 5자 이상 500자 이하로 입력해주세요.';
    return;
  }

  reportErrorMessage.value = '';
  isSubmittingReport.value = true;
  isReportingMessageId.value = targetMessageId;

  try {
    await chatApi.reportMessage(selectedRoom.value.roomKey || selectedRoom.value.id, targetMessageId, { reason });
    isReportModalOpen.value = false;
    reportReason.value = '';
    reportErrorMessage.value = '';
    reportTargetMessageId.value = null;
    showReportToast('신고가 접수되었습니다.');
  } catch (error) {
    reportErrorMessage.value = toFriendlyChatReportError(error);
  } finally {
    isSubmittingReport.value = false;
    isReportingMessageId.value = null;
  }
};

const clearInboxSubscription = () => {
  if (!inboxSubscription.value) return;
  try {
    inboxSubscription.value.unsubscribe();
  } catch (error) {
    // ignore
  }
  inboxSubscription.value = null;
};

const clearActiveRoomSubscription = () => {
  if (!activeRoomSubscription.value) return;
  try {
    activeRoomSubscription.value.unsubscribe();
  } catch (error) {
    // ignore
  }
  activeRoomSubscription.value = null;
};

const resolveRoomKey = (roomId) => {
  const room = chatRoomsData.value.find((entry) => String(entry.id) === String(roomId));
  return String(room?.roomKey || roomId || '');
};

const subscribeInbox = () => {
  if (!stompClient.value?.connected || inboxSubscription.value) return;
  inboxSubscription.value = stompClient.value.subscribe(wsConfig.inboxTopic(), (frame) => {
    handleInboxFrame(frame.body);
  });
};

const subscribeActiveRoom = (roomId) => {
  if (!roomId || !stompClient.value?.connected) return;

  clearActiveRoomSubscription();
  const roomKey = resolveRoomKey(roomId);
  if (!roomKey) return;

  activeRoomSubscription.value = stompClient.value.subscribe(wsConfig.roomTopic(roomKey), (frame) => {
    handleStompFrame(frame.body, roomKey);
  });
};

const connectStomp = () => {
  if (stompClient.value?.active || stompClient.value?.connected) return;

  const token = getAccessToken();
  const client = new Client({
    brokerURL: `${wsConfig.wsBaseUrl}${wsConfig.connectEndpoint}`,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      chatConnectionState.value = 'connected';
      subscribeInbox();
      if (selectedRoomId.value) {
        subscribeActiveRoom(selectedRoomId.value);
      }
    },
    onStompError: () => {
      chatConnectionState.value = 'error';
    },
    onWebSocketClose: () => {
      chatConnectionState.value = 'disconnected';
      clearInboxSubscription();
      clearActiveRoomSubscription();
    },
    onWebSocketError: () => {
      chatConnectionState.value = 'error';
    },
  });

  chatConnectionState.value = 'connecting';
  client.activate();
  stompClient.value = client;
};

const disconnectStomp = () => {
  clearInboxSubscription();
  clearActiveRoomSubscription();
  if (stompClient.value) {
    stompClient.value.deactivate();
    stompClient.value = null;
  }
  chatConnectionState.value = 'disconnected';
};

const loadRooms = async () => {
  isLoadingRooms.value = true;
  chatLoadError.value = '';
  try {
    const pendingRoomKey = requestedRoomKey.value;
    const pendingRoom = hydratePendingRequestedRoom(pendingRoomKey);
    const [profileResponse, roomsResponse] = await Promise.all([
      userApi.myInfo(),
      chatApi.rooms(),
    ]);

    const profile = extractPayload(profileResponse) || {};
    currentUserId.value = profile.id ?? profile.userId ?? null;

    const roomsPayload = extractPayload(roomsResponse);
    const roomList = extractList(roomsPayload);
    const mappedRooms = roomList.map(mapRoom);
    const fallbackRooms = pendingRoomKey && pendingRoom
      ? [mapRoom(pendingRoom, mappedRooms.length)]
      : [];
    applyChatRooms(mergeMappedRooms(mappedRooms, fallbackRooms));
  } catch (error) {
    chatLoadError.value = toFriendlyApiError(error, '채팅방 목록을 불러오지 못했습니다.');
  } finally {
    isLoadingRooms.value = false;
  }
};

const loadMessages = async (roomId, { requestSeq = null } = {}) => {
  if (!roomId) return false;
  const normalizedRoomId = String(roomId);
  try {
    const response = await chatApi.messages(normalizedRoomId, { page: 0, size: 50 });
    if (requestSeq != null && requestSeq !== roomSelectionRequestSeq) {
      return false;
    }
    const payload = extractPayload(response);
    const list = extractList(payload);
    const safeList = Array.isArray(list) ? list : [];
    const mapped = safeList.map((message, index) => {
      const senderId = message.senderId ?? message.userId ?? message.fromUserId ?? null;
      const isMine = currentUserId.value != null
        ? Number(senderId) === Number(currentUserId.value)
        : Boolean(message.isMine);
      return {
        id: message.messageId ?? message.id ?? `msg-${normalizedRoomId}-${index}`,
        text: message.message || message.content || message.contents || '',
        isMine,
        time: formatMessageTime(message.createdAt || message.sentAt || message.timestamp),
        sentAt: message.createdAt || message.sentAt || message.timestamp || null,
        isRead: isReadFlagTrue(message.isRead),
      };
    });
    messagesByRoom.value[normalizedRoomId] = sortMessagesByTimeAsc(mapped);

    try {
      await chatApi.markRead(normalizedRoomId);
    } catch (error) {
      // ignore read fail
    }
    return true;
  } catch (error) {
    if (requestSeq == null || requestSeq === roomSelectionRequestSeq) {
      chatLoadError.value = toFriendlyApiError(error, '메시지 목록을 불러오지 못했습니다.');
    }
    // keep existing messages when fetch fails
    return false;
  }
};

watch(selectedRoomId, async (next, prev) => {
  isRoomMenuOpen.value = false;
  closeReportModal();
  currentSearchResultIndex.value = 0;
  if (prev) {
    const prevRoom = chatRoomsData.value.find((room) => String(room.id) === String(prev));
    stopTypingForRoom(prevRoom?.roomKey || prev);
  }
  if (!next) {
    roomSelectionRequestSeq += 1;
    clearActiveRoomSubscription();
    isScrollToBottomVisible.value = false;
    await resizeMessageInput();
    return;
  }
  const requestSeq = ++roomSelectionRequestSeq;
  chatLoadError.value = '';
  clearRoomUnread(next);
  await loadMessages(next, { requestSeq });
  if (requestSeq !== roomSelectionRequestSeq || String(selectedRoomId.value) !== String(next)) return;
  if (chatConnectionState.value === 'connected') {
    subscribeActiveRoom(next);
  }
  await resizeMessageInput();
  await scrollMessagesToBottom();
});

watch(
  () => selectedMessages.value.map((message) => `${message.id}-${message.sentAt || ''}-${message.text || ''}`).join('|'),
  () => {
    scrollMessagesToBottom();
  }
);

watch(
  () => normalizedMessageSearchTerm.value,
  async (nextKeyword, prevKeyword) => {
    if (!nextKeyword) {
      currentSearchResultIndex.value = 0;
      return;
    }
    if (nextKeyword !== prevKeyword) {
      currentSearchResultIndex.value = Math.max(matchedMessageIds.value.length - 1, 0);
    }
    await scrollToCurrentSearchResult(nextKeyword !== prevKeyword ? 'auto' : 'smooth');
  },
);

watch(
  () => matchedMessageIds.value.join('|'),
  async () => {
    if (!matchedMessageIds.value.length) {
      currentSearchResultIndex.value = 0;
      return;
    }
    if (currentSearchResultIndex.value >= matchedMessageIds.value.length) {
      currentSearchResultIndex.value = matchedMessageIds.value.length - 1;
    }
    await scrollToCurrentSearchResult('auto');
  },
);

onMounted(() => {
  unregisterAuthCleanup = registerAuthCleanup(() => {
    disconnectStomp();
  });
  timeTicker = window.setInterval(() => {
    nowTick.value = Date.now();
  }, 15000);
  window.addEventListener('pointerdown', handleDocumentPointerDown);
  hydratePendingRequestedRoom(requestedRoomKey.value);
  ensureRequestedRoomInList(requestedRoomKey.value);
  void (async () => {
    await loadRooms();
    selectRequestedRoomByKey(requestedRoomKey.value);
    connectStomp();
    await resizeMessageInput();
    updateScrollToBottomVisibility();
    isChatViewInitialized.value = true;
  })();
});

onBeforeUnmount(() => {
  if (typeof unregisterAuthCleanup === 'function') {
    unregisterAuthCleanup();
    unregisterAuthCleanup = null;
  }
  if (timeTicker) {
    window.clearInterval(timeTicker);
    timeTicker = null;
  }
  typingStopTimerByRoom.forEach((timer) => window.clearTimeout(timer));
  presenceTimeoutByRoom.forEach((timer) => window.clearTimeout(timer));
  if (reportToastTimer) {
    window.clearTimeout(reportToastTimer);
    reportToastTimer = null;
  }
  typingStopTimerByRoom.clear();
  presenceTimeoutByRoom.clear();
  window.removeEventListener('pointerdown', handleDocumentPointerDown);
  disconnectStomp();
});

watch(
  () => requestedRoomKey.value,
  async (nextRoomKey, prevRoomKey) => {
    if (!isChatViewInitialized.value) return;
    if (!nextRoomKey || nextRoomKey === prevRoomKey) return;

    hydratePendingRequestedRoom(nextRoomKey);
    const selected = selectRequestedRoomByKey(nextRoomKey);
    if (selected) return;

    await loadRooms();
    selectRequestedRoomByKey(nextRoomKey);
  },
);
</script>
