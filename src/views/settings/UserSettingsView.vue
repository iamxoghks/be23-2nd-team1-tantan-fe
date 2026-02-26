<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card settings-page">
          <div class="settings-head">
            <h1>일반 유저 설정</h1>
            <p>계정 정보, 보안, 공개 범위를 관리합니다.</p>
          </div>

          <section class="settings-section">
            <h2>계정 정보</h2>
            <div class="settings-grid-2">
              <label class="settings-field">
                <span>이름</span>
                <input v-model="form.userName" type="text" />
              </label>
              <label class="settings-field">
                <span>닉네임</span>
                <input v-model="form.nickName" type="text" />
              </label>
            </div>
            <label class="settings-field">
              <span>이메일</span>
              <input v-model="form.email" type="email" />
            </label>
            <label class="settings-field">
              <span>소개</span>
              <textarea v-model="form.bio" rows="4" />
            </label>
            <button class="v-modal-save-btn settings-action-btn" :disabled="isSavingProfile" @click="saveProfile">
              {{ isSavingProfile ? '저장 중...' : '프로필 저장' }}
            </button>
          </section>

          <section class="settings-section">
            <h2>보안</h2>
            <div class="settings-grid-3">
              <label class="settings-field">
                <span>현재 비밀번호</span>
                <input v-model="passwordForm.currentPassword" type="password" />
              </label>
              <label class="settings-field">
                <span>새 비밀번호</span>
                <input v-model="passwordForm.newPassword" type="password" />
              </label>
              <label class="settings-field">
                <span>새 비밀번호 확인</span>
                <input v-model="passwordForm.newPasswordConfirm" type="password" />
              </label>
            </div>
            <button class="v-modal-save-btn settings-action-btn" :disabled="isSavingPassword" @click="changePassword">
              {{ isSavingPassword ? '변경 중...' : '비밀번호 변경' }}
            </button>
          </section>

          <section class="settings-section">
            <h2>개인정보 공개</h2>
            <label class="settings-toggle-row">
              <div>
                <p class="settings-label">프로필 공개</p>
                <p class="settings-help">다른 사용자에게 내 프로필 노출 여부를 설정합니다.</p>
              </div>
              <input v-model="privacyForm.isPublic" type="checkbox" />
            </label>
            <label class="settings-toggle-row">
              <div>
                <p class="settings-label">활동 통계 공개</p>
                <p class="settings-help">운동 통계 정보 공개 여부를 설정합니다.</p>
              </div>
              <input v-model="privacyForm.showStats" type="checkbox" />
            </label>
            <button class="v-modal-save-btn settings-action-btn" :disabled="isSavingPrivacy" @click="savePrivacy">
              {{ isSavingPrivacy ? '저장 중...' : '공개 설정 저장' }}
            </button>
          </section>

          <section class="settings-section settings-section-danger">
            <h2>계정 관리</h2>
            <p class="settings-help">로그아웃 또는 회원탈퇴를 진행할 수 있습니다.</p>
            <div class="settings-row-gap">
              <button class="v-modal-cancel-btn settings-action-btn" @click="logout">로그아웃</button>
              <button class="settings-danger-btn settings-action-btn" @click="deleteAccount">회원탈퇴</button>
            </div>
          </section>

          <p v-if="message" class="settings-message">{{ message }}</p>
          <p v-if="errorMessage" class="settings-error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { userApi } from '@/services/apis';
import { extractPayload } from '@/utils/api';
import { clearAuthTokens } from '@/services/token';
import { useSession } from '@/composables/useSession';

const router = useRouter();
const { resetSession, syncSessionFromServer } = useSession();

const form = ref({
  userName: '',
  nickName: '',
  email: '',
  bio: '',
});

const privacyForm = ref({
  isPublic: true,
  showStats: true,
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
});

const isSavingProfile = ref(false);
const isSavingPassword = ref(false);
const isSavingPrivacy = ref(false);
const message = ref('');
const errorMessage = ref('');

