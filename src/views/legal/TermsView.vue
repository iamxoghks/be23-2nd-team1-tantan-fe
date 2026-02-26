<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card legal-card">
          <div class="legal-head">
            <h1 class="legal-title">이용약관</h1>
            <p class="legal-version">버전 {{ TERMS_VERSION }}</p>
          </div>
          <pre class="legal-content">{{ termsText }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavigationRail from '@/components/sections/NavigationRail.vue';
import termsText from '@/content/legal/terms.v1.md?raw';
import { TERMS_VERSION } from '@/constants/legal';
</script>

<style scoped>
.legal-card {
  display: grid;
  gap: 16px;
}

.legal-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.legal-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.legal-version {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.legal-content {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #334155;
  font-size: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
}
</style>
