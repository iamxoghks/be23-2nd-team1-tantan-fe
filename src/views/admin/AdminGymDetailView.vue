<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card admin-page">
          <button class="admin-back-btn" @click="goBackToGyms">
            ← 짐 목록
          </button>

          <div class="admin-head">
            <h1>짐 상세</h1>
            <p>#{{ gymId }}</p>
          </div>

          <div v-if="isLoading" class="admin-loading">짐 정보를 불러오는 중입니다.</div>
          <p v-if="pageErrorMessage" class="admin-error">{{ pageErrorMessage }}</p>

          <div v-else class="admin-detail-grid">
            <div class="admin-detail-card">
              <p class="admin-label">짐 이름</p>
              <strong>{{ gym.name || '-' }}</strong>
            </div>
            <div class="admin-detail-card">
              <p class="admin-label">전화번호</p>
              <strong>{{ gym.tel || gym.phone || '-' }}</strong>
            </div>
            <div class="admin-detail-card admin-detail-span-2">
              <p class="admin-label">주소</p>
              <strong>{{ gym.address || '-' }}</strong>
            </div>
            <div class="admin-detail-card">
              <p class="admin-label">카테고리</p>
              <strong>{{ gym.categoryName || gym.category || gym.categoryId || '-' }}</strong>
            </div>
            <div class="admin-detail-card">
              <p class="admin-label">상태</p>
              <strong :class="isSuspended ? 'admin-status-suspended' : 'admin-status-active'">
                {{ isSuspended ? '정지' : '정상' }}
              </strong>
            </div>
          </div>

          <div class="admin-action-row">
            <button v-if="!isSuspended" class="admin-btn admin-btn-warn" :disabled="isStatusUpdating" @click="openSuspendDaysModal">
              정지
            </button>
            <button v-else class="admin-btn admin-btn-muted" :disabled="isStatusUpdating" @click="unsuspendGym">
              정지 해제
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isSuspendDaysModalOpen"
      class="view-modal-backdrop admin-action-modal-backdrop"
      @click.self="closeSuspendDaysModal"
    >
      <div class="view-modal-panel admin-action-modal-panel" role="dialog" aria-modal="true" aria-labelledby="admin-gym-suspend-days-title">
        <div class="admin-action-modal-body">
          <h2 id="admin-gym-suspend-days-title" class="v-modal-title">짐 정지</h2>
          <p class="admin-action-modal-copy">정지 기간(일)을 입력해주세요.</p>
          <input
            v-model="suspendDaysInput"
            type="number"
            min="1"
            class="v-modal-line-input"
            placeholder="예: 7"
            @keydown.enter.prevent="proceedToSuspendReasonModal"
          />
          <p v-if="suspendDaysError" class="admin-action-modal-error">{{ suspendDaysError }}</p>
        </div>
        <div class="admin-action-modal-actions">
          <button type="button" class="v-modal-cancel-btn" :disabled="isStatusUpdating" @click="closeSuspendDaysModal">취소</button>
          <button type="button" class="v-modal-save-btn" :disabled="isStatusUpdating" @click="proceedToSuspendReasonModal">다음</button>
        </div>
      </div>
    </div>

    <div
      v-if="isSuspendReasonModalOpen"
      class="view-modal-backdrop admin-action-modal-backdrop"
      @click.self="closeSuspendReasonModal"
    >
      <div class="view-modal-panel admin-action-modal-panel" role="dialog" aria-modal="true" aria-labelledby="admin-gym-suspend-reason-title">
        <div class="admin-action-modal-body">
          <h2 id="admin-gym-suspend-reason-title" class="v-modal-title">정지 사유</h2>
          <p class="admin-action-modal-copy">정지 사유를 입력해주세요.</p>
          <textarea
            v-model="suspendReasonInput"
            rows="4"
            class="v-modal-line-input admin-action-modal-textarea"
            placeholder="정지 사유를 입력하세요"
          />
          <p v-if="suspendReasonError" class="admin-action-modal-error">{{ suspendReasonError }}</p>
        </div>
        <div class="admin-action-modal-actions">
          <button type="button" class="v-modal-cancel-btn" :disabled="isStatusUpdating" @click="closeSuspendReasonModal">취소</button>
          <button type="button" class="v-modal-save-btn admin-action-modal-save-warn" :disabled="isStatusUpdating" @click="submitSuspendGym">
            {{ isStatusUpdating ? '처리 중...' : '정지' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="feedbackModal.open"
      class="view-modal-backdrop admin-action-modal-backdrop"
      @click.self="closeFeedbackModal"
    >
      <div class="view-modal-panel admin-feedback-modal-panel" role="dialog" aria-modal="true" aria-labelledby="admin-gym-feedback-title">
        <div class="admin-action-modal-body">
          <h2 id="admin-gym-feedback-title" class="v-modal-title">{{ feedbackModal.title }}</h2>
          <p class="admin-action-modal-copy" :class="feedbackModal.tone === 'error' ? 'admin-action-modal-copy-error' : ''">
            {{ feedbackModal.message }}
          </p>
        </div>
        <div class="admin-action-modal-actions admin-action-modal-actions-single">
          <button
            type="button"
            class="v-modal-save-btn"
            :class="feedbackModal.tone === 'error' ? 'admin-action-modal-save-warn' : ''"
            @click="closeFeedbackModal"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { adminApi, gymApi } from '@/services/apis';
import { extractPayload } from '@/utils/api';

const route = useRoute();
const router = useRouter();
const gymId = computed(() => route.params.gymId);
const gym = ref({});
const isLoading = ref(false);
const pageErrorMessage = ref('');
const isStatusUpdating = ref(false);
const isSuspendDaysModalOpen = ref(false);
const isSuspendReasonModalOpen = ref(false);
const suspendDaysInput = ref('7');
const suspendReasonInput = ref('운영 정책 위반');
const suspendDaysError = ref('');
const suspendReasonError = ref('');
const feedbackModal = ref({
  open: false,
  title: '',
  message: '',
  tone: 'success',
});

const isSuspended = computed(() => (
  Boolean(gym.value?.suspended)
  || String(gym.value?.status || '').toUpperCase() === 'SUSPENDED'
));

const goBackToGyms = () => {
  router.push('/admin/gyms');
};

const openFeedbackModal = (title, message, tone = 'success') => {
  feedbackModal.value = {
    open: true,
    title,
    message,
    tone,
  };
};

const closeFeedbackModal = () => {
  feedbackModal.value = {
    ...feedbackModal.value,
    open: false,
  };
};

const toActionErrorMessage = (error, fallback) => (
  error?.response?.data?.message
  || error?.response?.data?.error
  || fallback
);

const loadGym = async () => {
  isLoading.value = true;
  pageErrorMessage.value = '';
  try {
    const response = await adminApi.gymDetail(gymId.value);
    gym.value = extractPayload(response);
  } catch (error) {
    try {
      const fallback = await gymApi.detail(gymId.value);
      gym.value = extractPayload(fallback);
      pageErrorMessage.value = 'admin 짐 상세 API가 없어 일반 짐 상세로 대체 표시합니다.';
    } catch (fallbackError) {
      gym.value = {};
      pageErrorMessage.value = '짐 상세 정보를 불러오지 못했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};

const openSuspendDaysModal = () => {
  suspendDaysInput.value = '7';
  suspendReasonInput.value = '운영 정책 위반';
  suspendDaysError.value = '';
  suspendReasonError.value = '';
  isSuspendDaysModalOpen.value = true;
};

const resetSuspendFlow = () => {
  isSuspendDaysModalOpen.value = false;
  isSuspendReasonModalOpen.value = false;
  suspendDaysError.value = '';
  suspendReasonError.value = '';
};

const closeSuspendDaysModal = () => {
  if (isStatusUpdating.value) return;
  isSuspendDaysModalOpen.value = false;
  suspendDaysError.value = '';
};

const proceedToSuspendReasonModal = () => {
  const days = Number(suspendDaysInput.value || 0);
  if (!Number.isFinite(days) || days < 1) {
    suspendDaysError.value = '정지 기간은 1일 이상이어야 합니다.';
    return;
  }
  suspendDaysError.value = '';
  isSuspendDaysModalOpen.value = false;
  isSuspendReasonModalOpen.value = true;
};

const closeSuspendReasonModal = () => {
  if (isStatusUpdating.value) return;
  isSuspendReasonModalOpen.value = false;
  suspendReasonError.value = '';
};

const submitSuspendGym = async () => {
  const days = Number(suspendDaysInput.value || 0);
  const reason = String(suspendReasonInput.value || '').trim();
  if (!Number.isFinite(days) || days < 1) {
    isSuspendReasonModalOpen.value = false;
    isSuspendDaysModalOpen.value = true;
    suspendDaysError.value = '정지 기간은 1일 이상이어야 합니다.';
    return;
  }
  if (!reason) {
    suspendReasonError.value = '정지 사유를 입력해주세요.';
    return;
  }

  isStatusUpdating.value = true;
  try {
    await adminApi.suspendGym(gymId.value, { days, reason });
    gym.value = {
      ...gym.value,
      suspended: true,
      status: 'SUSPENDED',
    };
    resetSuspendFlow();
    openFeedbackModal('정지 완료', `짐 #${gymId.value} 정지 처리 완료`);
  } catch (error) {
    resetSuspendFlow();
    openFeedbackModal('정지 실패', toActionErrorMessage(error, '짐 정지 처리에 실패했습니다.'), 'error');
  } finally {
    isStatusUpdating.value = false;
  }
};

const unsuspendGym = async () => {
  isStatusUpdating.value = true;
  try {
    await adminApi.unsuspendGym(gymId.value);
    gym.value = {
      ...gym.value,
      suspended: false,
      status: 'ACTIVE',
    };
    openFeedbackModal('정지 해제 완료', `짐 #${gymId.value} 정지 해제 완료`);
  } catch (error) {
    openFeedbackModal('정지 해제 실패', toActionErrorMessage(error, '짐 정지 해제에 실패했습니다.'), 'error');
  } finally {
    isStatusUpdating.value = false;
  }
};

onMounted(loadGym);
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 14px;
}

.admin-back-btn {
  min-height: 44px;
  width: fit-content;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  padding: 0 14px;
}

.admin-head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.admin-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.admin-loading {
  color: #64748b;
  font-size: 14px;
}

.admin-detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.admin-detail-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  padding: 12px;
}

.admin-label {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.admin-detail-card strong {
  display: block;
  margin-top: 8px;
  color: #0f172a;
  font-size: 16px;
}

.admin-status-active {
  color: #166534;
}

.admin-status-suspended {
  color: #b91c1c;
}

.admin-action-row {
  display: flex;
  gap: 8px;
}

.admin-btn {
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  padding: 0 12px;
}

.admin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-btn-warn {
  border-color: #ef4444;
  background: #ef4444;
}

.admin-btn-muted {
  border-color: #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.admin-error {
  margin: 0;
  color: #dc2626;
  font-size: 13px;
}

.admin-action-modal-backdrop {
  z-index: 2100;
}

.admin-action-modal-panel,
.admin-feedback-modal-panel {
  width: min(460px, calc(100% - 32px));
}

.admin-action-modal-body {
  display: grid;
  gap: 12px;
  padding: 24px;
}

.admin-action-modal-copy {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.admin-action-modal-copy-error {
  color: #b91c1c;
}

.admin-action-modal-textarea {
  min-height: 120px;
  resize: vertical;
  padding: 12px 14px;
}

.admin-action-modal-error {
  margin: 0;
  color: #dc2626;
  font-size: 13px;
}

.admin-action-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 24px 24px;
}

.admin-action-modal-actions-single {
  justify-content: center;
}

.admin-action-modal-save-warn {
  border-color: #ef4444;
  background: #ef4444;
}

@media (min-width: 900px) {
  .admin-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-detail-span-2 {
    grid-column: span 2;
  }
}
</style>
