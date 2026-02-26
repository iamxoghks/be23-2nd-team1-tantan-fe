<template>
  <div class="auth-screen">
    <div class="v-auth-glow-left" />
    <div class="v-auth-glow-right" />

    <div class="auth-shell v-signup-owner-shell">
      <section class="v-auth-feature-column">
        <RouterLink to="/signup" class="v-auth-back-link">가입 방식 선택으로<ArrowRight class="u-icon-16" /></RouterLink>

        <div class="v-auth-brand-row">
          <span class="v-auth-brand-badge v-auth-brand-badge-blue"><Dumbbell class="u-icon-24" /></span>
          <div>
            <p class="v-auth-kicker">짐맵</p>
            <h1 class="v-auth-title">헬스장 관리자 가입</h1>
          </div>
        </div>

        <p class="v-auth-description">관리자 계정과 헬스장 기본 정보를 입력하면 바로 운영을 시작할 수 있어요.</p>
      </section>

      <section class="v-auth-panel">
        <div>
          <p class="ux-views-user-signupview-004">짐 사장님 계정</p>
          <h2 class="sx-views-user-loginview-001">관리자 정보 입력</h2>
        </div>

        <form class="v-auth-form v-owner-signup-form" @submit.prevent="handleGymOwnerSignUp">
          <div class="v-owner-form-grid">
            <label class="v-auth-form-label">
              관리자 이름
              <input v-model="ownerName" type="text" placeholder="관리자 이름" class="v-auth-input" />
            </label>
            <label class="v-auth-form-label">
              관리자 닉네임(선택)
              <input v-model="ownerNickName" type="text" placeholder="닉네임" class="v-auth-input" />
            </label>
          </div>

          <div class="v-owner-form-grid">
            <label class="v-auth-form-label">
              관리자 이메일
              <input v-model="email" type="email" placeholder="manager@gymmap.com" class="v-auth-input" />
            </label>
            <label class="v-auth-form-label">
              관리자 연락처
              <input v-model="ownerPhone" type="text" placeholder="010-1234-5678" class="v-auth-input" />
            </label>
          </div>

          <div class="v-owner-form-grid">
            <label class="v-auth-form-label">
              비밀번호
              <input v-model="password" type="password" placeholder="비밀번호" class="v-auth-input" />
            </label>
            <label class="v-auth-form-label">
              비밀번호 확인
              <input v-model="passwordConfirm" type="password" placeholder="비밀번호 확인" class="v-auth-input" />
            </label>
          </div>

          <div class="v-owner-form-divider" />

          <div>
            <p class="ux-views-user-signupview-004">짐 정보</p>
            <h3 class="v-owner-section-title">헬스장 정보 입력</h3>
          </div>

          <div class="v-owner-form-grid">
            <label class="v-auth-form-label">
              헬스장 이름
              <input v-model="gymName" type="text" placeholder="탄탄짐 강남점" class="v-auth-input" />
            </label>
            <label class="v-auth-form-label">
              사업자 등록번호
              <input v-model="businessNumber" type="text" placeholder="123-45-67890" class="v-auth-input" />
            </label>
          </div>

          <div class="v-owner-form-grid">
            <label class="v-auth-form-label">
              헬스장 전화번호
              <input v-model="gymPhone" type="text" placeholder="02-123-4567" class="v-auth-input" />
            </label>
            <label class="v-auth-form-label">
              운영 시간
              <input v-model="gymHours" type="text" placeholder="평일 06:00 - 23:00" class="v-auth-input" />
            </label>
          </div>

          <label class="v-auth-form-label">
            헬스장 주소
            <input v-model="gymAddress" type="text" placeholder="서울시 강남구 ..." class="v-auth-input" />
          </label>

          <label class="v-auth-form-label">
            헬스장 소개(선택)
            <textarea v-model="gymDescription" placeholder="헬스장 소개를 입력해주세요." class="v-auth-input v-owner-textarea" />
          </label>

          <div class="v-signup-consent-wrap">
            <label class="v-signup-consent-check">
              <input v-model="agreeAll" type="checkbox" @change="onToggleAllConsent" />
              <span>약관 및 개인정보처리방침 전체 동의</span>
            </label>

            <div class="v-signup-consent-item">
              <div class="v-signup-consent-head">
                <label class="v-signup-consent-check">
                  <input v-model="agreeTerms" type="checkbox" />
                  <span>[필수] 이용약관 동의</span>
                </label>
                <RouterLink to="/legal/terms" target="_blank" class="v-signup-consent-link">전문보기</RouterLink>
              </div>
              <pre class="v-signup-consent-box">{{ termsText }}</pre>
            </div>

            <div class="v-signup-consent-item">
              <div class="v-signup-consent-head">
                <label class="v-signup-consent-check">
                  <input v-model="agreePrivacy" type="checkbox" />
                  <span>[필수] 개인정보처리방침 동의</span>
                </label>
                <RouterLink to="/legal/privacy" target="_blank" class="v-signup-consent-link">전문보기</RouterLink>
              </div>
              <pre class="v-signup-consent-box">{{ privacyText }}</pre>
            </div>
          </div>

          <p v-if="errorMessage" class="u-text-error-xs">{{ errorMessage }}</p>

          <button :disabled="isSubmitting" type="submit" class="v-auth-submit v-auth-submit-blue">
            {{ isSubmitting ? '가입 중...' : '관리자 회원가입 완료' }}<ArrowRight class="u-icon-16" />
          </button>
        </form>

        <button type="button" class="v-auth-outline-link v-auth-outline-link-green" @click="openAuthModal">로그인 하러가기</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Dumbbell, ArrowRight } from 'lucide-vue-next';
