<template>
  <div v-if="isAuthModalOpen" class="v-login-modal-backdrop" @click.self="closeAuthModal">
    <section class="v-auth-panel v-login-modal-panel v-login-modal-panel-overlay">
      <button type="button" class="v-login-modal-close" @click="closeAuthModal" aria-label="로그인 모달 닫기">
        <X :size="18" />
      </button>

      <template v-if="loginStep === 'email'">
        <div class="v-login-head">
          <span class="v-auth-brand-badge v-auth-brand-badge-blue">
            <Dumbbell class="u-icon-24" />
          </span>
          <h2 class="sx-views-user-loginview-001">로그인</h2>
        </div>

        <div class="v-login-social-wrap">
          <p class="v-login-social-label">SNS로 로그인 하기</p>
          <button type="button" class="v-login-social-btn" @click="handleSocialLogin('google')">
            <span class="v-login-social-icon v-login-social-icon-google">G</span>
            구글로 계속하기
          </button>
          <button type="button" class="v-login-social-btn" @click="handleSocialLogin('kakao')">
            <span class="v-login-social-icon v-login-social-icon-kakao">K</span>
            카카오로 계속하기
          </button>
        </div>

        <div class="v-login-divider"><span>또는</span></div>

        <form class="v-auth-form" @submit.prevent="goToPasswordStep">
          <p class="v-login-email-label">이메일 로그인</p>
            <input v-model="email" type="email" placeholder="example@email.com" class="v-auth-input" />
          <p v-if="errorMessage" class="u-text-error-xs">{{ errorMessage }}</p>
          <button type="submit" class="v-auth-submit v-login-continue-btn">
            계속<ArrowRight class="u-icon-16" />
          </button>
        </form>
      </template>

      <template v-else>
        <div class="v-login-head v-login-head-tight">
          <span class="v-auth-brand-badge v-auth-brand-badge-blue">
            <Dumbbell class="u-icon-24" />
          </span>
          <h2 class="sx-views-user-loginview-001">비밀번호 입력</h2>
          <p class="sx-views-user-loginview-002">{{ email }}</p>
        </div>

        <form class="v-auth-form" @submit.prevent="handleLogin">
          <label class="v-auth-form-label">비밀번호<input v-model="password" type="password" placeholder="비밀번호를 입력하세요" class="v-auth-input" /></label>
          <p v-if="errorMessage" class="u-text-error-xs">{{ errorMessage }}</p>
          <button :disabled="isSubmitting" type="submit" class="v-auth-submit v-auth-submit-blue">
            {{ isSubmitting ? '로그인 중...' : '로그인' }}<ArrowRight class="u-icon-16" />
          </button>
          <button type="button" class="v-login-forgot-btn" @click="goToPasswordReset">
            비밀번호를 잊으셨나요?
          </button>
          <button type="button" class="v-login-alt-method-btn" @click="backToEmailStep">다른 방법으로 로그인하기</button>
        </form>
      </template>

      <div class="v-login-signup-row">
        <span>계정이 없으신가요?</span>
        <RouterLink to="/signup" class="v-login-signup-link" @click="closeAuthModal">회원가입</RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Dumbbell, ArrowRight, X } from 'lucide-vue-next';
import { userApi } from '@/services/apis';
import { setAuthTokens } from '@/services/token';
import { useAuthModal } from '@/composables/useAuthModal';
import { useSession } from '@/composables/useSession';

const router = useRouter();
const loginStep = ref('email');
const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const { isAuthModalOpen, closeAuthModal } = useAuthModal();
const { syncSessionFromServer } = useSession();
const getValidApiBaseUrl = () => {
  const envVite = import.meta.env.VITE_API_BASE_URL;
  const envVue = import.meta.env.VUE_APP_API_BASE_URL;
  
  if (envVite && envVite.startsWith('http')) return envVite;
  if (envVue && envVue.startsWith('http')) return envVue;
  
  return 'http://localhost:8080';
};

const API_BASE_URL = getValidApiBaseUrl();

watch(isAuthModalOpen, (isOpen) => {
  if (!isOpen) return;
  loginStep.value = 'email';
  password.value = '';
  errorMessage.value = '';
});

const handleSocialLogin = (provider) => {
  const normalizedProvider = String(provider || '').trim().toLowerCase();
  if (!['google', 'kakao'].includes(normalizedProvider)) {
    errorMessage.value = '지원하지 않는 소셜 로그인입니다.';
    return;
  }

  const normalizedApiBaseUrl = String(API_BASE_URL).replace(/\/+$/, '');
  const redirectUrl = `${normalizedApiBaseUrl}/oauth2/authorization/${normalizedProvider}`;
  window.location.href = redirectUrl;
};

const goToPasswordStep = () => {
  if (!email.value.trim()) {
    errorMessage.value = '이메일을 입력해주세요.';
    return;
  }
  errorMessage.value = '';
  loginStep.value = 'password';
};

const backToEmailStep = () => {
  password.value = '';
  errorMessage.value = '';
  loginStep.value = 'email';
};

const goToPasswordReset = () => {
  const query = {};
  if (String(email.value || '').trim()) {
    query.email = String(email.value || '').trim();
  }
  closeAuthModal();
  router.push({ path: '/reset-password', query });
};

const handleLogin = async () => {
  if (!password.value) {
    errorMessage.value = '비밀번호를 입력해주세요.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const response = await userApi.login({
      email: email.value,
      password: password.value,
    });

    const payload = response.data?.data || response.data?.result || response.data || {};
    const accessToken = payload.accessToken || payload.at || payload.token;
    const refreshToken = payload.refreshToken || payload.rt;

    if (accessToken || refreshToken) {
      setAuthTokens({ accessToken, refreshToken });
      await syncSessionFromServer({ force: true });
    }

    closeAuthModal();
    router.replace('/');
  } catch (error) {
    errorMessage.value = '로그인에 실패했습니다.';
    console.error('Login failed:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.v-login-forgot-btn {
  margin-top: 8px;
  width: 100%;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
}
</style>
