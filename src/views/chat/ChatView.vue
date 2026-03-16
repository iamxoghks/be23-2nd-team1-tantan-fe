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
              @click="selectedRoomId = room.id"
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
                  />
                  <button
                    v-if="hasMessageSearchTerm"
                    type="button"
                    class="chat-main-search-clear-btn"
                    aria-label="대화 내용 검색어 지우기"
                    @pointerdown.prevent.stop="clearMessageSearch"
                    @click.prevent.stop="clearMessageSearch"
                  >
                    <X :size="12" />
                  </button>
                </div>
                <button type="button" class="v-chat-header-icon-btn" @click="toggleMessageSearch">
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

            <div ref="chatMessageAreaRef" class="chat-message-area">
              <div class="chat-date-row"><span class="chat-date-chip">2026년 1월 28일 수요일</span></div>
              <div
                v-for="message in filteredSelectedMessages"
                :key="message.id"
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
                      <div class="chat-bubble chat-bubble-other">{{ message.text }}</div>
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
                      <div class="chat-bubble chat-bubble-mine">{{ message.text }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <div class="chat-input-section">
              <div class="chat-input-tools"><Smile :size="20" class="v-chat-action-icon" /><Paperclip :size="20" class="v-chat-action-icon" /></div>
              <div class="chat-input-shell">
                <textarea
                  v-model="messageInput"
                  placeholder="메시지를 입력하세요..."
                  class="v-chat-input-box"
                  @input="handleInputTyping"
                  @blur="stopTypingForRoom(selectedRoom?.roomKey || selectedRoomId)"
                  @keydown.enter.exact.prevent="sendMessage"
                />
                <button class="v-chat-send-btn" @click="sendMessage"><Send :size="16" /></button>
              </div>
            </div>
          </div>

          <div v-else class="chat-empty-panel">
            <div class="v-chat-empty-state"><div class="v-chat-empty-icon"><MessageSquare :size="40" class="v-text-white" /></div><p class="v-chat-empty-title">대화내역이 없습니다.</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Client } from '@stomp/stompjs';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { Search, MessageSquare, MoreHorizontal, Send, Smile, Paperclip, ChevronLeft, X, Flag } from 'lucide-vue-next';
import { chatApi, userApi } from '@/services/apis';
import { extractList, extractPayload } from '@/utils/api';
import { getAccessToken } from '@/services/token';
import { registerAuthCleanup } from '@/services/authLifecycle';
import { wsConfig } from '@/services/ws';
import { resolveUserAvatar, handleUserAvatarError } from '@/utils/userAvatar';
import { useRouter } from 'vue-router';

const chatRoomsData = ref([]);
const selectedRoomId = ref(null);
const messageInput = ref('');
const roomSearchTerm = ref('');
const messageSearchTerm = ref('');
const isMessageSearchOpen = ref(false);
const messageSearchInputRef = ref(null);
const selectedRoom = computed(() => chatRoomsData.value.find((r) => r.id === selectedRoomId.value));
const currentUserId = ref(null);
const isLoadingRooms = ref(false);
const chatLoadError = ref('');
const chatConnectionState = ref('disconnected');
const stompClient = ref(null);
const roomSubscriptions = ref([]);
const nowTick = ref(Date.now());
let timeTicker = null;
const router = useRouter();

const messagesByRoom = ref({});
const presenceByRoom = ref({});
const isRoomMenuOpen = ref(false);
const isReportingMessageId = ref(null);
const roomMenuRef = ref(null);
const chatMessageAreaRef = ref(null);
const typingStopTimerByRoom = new Map();
const typingStateByRoom = new Map();
const presenceTimeoutByRoom = new Map();
let unregisterAuthCleanup = null;
let roomSelectionRequestSeq = 0;
const hasRoomSearchTerm = computed(() => String(roomSearchTerm.value || '').trim().length > 0);
const hasMessageSearchTerm = computed(() => String(messageSearchTerm.value || '').trim().length > 0);

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
const filteredSelectedMessages = computed(() => {
  const keyword = String(messageSearchTerm.value || '').trim().toLowerCase();
  if (!keyword) return selectedMessages.value;
  return selectedMessages.value.filter((message) => String(message?.text || '').toLowerCase().includes(keyword));
});

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
  if (!hasMessageSearchTerm.value) return;
  messageSearchTerm.value = '';
};

const toggleMessageSearch = async () => {
  isMessageSearchOpen.value = !isMessageSearchOpen.value;
  if (!isMessageSearchOpen.value) {
    messageSearchTerm.value = '';
    return;
  }
  await nextTick();
  messageSearchInputRef.value?.focus?.();
};

const toggleRoomMenu = () => {
  isRoomMenuOpen.value = !isRoomMenuOpen.value;
};