import { gymApi, userApi } from '@/services/apis';
import { setAuthTokens } from '@/services/token';
import { useSession } from '@/composables/useSession';
import termsText from '@/content/legal/terms.v1.md?raw';
import privacyText from '@/content/legal/privacy.v1.md?raw';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/constants/legal';

const router = useRouter();
const { syncSessionFromServer } = useSession();

const ownerName = ref('');
const ownerNickName = ref('');
const email = ref('');
const ownerPhone = ref('');
const password = ref('');
const passwordConfirm = ref('');
const gymName = ref('');
const businessNumber = ref('');
const gymPhone = ref('');
const gymHours = ref('');
const gymAddress = ref('');
const gymDescription = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const agreeAll = ref(false);
const agreeTerms = ref(false);
const agreePrivacy = ref(false);

const onToggleAllConsent = () => {
  agreeTerms.value = agreeAll.value;
  agreePrivacy.value = agreeAll.value;
};

const syncAgreeAll = () => {
  agreeAll.value = agreeTerms.value && agreePrivacy.value;
};

const createConsents = () => {
  const agreedAt = new Date().toISOString();
  return {
    terms: { version: TERMS_VERSION, agreedAt },
    privacy: { version: PRIVACY_VERSION, agreedAt },
  };
};

watch([agreeTerms, agreePrivacy], () => {
  syncAgreeAll();
});

const handleGymOwnerSignUp = async () => {
  if (!ownerName.value || !email.value || !password.value || !gymName.value || !businessNumber.value || !gymAddress.value) {
    errorMessage.value = '관리자 정보와 헬스장 필수 정보를 모두 입력해주세요.';
    return;
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = '비밀번호 확인이 일치하지 않습니다.';
    return;
  }

  syncAgreeAll();
  if (!agreeTerms.value || !agreePrivacy.value) {
    errorMessage.value = '이용약관과 개인정보처리방침에 동의해주세요.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await userApi.signUp({
      userName: ownerName.value,
      nickName: ownerNickName.value || null,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      consents: createConsents(),
    });

    const loginResponse = await userApi.login({
      email: email.value,
      password: password.value,
    });
    const payload = loginResponse.data?.data || loginResponse.data?.result || loginResponse.data || {};
    setAuthTokens({
      accessToken: payload.accessToken || payload.at || payload.token,
      refreshToken: payload.refreshToken || payload.rt,
    });

    await gymApi.apply(String(businessNumber.value || '').trim());

    localStorage.setItem('gymOwnerOnboardingDraft', JSON.stringify({
      gymName: gymName.value,
      gymPhone: gymPhone.value,
      gymAddress: gymAddress.value,
      gymHours: gymHours.value,
      gymDescription: gymDescription.value,
      ownerPhone: ownerPhone.value,
    }));

    await syncSessionFromServer({ force: true });
    router.push('/settings?gymApply=success');
  } catch (error) {
    errorMessage.value = '헬스장 사장님 가입/신청 처리에 실패했습니다.';
    console.error('Gym owner signup failed:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.v-signup-consent-wrap {
  margin-top: 8px;
  display: grid;
  gap: 10px;
}

.v-signup-consent-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px;
  background: #f8fafc;
}

.v-signup-consent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.v-signup-consent-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #334155;
}

.v-signup-consent-link {
  font-size: 12px;
  color: #2563eb;
  font-weight: 700;
}

.v-signup-consent-box {
  margin-top: 8px;
  max-height: 120px;
  overflow: auto;
  white-space: pre-wrap;
  font-size: 11px;
  line-height: 1.45;
  color: #475569;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}
</style>
