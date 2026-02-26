<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card admin-page">
          <button class="admin-back-btn" @click="goBackToUsers">
            ← 사용자 목록
          </button>

          <div class="admin-head">
            <h1>사용자 상세</h1>
            <p>#{{ userId }}</p>
          </div>

          <div v-if="isLoading" class="admin-loading">사용자 정보를 불러오는 중입니다.</div>

          <div v-else class="admin-detail-grid">
            <div class="admin-detail-card">
              <p class="admin-label">이름</p>
              <strong>{{ user.userName || user.name || '-' }}</strong>
            </div>
            <div class="admin-detail-card">
              <p class="admin-label">이메일</p>
              <strong>{{ user.email || '-' }}</strong>
            </div>
            <div class="admin-detail-card">
              <p class="admin-label">역할</p>
              <strong>{{ user.role || '-' }}</strong>
            </div>
            <div class="admin-detail-card">
              <p class="admin-label">상태</p>
              <strong :class="isSuspended ? 'admin-status-suspended' : 'admin-status-active'">
                {{ isSuspended ? '정지' : '정상' }}
              </strong>
            </div>
          </div>

          <div class="admin-action-row">
            <button v-if="!isSuspended" class="admin-btn admin-btn-warn" @click="suspendUser">
              정지
            </button>
            <button v-else class="admin-btn admin-btn-muted" @click="unsuspendUser">
              정지 해제
            </button>
          </div>

          <p v-if="message" class="admin-message">{{ message }}</p>
          <p v-if="errorMessage" class="admin-error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { adminApi } from '@/services/apis';
import { extractPayload } from '@/utils/api';

const route = useRoute();
const router = useRouter();
const userId = computed(() => route.params.userId);
const user = ref({});
const isLoading = ref(false);
const message = ref('');
const errorMessage = ref('');

const isSuspended = computed(() => (
  Boolean(user.value?.suspended)
  || String(user.value?.status || '').toUpperCase() === 'SUSPENDED'
));

const goBackToUsers = () => {
  router.push('/admin/users');
};

const loadUser = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await adminApi.userDetail(userId.value);
    user.value = extractPayload(response);
  } catch (error) {
    user.value = {};
    errorMessage.value = '사용자 상세 정보를 불러오지 못했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const suspendUser = async () => {
  const daysInput = window.prompt('정지 기간(일)을 입력해주세요.', '7');
  const reason = window.prompt('정지 사유를 입력해주세요.', '운영 정책 위반') || '운영 정책 위반';
  const days = Number(daysInput || 0);
  if (!days || days < 1) {
    errorMessage.value = '정지 기간은 1일 이상이어야 합니다.';
    return;
  }

  try {
    await adminApi.suspendUser(userId.value, { days, reason });
    message.value = `사용자 #${userId.value} 계정을 정지했습니다.`;
    await loadUser();
  } catch (error) {
    errorMessage.value = '사용자 정지 처리에 실패했습니다.';
  }
};

const unsuspendUser = async () => {
  try {
    await adminApi.unsuspendUser(userId.value);
    message.value = `사용자 #${userId.value} 계정 정지를 해제했습니다.`;
    await loadUser();
  } catch (error) {
    errorMessage.value = '사용자 정지 해제에 실패했습니다.';
  }
};

onMounted(loadUser);
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

.admin-btn-warn {
  border-color: #ef4444;
  background: #ef4444;
}

.admin-btn-muted {
  border-color: #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.admin-message {
  margin: 0;
  color: #166534;
  font-size: 13px;
}

.admin-error {
  margin: 0;
  color: #dc2626;
  font-size: 13px;
}

@media (min-width: 900px) {
  .admin-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
