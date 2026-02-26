<template>
  <div />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthModal } from '@/composables/useAuthModal';

const router = useRouter();
const { openAuthModal } = useAuthModal();

onMounted(() => {
  openAuthModal();
  router.replace('/');
});
</script>
