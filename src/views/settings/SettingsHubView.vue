<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card settings-hub">
          <div class="settings-head">
            <h1 class="settings-title">설정</h1>
            <p class="settings-sub">계정, 알림, 정책 및 운영 메뉴를 관리하세요.</p>
          </div>

          <p v-if="isGymApplySuccess" class="settings-banner-success">
            사장님 권한 신청이 접수되었습니다. 관리자 승인 후 운영 설정을 사용할 수 있습니다.
          </p>

          <div class="settings-grid">
            <RouterLink v-if="profileRole === 'USER'" to="/settings/user" class="settings-card">
              <h2>일반 유저 설정</h2>
              <p>프로필, 비밀번호, 개인정보 공개, 탈퇴를 관리합니다.</p>
            </RouterLink>

            <RouterLink v-if="profileRole === 'GYM_OWNER'" to="/settings/gym-owner" class="settings-card">
              <h2>짐 운영 설정</h2>
              <p>짐 기본 정보, 운영시간, 예외 시간, 운영 계정을 관리합니다.</p>
            </RouterLink>

            <RouterLink to="/settings/notifications" class="settings-card">
              <h2>알림 설정</h2>
              <p>댓글/좋아요/팔로우/공지/마케팅/야간 알림을 관리합니다.</p>
            </RouterLink>

            <RouterLink to="/legal/terms" class="settings-card">
              <h2>이용약관</h2>
              <p>서비스 이용 조건과 정책을 확인합니다.</p>
            </RouterLink>

            <RouterLink to="/legal/privacy" class="settings-card">
              <h2>개인정보처리방침</h2>
              <p>개인정보 수집/이용/보관 정책을 확인합니다.</p>
            </RouterLink>

            <RouterLink v-if="profileRole === 'ADMIN'" to="/admin" class="settings-card settings-card-admin">
              <h2>관리자 콘솔</h2>
              <p>운영 지표, 신고 처리, 사용자/짐 상태를 관리합니다.</p>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { useSession } from '@/composables/useSession';

const route = useRoute();
const { sessionProfile, syncSessionFromServer, primeSessionFromToken } = useSession();

const profileRole = computed(() => sessionProfile.value?.role || null);
const isGymApplySuccess = computed(() => route.query.gymApply === 'success');

onMounted(async () => {
  primeSessionFromToken();
  try {
    await syncSessionFromServer();
  } catch (error) {
    // route guard handles auth failures
  }
});
</script>

<style scoped>
.settings-hub {
  display: grid;
  gap: 20px;
}

.settings-head {
  display: grid;
  gap: 6px;
}

.settings-title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
}

.settings-sub {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.settings-banner-success {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
  color: #166534;
  background: #f0fdf4;
  font-size: 13px;
  font-weight: 600;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.settings-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.settings-card:hover {
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.settings-card-admin {
  background: #f8fafc;
}

.settings-card h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.settings-card p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}

@media (min-width: 900px) {
  .settings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
