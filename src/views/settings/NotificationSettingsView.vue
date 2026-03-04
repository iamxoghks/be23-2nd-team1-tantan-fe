<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card settings-page">
          <div class="sx-views-community-communityview-016">
            <RouterLink to="/profile" class="v-history-back-btn">
              <ArrowLeft class="v-icon-18-md20" />
            </RouterLink>
          </div>

          <div class="settings-head">
            <h1>알림 설정</h1>
            <p>알림 수신 항목과 방해금지 시간을 관리합니다.</p>
          </div>

          <div class="settings-group">
            <label v-for="item in toggleItems" :key="item.key" class="settings-toggle-row">
              <div>
                <p class="settings-label">{{ item.label }}</p>
                <p class="settings-help">{{ item.help }}</p>
              </div>
              <input v-model="form[item.key]" type="checkbox" class="settings-toggle-input" />
            </label>
          </div>

          <div class="settings-group">
            <label class="settings-inline-field">
              <span>방해금지 시작</span>
              <input v-model="form.quietHoursStart" type="time" :disabled="!form.quietHoursEnabled" />
            </label>
            <label class="settings-inline-field">
              <span>방해금지 종료</span>
              <input v-model="form.quietHoursEnd" type="time" :disabled="!form.quietHoursEnabled" />
            </label>
          </div>

          <p v-if="message" class="settings-message">{{ message }}</p>
          <p v-if="errorMessage" class="settings-error">{{ errorMessage }}</p>

          <button class="v-modal-save-btn settings-save-btn" :disabled="isSaving" @click="saveSettings">
            {{ isSaving ? '저장 중...' : '저장하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { notificationSettingsApi } from '@/services/apis';

const STORAGE_KEY = 'notificationSettingsFallback';

const defaultForm = () => ({
  comment: true,
  like: true,
  follow: true,
  gymNotice: true,
  marketing: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
});

const form = ref(defaultForm());
const isSaving = ref(false);
const message = ref('');
const errorMessage = ref('');

const toggleItems = [
  { key: 'comment', label: '댓글 알림', help: '게시글/리뷰 댓글 알림을 받습니다.' },
  { key: 'like', label: '좋아요 알림', help: '내 콘텐츠 좋아요 알림을 받습니다.' },
  { key: 'follow', label: '팔로우 알림', help: '새 팔로워 알림을 받습니다.' },
  { key: 'gymNotice', label: '짐 공지 알림', help: '운영시간/이벤트 공지를 받습니다.' },
  { key: 'marketing', label: '마케팅 알림', help: '프로모션/혜택 정보를 받습니다.' },
  { key: 'quietHoursEnabled', label: '야간 알림 제한', help: '방해금지 시간 동안 푸시를 제한합니다.' },
];

const getBrowserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul';

const mergeForm = (payload = {}) => ({
  ...defaultForm(),
  comment: payload.comment ?? payload.commentEnabled ?? true,
  like: payload.like ?? payload.likeEnabled ?? true,
  follow: payload.follow ?? payload.followEnabled ?? true,
  gymNotice: payload.gymNotice ?? payload.gymNoticeEnabled ?? true,
  marketing: payload.marketing ?? payload.marketingEnabled ?? false,
  quietHoursEnabled: payload.quietHoursEnabled ?? false,
  quietHoursStart: String(payload.quietHoursStart ?? payload.quietStart ?? '22:00').slice(0, 5),
  quietHoursEnd: String(payload.quietHoursEnd ?? payload.quietEnd ?? '08:00').slice(0, 5),
});

const loadFromLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    form.value = mergeForm(JSON.parse(raw));
  } catch (error) {
    // ignore malformed storage
  }
};

const persistLocal = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(form.value));
};

const loadSettings = async () => {
  message.value = '';
  errorMessage.value = '';
  try {
    const response = await notificationSettingsApi.get();
    const payload = response.data?.data || response.data?.result || response.data || {};
    form.value = mergeForm(payload);
    persistLocal();
  } catch (error) {
    loadFromLocal();
    errorMessage.value = '알림 설정 API를 불러오지 못해 로컬 설정을 사용합니다.';
  }
};

const saveSettings = async () => {
  isSaving.value = true;
  message.value = '';
  errorMessage.value = '';

  const payload = {
    commentEnabled: form.value.comment,
    likeEnabled: form.value.like,
    followEnabled: form.value.follow,
    gymNoticeEnabled: form.value.gymNotice,
    marketingEnabled: form.value.marketing,
    quietHoursEnabled: form.value.quietHoursEnabled,
    quietStart: `${form.value.quietHoursStart}:00`,
    quietEnd: `${form.value.quietHoursEnd}:00`,
    timezone: getBrowserTimezone(),
  };

  try {
    await notificationSettingsApi.update(payload);
    persistLocal();
    message.value = '알림 설정이 저장되었습니다.';
  } catch (error) {
    persistLocal();
    errorMessage.value = '서버 저장에 실패하여 로컬에만 저장했습니다.';
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadSettings);
</script>

<style scoped>
.settings-page {
  display: grid;
  gap: 16px;
}

.settings-head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.settings-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.settings-group {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.settings-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.settings-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.settings-help {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.settings-toggle-input {
  width: 20px;
  height: 20px;
}

.settings-inline-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.settings-inline-field input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  padding: 8px 10px;
  font-size: 13px;
}

.settings-message {
  margin: 0;
  font-size: 13px;
  color: #166534;
}

.settings-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

.settings-save-btn {
  width: 100%;
  min-height: 48px;
}
</style>
