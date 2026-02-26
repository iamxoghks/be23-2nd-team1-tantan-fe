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
            <h1>신고 처리</h1>
            <div class="admin-filter-row">
              <select v-model="statusFilter" @change="loadReports(0)">
                <option value="">전체</option>
                <option value="PENDING">대기</option>
                <option value="RESOLVED">해결</option>
                <option value="REJECTED">기각</option>
              </select>
            </div>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>타입</th>
                  <th>사유</th>
                  <th>상태</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in reports" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.refType }}</td>
                  <td>{{ item.reason }}</td>
                  <td>{{ item.status }}</td>
                  <td>
                    <div class="admin-action-row">
                      <button class="admin-btn" @click="resolve(item.id, false)">해결</button>
                      <button class="admin-btn admin-btn-warn" @click="resolve(item.id, true)">해결+대상삭제</button>
                      <button class="admin-btn admin-btn-muted" @click="reject(item.id)">기각</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="reports.length === 0">
                  <td colspan="5" class="admin-empty">표시할 신고가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-pagination">
            <button class="admin-btn admin-btn-muted" :disabled="page <= 0" @click="loadReports(page - 1)">이전</button>
            <span>{{ page + 1 }} / {{ totalPages }}</span>
            <button class="admin-btn admin-btn-muted" :disabled="page + 1 >= totalPages" @click="loadReports(page + 1)">다음</button>
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
import { adminApi } from '@/services/apis';
import { extractPayload } from '@/utils/api';

const router = useRouter();
const reports = ref([]);
const statusFilter = ref('PENDING');
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

const loadReports = async (nextPage = 0) => {
  page.value = Math.max(0, nextPage);
  message.value = '';
  errorMessage.value = '';

  try {
    const response = await adminApi.listReports({
      page: page.value,
      size: size.value,
      status: statusFilter.value || undefined,
      sort: 'createdTime,desc',
    });

    const payload = extractPayload(response);
    reports.value = parseList(payload);
    totalPages.value = Number(payload.totalPages || 1);
  } catch (error) {
    reports.value = [];
    totalPages.value = 1;
    errorMessage.value = '신고 목록을 불러오지 못했습니다.';
  }
};

const resolve = async (id, deleteTarget) => {
  try {
    await adminApi.updateReportStatus(id, {
      status: 'RESOLVED',
      deleteTarget,
    });
    message.value = deleteTarget ? '신고를 해결 처리하고 대상을 삭제했습니다.' : '신고를 해결 처리했습니다.';
    await loadReports(page.value);
  } catch (error) {
    errorMessage.value = '신고 해결 처리에 실패했습니다.';
  }
};

const reject = async (id) => {
  try {
    await adminApi.updateReportStatus(id, {
      status: 'REJECTED',
      deleteTarget: false,
    });
    message.value = '신고를 기각 처리했습니다.';
    await loadReports(page.value);
  } catch (error) {
    errorMessage.value = '신고 기각 처리에 실패했습니다.';
  }
};

onMounted(() => {
  loadReports(0);
});
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 14px;
}

.admin-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  vertical-align: top;
}

.admin-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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
  border-color: #ea580c;
  background: #ea580c;
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
</style>
