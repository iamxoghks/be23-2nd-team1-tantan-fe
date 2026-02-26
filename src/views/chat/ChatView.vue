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
              <div class="v-chat-room-avatar" :style="roomAvatarStyle(room)">{{ room.avatar }}</div>
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
                <div class="v-chat-room-avatar-sm" :style="roomAvatarStyle(selectedRoom)">{{ selectedRoom.avatar }}</div>
                <div class="v-chat-room-meta"><span class="v-chat-room-name">{{ selectedRoom.name }}</span><span class="v-chat-room-status">상담원 연결 중</span></div>
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
                <MoreHorizontal :size="20" class="v-chat-action-icon" />
              </div>
            </div>

            <div class="chat-message-area">
              <div class="chat-date-row"><span class="chat-date-chip">2026년 1월 28일 수요일</span></div>
              <div
                v-for="message in filteredSelectedMessages"
                :key="message.id"
                :class="message.isMine ? 'chat-msg-row-mine' : 'chat-msg-row-other'"
                class="chat-msg-row"
              >
                <template v-if="!message.isMine">
                  <div class="chat-msg-avatar">
                    {{ selectedRoom?.avatar }}
                  </div>
                  <div class="chat-msg-col">
                    <span class="chat-msg-sender">{{ selectedRoom?.name }}</span>
                    <div class="chat-msg-bubble-row chat-msg-bubble-row-other">
                      <div class="chat-bubble chat-bubble-other">{{ message.text }}</div>
                      <span class="chat-msg-time">{{ message.time || '방금 전' }}</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="chat-msg-col chat-msg-col-mine">
                    <div class="chat-msg-bubble-row chat-msg-bubble-row-mine">
                      <span class="chat-msg-time">{{ message.time || '방금 전' }}</span>
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
import { Search, MessageSquare, MoreHorizontal, Send, Smile, Paperclip, ChevronLeft, X } from 'lucide-vue-next';
import { chatApi, userApi } from '@/services/apis';
import { extractList, extractPayload } from '@/utils/api';
import { getAccessToken } from '@/services/token';
import { wsConfig } from '@/services/ws';

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

const messagesByRoom = ref({});
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
    time: '방금 전',
  };

  const canSendViaStomp = stompClient.value?.connected && chatConnectionState.value === 'connected';
  if (!canSendViaStomp) {
    const next = messagesByRoom.value[roomKey] ? [...messagesByRoom.value[roomKey]] : [...selectedMessages.value];
    next.push(optimistic);
    messagesByRoom.value[roomKey] = next;
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
    messagesByRoom.value[roomKey] = next;
  } catch (error) {
    const next = messagesByRoom.value[roomKey] ? [...messagesByRoom.value[roomKey]] : [...selectedMessages.value];
    next.push(optimistic);
    messagesByRoom.value[roomKey] = next;
  }

  messageInput.value = '';
};

const formatRoomDate = (value) => {
  if (!value) return '방금 전';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return `${parsed.getMonth() + 1}월 ${parsed.getDate()}일`;
};

const mapRoom = (room, index) => {
  const roomKey = room.roomKey || room.id || room.roomId || `room-${index + 1}`;
  const roomName = room.roomName || room.otherUserName || room.name || `채팅방 ${index + 1}`;
  const lastMsg = room.lastMessage || room.lastMsg || '대화를 시작해보세요.';
  const unread = Number(room.unreadCount ?? room.unread ?? 0);
  const avatar = String(roomName).slice(0, 2).toUpperCase();

  return {
    id: String(roomKey),
    roomKey: String(roomKey),
    name: roomName,
    lastMsg,
    date: formatRoomDate(room.lastMessageCreatedAt || room.updatedAt || room.createdAt),
    unread,
    avatar,
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
    message: {
      id: payload?.messageId ?? payload?.id ?? `ws-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      text: String(text || ''),
      isMine,
      time,
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
    date: '방금',
    unread,
  };

  const nextRooms = [...chatRoomsData.value];
  nextRooms.splice(roomIndex, 1);
  nextRooms.unshift(updated);
  chatRoomsData.value = nextRooms;
};

const handleStompFrame = (rawBody, fallbackRoomKey) => {
  let payload = null;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch (error) {
    payload = { message: String(rawBody || '') };
  }

  const { roomKey, message } = normalizeIncomingMessage(payload, fallbackRoomKey);
  if (!roomKey || !message.text) return;

  const current = messagesByRoom.value[roomKey] ? [...messagesByRoom.value[roomKey]] : [];
  const exists = current.some((item) => String(item.id) === String(message.id));
  if (!exists) {
    current.push(message);
    messagesByRoom.value[roomKey] = current;
  }

  upsertRoomMeta(roomKey, message.text);
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

const subscribeRoom = (roomId) => {
  if (!roomId || !stompClient.value?.connected) return;

  clearRoomSubscriptions();
  const roomKey = String(selectedRoom.value?.roomKey || roomId);
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
      chatRoomsData.value = roomList.map(mapRoom);
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

const loadMessages = async (roomId) => {
  if (!roomId) return;
  try {
    const response = await chatApi.messages(roomId, { page: 0, size: 50 });
    const payload = extractPayload(response);
    const list = extractList(payload);
    if (!Array.isArray(list) || list.length === 0) return;

    messagesByRoom.value[roomId] = list.map((message, index) => {
      const senderId = message.senderId ?? message.userId ?? message.fromUserId ?? null;
      const isMine = currentUserId.value != null
        ? Number(senderId) === Number(currentUserId.value)
        : Boolean(message.isMine);
      return {
        id: message.messageId ?? message.id ?? `msg-${roomId}-${index}`,
        text: message.message || message.content || message.contents || '',
        isMine,
        time: formatMessageTime(message.createdAt || message.sentAt || message.timestamp),
      };
    });

    try {
      await chatApi.markRead(roomId);
    } catch (error) {
      // ignore read fail
    }
  } catch (error) {
    chatLoadError.value = toFriendlyApiError(error, '메시지 목록을 불러오지 못했습니다.');
    // keep existing messages when fetch fails
  }
};

watch(selectedRoomId, (next) => {
  if (!next) return;
  loadMessages(next);
  if (chatConnectionState.value === 'connected') {
    subscribeRoom(next);
  }
});

onMounted(() => {
  loadRooms();
  connectStomp();
});

onBeforeUnmount(() => {
  disconnectStomp();
});
</script>