const scrollMessagesToBottom = async () => {
  await nextTick();
  const container = chatMessageAreaRef.value;
  if (!container) return;
  container.scrollTop = container.scrollHeight;
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
  chatRoomsData.value = sortRoomsByLastMessageDesc(nextRooms);
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
    chatRoomsData.value = chatRoomsData.value.filter((item) => String(item.id) !== String(room.id));
    const nextMessagesByRoom = { ...messagesByRoom.value };
    delete nextMessagesByRoom[room.roomKey || room.id];
    messagesByRoom.value = nextMessagesByRoom;
    selectedRoomId.value = chatRoomsData.value[0]?.id || null;
  } catch (error) {
    window.alert(toFriendlyApiError(error, '채팅방 나가기에 실패했습니다.'));
  }
};

const reportChatMessage = async (message) => {
  if (!selectedRoom.value) return;
  if (message?.isMine) return;
  if (!message?.id || String(message.id).startsWith('m-') || String(message.id).startsWith('ws-')) return;
  if (isReportingMessageId.value) return;

  const reasonInput = window.prompt('신고 사유를 입력해주세요. (5~500자)');
  const reason = String(reasonInput || '').trim();
  if (!reason) return;
  if (reason.length < 5 || reason.length > 500) {
    window.alert('신고 사유는 5자 이상 500자 이하로 입력해주세요.');
    return;
  }

  isReportingMessageId.value = String(message.id);
  try {
    await chatApi.reportMessage(selectedRoom.value.roomKey || selectedRoom.value.id, message.id, { reason });
    window.alert('신고가 접수되었습니다.');
  } catch (error) {
    window.alert(toFriendlyApiError(error, '신고 처리에 실패했습니다.'));
  } finally {
    isReportingMessageId.value = null;
  }
};

const clearRoomSubscriptions = () => {
  roomSubscriptions.value.forEach((sub) => {
    try {
      sub.unsubscribe();
    } catch (error) {
      // ignore
    }
  });
  roomSubscriptions.value = [];
};

const resolveRoomKey = (roomId) => {
  const room = chatRoomsData.value.find((entry) => String(entry.id) === String(roomId));
  return String(room?.roomKey || roomId || '');
};

const subscribeRoom = (roomId) => {
  if (!roomId || !stompClient.value?.connected) return;

  clearRoomSubscriptions();
  const roomKey = resolveRoomKey(roomId);
  if (!roomKey) return;
  const topicCandidates = [wsConfig.roomTopic(roomKey)];

  const subscriptions = topicCandidates.map((destination) => (
    stompClient.value.subscribe(destination, (frame) => {
      handleStompFrame(frame.body, roomKey);
    })
  ));
  roomSubscriptions.value = subscriptions;
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
      if (selectedRoomId.value) {
        subscribeRoom(selectedRoomId.value);
      }
    },
    onStompError: () => {
      chatConnectionState.value = 'error';
    },
    onWebSocketClose: () => {
      chatConnectionState.value = 'disconnected';
      clearRoomSubscriptions();
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
  clearRoomSubscriptions();
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
    const [profileResponse, roomsResponse] = await Promise.all([
      userApi.myInfo(),
      chatApi.rooms(),
    ]);

    const profile = extractPayload(profileResponse) || {};
    currentUserId.value = profile.id ?? profile.userId ?? null;

    const roomsPayload = extractPayload(roomsResponse);
    const roomList = extractList(roomsPayload);
    if (roomList.length > 0) {
      chatRoomsData.value = sortRoomsByLastMessageDesc(roomList.map(mapRoom));
    } else {
      chatRoomsData.value = [];
    }

    if (!selectedRoomId.value && chatRoomsData.value.length > 0) {
      selectedRoomId.value = chatRoomsData.value[0].id;
    }
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
  if (prev) {
    const prevRoom = chatRoomsData.value.find((room) => String(room.id) === String(prev));
    stopTypingForRoom(prevRoom?.roomKey || prev);
  }
  if (!next) {
    roomSelectionRequestSeq += 1;
    clearRoomSubscriptions();
    return;
  }
  const requestSeq = ++roomSelectionRequestSeq;
  chatLoadError.value = '';
  await loadMessages(next, { requestSeq });
  if (requestSeq !== roomSelectionRequestSeq || String(selectedRoomId.value) !== String(next)) return;
  if (chatConnectionState.value === 'connected') {
    subscribeRoom(next);
  }
  await scrollMessagesToBottom();
});

watch(
  () => selectedMessages.value.map((message) => `${message.id}-${message.sentAt || ''}-${message.text || ''}`).join('|'),
  () => {
    scrollMessagesToBottom();
  }
);

onMounted(() => {
  unregisterAuthCleanup = registerAuthCleanup(() => {
    disconnectStomp();
  });
  timeTicker = window.setInterval(() => {
    nowTick.value = Date.now();
  }, 15000);
  window.addEventListener('pointerdown', handleDocumentPointerDown);
  loadRooms();
  connectStomp();
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
  typingStopTimerByRoom.clear();
  presenceTimeoutByRoom.clear();
  window.removeEventListener('pointerdown', handleDocumentPointerDown);
  disconnectStomp();
});
</script>
