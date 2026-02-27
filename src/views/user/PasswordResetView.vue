<template>
  <div class="auth-screen">
    <div class="v-auth-glow-left" />
    <div class="v-auth-glow-right" />

    <div class="auth-shell v-reset-shell">
      <section class="v-auth-feature-column">
        <RouterLink to="/" class="v-auth-back-link">홈으로 돌아가기<ArrowRight class="u-icon-16" /></RouterLink>

        <div class="v-auth-brand-row">
          <span class="v-auth-brand-badge v-auth-brand-badge-green"><Dumbbell class="u-icon-24" /></span>
          <div>
            <p class="v-auth-kicker">짐맵</p>
            <h1 class="v-auth-title">{{ hasToken ? '비밀번호 재설정' : '비밀번호 찾기' }}</h1>
          </div>
        </div>

        <p class="v-auth-description">
          {{ hasToken ? '새 비밀번호를 입력하고 계정을 다시 이용하세요.' : '가입한 이메일로 비밀번호 재설정 링크를 발송합니다.' }}
        </p>
      </section>

      <section class="v-auth-panel">
        <div>
          <p class="ux-views-user-signupview-004">계정 복구</p>
          <h2 class="sx-views-user-loginview-001">{{ hasToken ? '새 비밀번호 입력' : '재설정 링크 발송' }}</h2>
        </div>

        <form v-if="!hasToken" class="v-auth-form" @submit.prevent="submitResetMail">
          <label class="v-auth-form-label">
            이메일
            <input v-model="email" type="email" placeholder="example@email.com" class="v-auth-input" />
          </label>
          <p v-if="errorMessage" class="u-text-error-xs">{{ errorMessage }}</p>
          <p v-if="successMessage" class="v-reset-success-msg">{{ successMessage }}</p>
          <button :disabled="isSubmitting" type="submit" class="v-auth-submit v-auth-submit-green">
            {{ isSubmitting ? '전송 중...' : '재설정 메일 보내기' }}<ArrowRight class="u-icon-16" />
          </button>
        </form>

        <form v-else class="v-auth-form" @submit.prevent="submitResetPassword">
          <label class="v-auth-form-label">
            새 비밀번호
            <input
              v-model="newPassword"
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              class="v-auth-input"
            />
          </label>
          <label class="v-auth-form-label">
            새 비밀번호 확인
            <input
              v-model="newPasswordConfirm"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              class="v-auth-input"
            />
          </label>
          <p v-if="errorMessage" class="u-text-error-xs">{{ errorMessage }}</p>
          <p v-if="successMessage" class="v-reset-success-msg">{{ successMessage }}</p>
          <button :disabled="isSubmitting" type="submit" class="v-auth-submit v-auth-submit-green">
            {{ isSubmitting ? '변경 중...' : '비밀번호 변경 완료' }}<ArrowRight class="u-icon-16" />
          </button>
        </form>

        <button type="button" class="v-auth-outline-link v-auth-outline-link-green" @click="goToLogin">
          로그인으로 돌아가기
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ArrowRight, Dumbbell } from 'lucide-vue-next';
import { userApi } from '@/services/apis';
import { useAuthModal } from '@/composables/useAuthModal';

const route = useRoute();
const router = useRouter();
const { openAuthModal } = useAuthModal();

const email = ref(String(route.query.email || ''));
const newPassword = ref('');
const newPasswordConfirm = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const hasToken = computed(() => String(route.query.token || '').trim().length > 0);
const token = computed(() => String(route.query.token || '').trim());

watch(
  () => route.query.email,
  (next) => {
    email.value = String(next || '');
  },
);

watch(
  () => route.query.token,
  () => {
    errorMessage.value = '';
    successMessage.value = '';
    newPassword.value = '';
    newPasswordConfirm.value = '';
  },
);

const extractApiMessage = (error, fallbackMessage) => (
  String(
    error?.response?.data?.message
      || error?.response?.data?.error
      || error?.response?.data?.result
      || '',
  ).trim() || fallbackMessage
);

const submitResetMail = async () => {
  const targetEmail = String(email.value || '').trim();
  if (!targetEmail) {
    errorMessage.value = '이메일을 입력해주세요.';
    successMessage.value = '';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await userApi.sendPasswordResetMail({ email: targetEmail });
    successMessage.value = '재설정 메일을 보냈습니다. 이메일의 링크를 확인해주세요.';
  } catch (error) {
    errorMessage.value = extractApiMessage(error, '비밀번호 재설정 메일 전송에 실패했습니다.');
  } finally {
    isSubmitting.value = false;
  }
};

const submitResetPassword = async () => {
  if (!token.value) {
    errorMessage.value = '유효하지 않은 접근입니다.';
    successMessage.value = '';
    return;
  }
  if (!newPassword.value) {
    errorMessage.value = '새 비밀번호를 입력해주세요.';
    successMessage.value = '';
    return;
  }
  if (newPassword.value !== newPasswordConfirm.value) {
    errorMessage.value = '비밀번호 확인이 일치하지 않습니다.';
    successMessage.value = '';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await userApi.resetPassword({
      token: token.value,
      newPassword: newPassword.value,
    });
    successMessage.value = '비밀번호가 변경되었습니다. 다시 로그인해주세요.';
    newPassword.value = '';
    newPasswordConfirm.value = '';
  } catch (error) {
    errorMessage.value = extractApiMessage(error, '비밀번호 변경에 실패했습니다.');
  } finally {
    isSubmitting.value = false;
  }
};

const goToLogin = () => {
  router.push('/');
  openAuthModal();
};
</script>

<style scoped>
.v-reset-shell {
  max-width: 940px;
}

.v-reset-success-msg {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #16a34a;
}
</style>
