<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card admin-page">
          <button class="admin-back-btn" @click="goBackToAdmin">
            ← 관리자 대시보드
          </button>

          <div class="admin-head">
            <h1>짐 관리</h1>
            <div class="admin-filter-row">
              <input v-model="keyword" type="text" placeholder="짐 이름/주소 검색" @keydown.enter="loadGyms(0)" />
              <select v-model="statusFilter" @change="loadGyms(0)">
                <option value="">상태 전체</option>
                <option value="ACTIVE">정상</option>
                <option value="SUSPENDED">정지</option>
              </select>
              <button class="admin-btn" @click="loadGyms(0)">검색</button>
            </div>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>짐 이름</th>
                  <th>주소</th>
                  <th>상태</th>
                  <th>조치</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in gyms" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name || '-' }}</td>
                  <td>{{ item.address || '-' }}</td>
                  <td>{{ formatStatus(item) }}</td>
                  <td>
                    <button class="admin-btn admin-btn-muted" @click="goGymDetail(item.id)">상세보기</button>
                  </td>
                </tr>
                <tr v-if="gyms.length === 0">
                  <td colspan="5" class="admin-empty">표시할 짐이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-pagination">
            <button class="admin-btn admin-btn-muted" :disabled="page <= 0" @click="loadGyms(page - 1)">이전</button>
            <span>{{ page + 1 }} / {{ totalPages }}</span>
            <button class="admin-btn admin-btn-muted" :disabled="page + 1 >= totalPages" @click="loadGyms(page + 1)">다음</button>
          </div>

          <p v-if="message" class="admin-message">{{ message }}</p>
          <p v-if="errorMessage" class="admin-error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { adminApi, gymApi } from '@/services/apis';
import { extractPayload } from '@/utils/api';

const router = useRouter();
const gyms = ref([]);
const keyword = ref('');
const statusFilter = ref('');
const page = ref(0);
const size = ref(20);
const totalPages = ref(1);
const message = ref('');
const errorMessage = ref('');

const parseList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const goBackToAdmin = () => {
  router.push('/admin');
};

const goGymDetail = (id) => {
  router.push(`/admin/gyms/${id}`);
};

const isSuspended = (item) => (
  Boolean(item?.suspended)
  || String(item?.status || '').toUpperCase() === 'SUSPENDED'
);

const formatStatus = (item) => (isSuspended(item) ? '정지' : '정상');

const loadGyms = async (nextPage = 0) => {
  page.value = Math.max(0, nextPage);
  message.value = '';
  errorMessage.value = '';

  try {
    const response = await adminApi.listGyms({
      page: page.value,
      size: size.value,
      q: keyword.value || undefined,
      status: statusFilter.value || undefined,
      sort: 'id,desc',
    });
    const payload = extractPayload(response);
    gyms.value = parseList(payload);
    totalPages.value = Number(payload.totalPages || 1);
  } catch (error) {
    try {
      const fallback = await gymApi.list({ name: keyword.value || undefined });
      const payload = extractPayload(fallback);
      gyms.value = parseList(payload);
      totalPages.value = 1;
      errorMessage.value = 'admin 짐 API가 없어 일반 짐 목록으로 대체 표시합니다.';
    } catch (fallbackError) {
      gyms.value = [];
      totalPages.value = 1;
      errorMessage.value = '짐 목록을 불러오지 못했습니다.';
    }
  }
};

onMounted(() => {
  loadGyms(0);
});
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 14px;
}

.admin-head {
  display: grid;
  gap: 10px;
}

.admin-back-btn {
  min-height: 44px;
  width: fit-content;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  padding: 0 14px;
}

.admin-head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.admin-filter-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.admin-filter-row input,
.admin-filter-row select {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  padding: 8px 10px;
  font-size: 13px;
}

.admin-table-wrap {
  overflow: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  padding: 10px 8px;
  font-size: 13px;
}

.admin-btn {
  min-height: 34px;
  border-radius: 8px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 0 10px;
}

.admin-btn-warn {
  border-color: #ef4444;
  background: #ef4444;
}

.admin-btn-muted {
  border-color: #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.admin-empty {
  text-align: center;
  color: #94a3b8;
}

.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.admin-message {
  margin: 0;
  font-size: 13px;
  color: #166534;
}

.admin-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

@media (min-width: 900px) {
  .admin-filter-row {
    grid-template-columns: 1fr 180px auto;
  }
}
</style>
