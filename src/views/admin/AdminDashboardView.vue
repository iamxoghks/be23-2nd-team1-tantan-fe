<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card admin-page">
          <div class="admin-head">
            <div>
              <h1>관리자 대시보드</h1>
              <p>운영 현황과 주요 리스크를 한 번에 확인합니다.</p>
            </div>
            <div class="admin-range">
              <input v-model="range.from" type="date" />
              <span>~</span>
              <input v-model="range.to" type="date" />
              <button class="v-modal-save-btn" @click="loadSummary">조회</button>
            </div>
          </div>

          <div class="admin-kpi-grid">
            <div class="admin-kpi-card">
              <p>전체 사용자</p>
              <strong>{{ summary.totalUsers }}</strong>
            </div>
            <div class="admin-kpi-card">
              <p>전체 짐</p>
              <strong>{{ summary.totalGyms }}</strong>
            </div>
            <div class="admin-kpi-card">
              <p>전체 콘텐츠</p>
              <strong>{{ summary.totalPosts }}</strong>
            </div>
            <div class="admin-kpi-card admin-kpi-danger">
              <p>미처리 신고</p>
              <strong>{{ summary.pendingReports }}</strong>
            </div>
          </div>

          <div class="admin-link-row">
            <RouterLink to="/admin/reports" class="admin-link-card">
              <h2>신고 처리</h2>
              <p>신고 목록을 검토하고 상태를 변경합니다.</p>
            </RouterLink>
            <RouterLink to="/admin/users" class="admin-link-card">
              <h2>사용자 관리</h2>
              <p>사용자 상태(정지/해제)를 관리합니다.</p>
            </RouterLink>
            <RouterLink to="/admin/gyms" class="admin-link-card">
              <h2>짐 관리</h2>
              <p>짐 상태(정지/해제)를 관리합니다.</p>
            </RouterLink>
          </div>

          <div class="admin-section">
            <h2>최근 신고</h2>
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>타입</th>
                    <th>사유</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in recentReports" :key="item.id">
                    <td>{{ item.id }}</td>
                    <td>{{ item.refType }}</td>
                    <td>{{ item.reason }}</td>
                    <td>{{ item.status }}</td>
                  </tr>
                  <tr v-if="recentReports.length === 0">
                    <td colspan="4" class="admin-empty">표시할 신고가 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p v-if="errorMessage" class="admin-error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { adminApi, communityPostApi, gymApi } from '@/services/apis';
import { extractPayload } from '@/utils/api';

const today = new Date();
const monthAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
const toDateInput = (date) => date.toISOString().slice(0, 10);

const range = ref({
  from: toDateInput(monthAgo),
  to: toDateInput(today),
});

const summary = ref({
  totalUsers: 0,
  totalGyms: 0,
  totalPosts: 0,
  pendingReports: 0,
});

const recentReports = ref([]);
const errorMessage = ref('');

const parseList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const loadSummary = async () => {
  errorMessage.value = '';

  try {
    const summaryResponse = await adminApi.dashboardSummary({
      from: range.value.from,
      to: range.value.to,
    });

    const payload = extractPayload(summaryResponse);
    summary.value = {
      totalUsers: Number(payload.totalUsers || payload.userCount || 0),
      totalGyms: Number(payload.totalGyms || payload.gymCount || 0),
      totalPosts: Number(payload.totalPosts || payload.postCount || 0),
      pendingReports: Number(payload.pendingReports || payload.reportPendingCount || 0),
    };
  } catch (error) {
    try {
      const [usersRes, gymsRes, postsRes, reportsRes] = await Promise.allSettled([
        adminApi.listUsers({ page: 0, size: 1 }),
        gymApi.list({}),
        communityPostApi.list({ page: 0, size: 1 }),
        adminApi.listReports({ status: 'PENDING', page: 0, size: 1 }),
      ]);

      const usersPayload = usersRes.status === 'fulfilled' ? extractPayload(usersRes.value) : {};
      const gymsPayload = gymsRes.status === 'fulfilled' ? extractPayload(gymsRes.value) : {};
      const postsPayload = postsRes.status === 'fulfilled' ? extractPayload(postsRes.value) : {};
      const reportsPayload = reportsRes.status === 'fulfilled' ? extractPayload(reportsRes.value) : {};

      summary.value = {
        totalUsers: Number(usersPayload.totalElements || usersPayload.total || parseList(usersPayload).length || 0),
        totalGyms: Number(gymsPayload.totalElements || gymsPayload.total || parseList(gymsPayload).length || 0),
        totalPosts: Number(postsPayload.totalElements || postsPayload.total || parseList(postsPayload).length || 0),
        pendingReports: Number(reportsPayload.totalElements || reportsPayload.total || parseList(reportsPayload).length || 0),
      };
      errorMessage.value = '집계 API를 사용할 수 없어 대체 데이터로 표시합니다.';
    } catch (fallbackError) {
      errorMessage.value = '대시보드 데이터를 불러오지 못했습니다.';
    }
  }

  try {
    const reportsResponse = await adminApi.listReports({ page: 0, size: 5, sort: 'createdTime,desc' });
    const reportsPayload = extractPayload(reportsResponse);
    recentReports.value = parseList(reportsPayload);
  } catch (error) {
    recentReports.value = [];
  }
};

onMounted(loadSummary);
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 16px;
}

.admin-head {
  display: grid;
  gap: 12px;
}

.admin-head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.admin-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.admin-range {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.admin-range input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  background: #ffffff;
}

.admin-range button {
  min-height: 40px;
  padding: 0 14px;
}

.admin-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.admin-kpi-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  padding: 14px;
}

.admin-kpi-card p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.admin-kpi-card strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
  color: #0f172a;
}

.admin-kpi-danger {
  border-color: #fecaca;
  background: #fff7f7;
}

.admin-kpi-danger strong {
  color: #b91c1c;
}

.admin-link-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.admin-link-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  padding: 14px;
  text-decoration: none;
  color: inherit;
}

.admin-link-card h2 {
  margin: 0;
  font-size: 16px;
  color: #0f172a;
}

.admin-link-card p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #64748b;
}

.admin-section h2 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #0f172a;
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

.admin-empty {
  text-align: center;
  color: #94a3b8;
}

.admin-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

@media (min-width: 900px) {
  .admin-kpi-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .admin-link-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
