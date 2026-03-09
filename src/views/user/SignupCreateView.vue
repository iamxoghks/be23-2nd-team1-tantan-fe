<template>
  <div class="auth-screen">
    <div class="v-auth-glow-left" />
    <div class="v-auth-glow-right" />

    <div class="auth-shell v-signup-create-shell">
      <section class="v-auth-feature-column">
        <RouterLink to="/signup" class="v-auth-back-link">가입 방식 선택으로<ArrowRight class="u-icon-16" /></RouterLink>

        <div class="v-auth-brand-row">
          <span class="v-auth-brand-badge v-auth-brand-badge-blue"><Dumbbell class="u-icon-24" /></span>
          <div>
            <p class="v-auth-kicker">tantan</p>
            <h1 class="v-auth-title">새 계정 만들기</h1>
          </div>
        </div>

      </section>

      <section class="v-auth-panel">
        <div>
          <p class="ux-views-user-signupview-004">계정 만들기</p>
          <h2 class="sx-views-user-loginview-001">정보 입력</h2>
          <p v-if="socialProvider" class="sx-views-user-loginview-002">{{ socialProviderLabel }} 인증 정보가 자동 입력되었습니다.</p>
        </div>

        <form class="v-auth-form" @submit.prevent="handleSignUp">
          <input v-model="userName" type="text" placeholder="이름" class="v-auth-input" />
          <input v-model="nickName" type="text" placeholder="닉네임(선택)" class="v-auth-input" />
          <div class="v-signup-email-verify-wrap">
            <label class="v-auth-form-label">
              이메일
              <div class="v-signup-email-row">
                <input
                  v-model="email"
                  type="email"
                  placeholder="이메일"
                  class="v-auth-input"
                  :readonly="isSocialVerified || isEmailVerified"
                />
                <button
                  type="button"
                  class="v-signup-email-btn"
                  :disabled="isSendingCode || isEmailVerified"
                  @click="sendVerificationCode"
                >
                  {{ isSendingCode ? '발송 중...' : (isCodeSent ? '재전송' : '인증') }}
                </button>
              </div>
              <p v-if="emailVerificationMessage" class="v-signup-email-status v-signup-email-status-success">
                {{ emailVerificationMessage }}
              </p>
              <p v-else-if="emailVerificationError" class="v-signup-email-status v-signup-email-status-error">
                {{ emailVerificationError }}
              </p>
            </label>

            <div v-if="isCodeSent || isEmailVerified" class="v-signup-code-row">
              <input
                v-model="verificationCode"
                type="text"
                placeholder="인증코드 입력"
                class="v-auth-input"
                :disabled="isEmailVerified"
              />
              <button
                type="button"
                class="v-signup-email-btn v-signup-email-btn-verify"
                :disabled="!isCodeSent || isVerifyingCode || isEmailVerified"
                @click="verifyEmailCode"
              >
                {{ isEmailVerified ? '인증 완료' : (isVerifyingCode ? '확인 중...' : '인증') }}
              </button>
            </div>
          </div>
          <input v-model="password" type="password" placeholder="비밀번호" class="v-auth-input" />
          <input v-model="passwordConfirm" type="password" placeholder="비밀번호 확인" class="v-auth-input" />
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
            {{ isSubmitting ? '가입 중...' : '회원가입 완료' }}<ArrowRight class="u-icon-16" />
          </button>
        </form>

        <button type="button" class="v-auth-outline-link v-auth-outline-link-blue" @click="openAuthModal">로그인 하기</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { Dumbbell, ArrowRight } from 'lucide-vue-next';
import { userApi } from '@/services/apis';
import { useAuthModal } from '@/composables/useAuthModal';
import termsText from '@/content/legal/terms.v1.md?raw';
import privacyText from '@/content/legal/privacy.v1.md?raw';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/constants/legal';

const route = useRoute();
const router = useRouter();
const { openAuthModal } = useAuthModal();

const socialProvider = ref(String(route.query.provider || ''));
const isSocialVerified = ref(route.query.socialVerified === '1');

const userName = ref(String(route.query.userName || ''));
const nickName = ref(String(route.query.nickName || ''));
const email = ref(String(route.query.email || ''));
const password = ref('');
const passwordConfirm = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const verificationCode = ref('');
const isSendingCode = ref(false);
const isCodeSent = ref(false);
const isVerifyingCode = ref(false);
const isEmailVerified = ref(false);
const verifiedEmail = ref('');
const emailVerificationMessage = ref('');
const emailVerificationError = ref('');
const agreeAll = ref(false);
const agreeTerms = ref(false);
const agreePrivacy = ref(false);