const loadProfile = async () => {
  try {
    const response = await userApi.profile();
    const payload = extractPayload(response);

    form.value.userName = payload.userName || payload.name || '';
    form.value.nickName = payload.nickName || '';
    form.value.email = payload.email || '';
    form.value.bio = payload.bio || '';
    privacyForm.value.isPublic = typeof payload.isPublic === 'boolean' ? payload.isPublic : true;
    privacyForm.value.showStats = typeof payload.showStats === 'boolean' ? payload.showStats : true;
  } catch (error) {
    errorMessage.value = '프로필을 불러오지 못했습니다.';
  }
};

const saveProfile = async () => {
  isSavingProfile.value = true;
  message.value = '';
  errorMessage.value = '';
  try {
    await userApi.update({
      userName: form.value.userName,
      nickName: form.value.nickName,
      email: form.value.email,
      bio: form.value.bio,
    });
    await syncSessionFromServer({ force: true });
    message.value = '프로필 정보가 저장되었습니다.';
  } catch (error) {
    errorMessage.value = '프로필 저장에 실패했습니다.';
  } finally {
    isSavingProfile.value = false;
  }
};

const savePrivacy = async () => {
  isSavingPrivacy.value = true;
  message.value = '';
  errorMessage.value = '';
  try {
    await userApi.update({
      isPublic: privacyForm.value.isPublic,
      showStats: privacyForm.value.showStats,
    });
    message.value = '공개 설정이 저장되었습니다.';
  } catch (error) {
    errorMessage.value = '공개 설정 저장에 실패했습니다.';
  } finally {
    isSavingPrivacy.value = false;
  }
};

const changePassword = async () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    errorMessage.value = '현재 비밀번호와 새 비밀번호를 입력해주세요.';
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.newPasswordConfirm) {
    errorMessage.value = '새 비밀번호 확인이 일치하지 않습니다.';
    return;
  }

  isSavingPassword.value = true;
  message.value = '';
  errorMessage.value = '';
  try {
    await userApi.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });
    passwordForm.value.currentPassword = '';
    passwordForm.value.newPassword = '';
    passwordForm.value.newPasswordConfirm = '';
    message.value = '비밀번호가 변경되었습니다.';
  } catch (error) {
    errorMessage.value = '비밀번호 변경에 실패했습니다.';
  } finally {
    isSavingPassword.value = false;
  }
};

const logout = async () => {
  try {
    await userApi.logout();
  } catch (error) {
    // ignore logout API failure and continue local logout
  } finally {
    clearAuthTokens();
    resetSession();
    router.push('/');
  }
};

const deleteAccount = async () => {
  if (!window.confirm('정말 회원탈퇴를 진행하시겠습니까?')) return;

  message.value = '';
  errorMessage.value = '';
  try {
    await userApi.delete();
    clearAuthTokens();
    resetSession();
    router.push('/');
  } catch (error) {
    errorMessage.value = '회원탈퇴에 실패했습니다.';
  }
};

onMounted(loadProfile);
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

.settings-section {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  padding: 14px;
  display: grid;
  gap: 10px;
}

.settings-section h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.settings-grid-2,
.settings-grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.settings-field {
  display: grid;
  gap: 6px;
}

.settings-field span {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.settings-field input,
.settings-field textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 12px;
  background: #ffffff;
  font-size: 14px;
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

.settings-row-gap {
  display: grid;
  gap: 8px;
}

.settings-action-btn {
  width: 100%;
  min-height: 48px;
}

.settings-section-danger {
  border-color: #fecaca;
  background: #fff7f7;
}

.settings-danger-btn {
  border: 1px solid #ef4444;
  border-radius: 12px;
  background: #ef4444;
  color: #ffffff;
  font-weight: 700;
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

@media (min-width: 900px) {
  .settings-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .settings-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
