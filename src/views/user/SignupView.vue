<template>
  <div class="auth-screen">
    <div class="v-auth-glow-left" />
    <div class="v-auth-glow-right" />

    <div class="auth-shell">
      <section class="v-auth-feature-column">
        <RouterLink to="/" class="v-auth-back-link">홈으로 돌아가기<ArrowRight class="u-icon-16" /></RouterLink>

        <div class="v-auth-brand-row">
          <span class="v-auth-brand-badge v-auth-brand-badge-blue"><Dumbbell class="u-icon-24" /></span>
          <div><p class="v-auth-kicker">짐맵</p><h1 class="v-auth-title">회원가입</h1></div>
        </div>

        <div class="sx-views-user-signupview-001">
          <!-- <p class="ux-views-user-signupview-003">가입하면 받을 수 있어요</p> -->
          <div class="sx-views-user-signupview-002">
            <span v-for="item in checklist" :key="item" class="u-row-gap-2"><CheckCircle2 class="u-icon-16" />{{ item }}</span>
          </div>
        </div>
      </section>

      <section class="v-auth-panel">
        <div><p class="ux-views-user-signupview-004">계정 만들기</p><h2 class="sx-views-user-loginview-001">가입 방식 선택</h2></div>

        <div class="v-login-social-wrap">
          <p class="v-login-social-label">SNS로 가입하기</p>
          <button type="button" class="v-login-social-btn" @click="startSocialSignUp('google')">
            <span class="v-login-social-icon v-login-social-icon-google">G</span>
            구글로 가입하기
          </button>
          <button type="button" class="v-login-social-btn" @click="startSocialSignUp('kakao')">
            <span class="v-login-social-icon v-login-social-icon-kakao">K</span>
            카카오로 가입하기
          </button>
          <button type="button" class="v-login-social-btn" @click="startSocialSignUp('naver')">
            <span class="v-login-social-icon v-login-social-icon-naver">N</span>
            네이버로 가입하기
          </button>
        </div>

        <div class="v-login-divider"><span>또는</span></div>

        <button type="button" class="v-auth-submit v-auth-submit-blue" @click="startEmailSignUp">
          이메일로 가입하기<ArrowRight class="u-icon-16" />
        </button>

        <p v-if="errorMessage" class="u-text-error-xs">{{ errorMessage }}</p>
        <button type="button" class="v-auth-outline-link v-auth-outline-link-blue" @click="openAuthModal">로그인 하기</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { Dumbbell, ArrowRight, CheckCircle2 } from 'lucide-vue-next';
import { useAuthModal } from '@/composables/useAuthModal';

const checklist = ['운동 히스토리 기록', '근처 체육관 찾기 및 즐겨찾기', '실시간 커뮤니티 및 채팅', '멤버십 혜택 리포트'];

const router = useRouter();
const { openAuthModal } = useAuthModal();
const errorMessage = ref('');
const API_BASE_URL =
  import.meta.env.VUE_APP_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

const startSocialSignUp = async (provider) => {
  errorMessage.value = '';
  try {
    const normalizedProvider = String(provider || '').trim().toLowerCase();
    if (!['google', 'kakao', 'naver'].includes(normalizedProvider)) {
      errorMessage.value = '지원하지 않는 소셜 가입입니다.';
      return;
    }

    const normalizedApiBaseUrl = String(API_BASE_URL).replace(/\/+$/, '');
    const redirectUrl = `${normalizedApiBaseUrl}/oauth2/authorization/${normalizedProvider}`;
    window.location.href = redirectUrl;
  } catch (error) {
    errorMessage.value = 'SNS 가입 진행 중 오류가 발생했습니다.';
    console.error('SNS signup redirect failed:', error);
  }
};

const startEmailSignUp = () => {
  router.push('/signup/new');
};
</script>