const socialProviderLabel = computed(() => {
  if (socialProvider.value === 'google') return '구글';
  if (socialProvider.value === 'kakao') return '카카오';
  if (socialProvider.value === 'naver') return '네이버';
  return '';
});

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

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const resetEmailVerificationState = () => {
  isCodeSent.value = false;
  isEmailVerified.value = false;
  verificationCode.value = '';
  verifiedEmail.value = '';
  emailVerificationMessage.value = '';
  emailVerificationError.value = '';
};

const toFriendlyEmailVerifyError = (error, fallbackMessage) => {
  const serverMessage = String(
    error?.response?.data?.message
      || error?.response?.data?.error
      || error?.response?.data?.result
      || '',
  ).trim();
  return serverMessage || fallbackMessage;
};

const sendVerificationCode = async () => {
  const targetEmail = normalizeEmail(email.value);
  if (!targetEmail) {
    emailVerificationError.value = '이메일을 입력해주세요.';
    emailVerificationMessage.value = '';
    return;
  }

  isSendingCode.value = true;
  emailVerificationError.value = '';
  emailVerificationMessage.value = '';
  isEmailVerified.value = false;
  verifiedEmail.value = '';
  try {
    await userApi.sendEmailVerification({ email: targetEmail });
    isCodeSent.value = true;
    verificationCode.value = '';
    emailVerificationMessage.value = '인증코드를 전송했습니다. 이메일을 확인해주세요.';
  } catch (error) {
    emailVerificationError.value = toFriendlyEmailVerifyError(error, '인증코드 전송에 실패했습니다.');
  } finally {
    isSendingCode.value = false;
  }
};

const verifyEmailCode = async () => {
  const targetEmail = normalizeEmail(email.value);
  const code = String(verificationCode.value || '').trim();
  if (!targetEmail) {
    emailVerificationError.value = '이메일을 입력해주세요.';
    emailVerificationMessage.value = '';
    return;
  }
  if (!code) {
    emailVerificationError.value = '인증코드를 입력해주세요.';
    emailVerificationMessage.value = '';
    return;
  }

  isVerifyingCode.value = true;
  emailVerificationError.value = '';
  emailVerificationMessage.value = '';
  try {
    await userApi.verifyEmailCode({ email: targetEmail, code });
    isEmailVerified.value = true;
    verifiedEmail.value = targetEmail;
    emailVerificationMessage.value = '인증 완료되었습니다.';
  } catch (error) {
    emailVerificationError.value = toFriendlyEmailVerifyError(error, '이메일 인증에 실패했습니다.');
  } finally {
    isVerifyingCode.value = false;
  }
};

watch([agreeTerms, agreePrivacy], () => {
  syncAgreeAll();
});

watch(
  () => normalizeEmail(email.value),
  (next, prev) => {
    if (next === prev) return;
    if (next !== verifiedEmail.value) {
      resetEmailVerificationState();
      return;
    }
    emailVerificationError.value = '';
  },
);

const handleSignUp = async () => {
  if (!userName.value || !email.value || !password.value) {
    errorMessage.value = '이름, 이메일, 비밀번호는 필수입니다.';
    return;
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = '비밀번호 확인이 일치하지 않습니다.';
    return;
  }

  if (!isEmailVerified.value || normalizeEmail(email.value) !== verifiedEmail.value) {
    errorMessage.value = '이메일 인증을 완료해주세요.';
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
      userName: userName.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      nickName: nickName.value || null,
      consents: createConsents(),
    });

    openAuthModal();
    router.push('/');
  } catch (error) {
    errorMessage.value = '회원가입에 실패했습니다.';
    console.error('Signup failed:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.v-signup-email-verify-wrap {
  display: grid;
  gap: 8px;
}

.v-signup-email-row,
.v-signup-code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  gap: 8px;
}

.v-signup-email-btn {
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  min-height: 44px;
  padding: 0 8px;
}

.v-signup-email-btn:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
}

.v-signup-email-btn-verify {
  border-color: #93c5fd;
  background: #dbeafe;
}

.v-signup-email-status {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 600;
}

.v-signup-email-status-success {
  color: #16a34a;
}

.v-signup-email-status-error {
  color: #dc2626;
}

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
