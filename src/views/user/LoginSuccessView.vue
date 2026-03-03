<template>
  <div class="v-login-success">
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { userApi } from '@/services/apis';
import { setAuthTokens } from '@/services/token';
import { useSession } from '@/composables/useSession';

const router = useRouter();
const message = ref('소셜 로그인 처리 중입니다...');
const { syncSessionFromServer } = useSession();

onMounted(async () => {
  try {
    const response = await userApi.oauth2Token();
    const payload = response.data?.data || response.data?.result || response.data || {};
    const accessToken = payload.accessToken || payload.at || payload.token;
    const refreshToken = payload.refreshToken || payload.rt;

    if (!accessToken) {
      throw new Error('No access token');
    }

    setAuthTokens({ accessToken, refreshToken });
    await syncSessionFromServer({ force: true });
    router.replace('/');
  } catch (error) {
    console.error('Social login callback failed:', error);
    message.value = '소셜 로그인 처리에 실패했습니다. 다시 시도해주세요.';
    window.setTimeout(() => {
      router.replace('/login');
    }, 1200);
  }
});
</script>

<style scoped>
.v-login-success {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: #4b5563;
  font-size: 14px;
}
</style>
