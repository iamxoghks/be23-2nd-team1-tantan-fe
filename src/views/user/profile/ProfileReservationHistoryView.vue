<template>
  <div class="screen-rail-slate">
    <NavigationRail />

    <div class="sx-views-user-profile-profilehistoryview-001">
      <div class="v-profile-history-wrap">
        <div class="sx-views-user-profile-profilehistoryview-002">
          <div class="sx-views-community-communityview-016">
            <RouterLink to="/profile" class="v-history-back-btn"><ArrowLeft class="v-icon-18-md20" /></RouterLink>
            <div>
              <h1 class="v-history-title">
                <CalendarDays class="v-history-title-icon" />
                {{ pageTitle }}
              </h1>
              <p class="v-profile-history-subtitle">{{ pageSubtitle }}</p>
            </div>
          </div>
        </div>

        <div class="view-card-sm">
          <div class="sx-views-user-profile-profilehistoryview-003">
            <div class="v-history-search-wrap">
              <Search class="u-icon-left-center" :size="18" />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="짐 이름으로 검색..."
                class="v-history-search-input"
              />
            </div>

            <div class="u-gap-2">
              <label class="v-history-control-btn v-history-date-filter">
                <Calendar :size="18" />
                <input
                  :value="selectedDateInput"
                  type="date"
                  class="v-history-date-input"
                  @input="onDateInput"
                />
              </label>

              <button
                class="v-history-control-btn v-history-control-btn-fluid"
                type="button"
                @click="resetFilters"
              >
                <CalendarDays :size="18" />
                전체 예약 보기
              </button>
            </div>
          </div>

          <div class="v-reservation-filter-row">
            <button
              v-for="filter in statusFilters"
              :key="filter.value"
              type="button"
              class="v-reservation-filter-btn"
              :class="{ 'v-reservation-filter-btn-active': activeFilter === filter.value }"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>

          <div class="u-col-gap-4">
            <div v-if="isLoading" class="v-history-empty-state">
              <div class="v-history-empty-icon-wrap"><Search class="v-icon-28-md32" /></div>
              <div>
                <p class="v-history-empty-title">예약 내역을 불러오는 중...</p>
              </div>
            </div>

            <div v-else-if="errorMessage" class="v-history-empty-state">
              <div class="v-history-empty-icon-wrap"><Search class="v-icon-28-md32" /></div>
              <div>
                <p class="v-history-empty-title">예약 내역 조회 실패</p>
                <p class="v-history-empty-subtitle u-text-error-xs">{{ errorMessage }}</p>
              </div>
            </div>

            <template v-else-if="filteredReservations.length > 0">
              <div
                v-for="reservation in filteredReservations"
                :key="reservation.id"
                class="sx-views-user-profile-profilehistoryview-004 v-history-log-item"
              >
                <div class="sx-views-user-profile-profilehistoryview-005">
                  <div class="u-flex-1-min">
                    <div class="sx-views-user-profile-profilehistoryview-007">
                      <span class="v-profile-history-meta">{{ reservation.date }} {{ reservation.time }}</span>
                      <span
                        class="v-profile-history-duration v-reservation-phase-chip"
                        :class="reservationPhaseClass(reservation)"
                      >
                        {{ reservation.phaseLabel }}
                      </span>
                    </div>
                    <h4 class="sx-views-user-profile-profilehistoryview-008">{{ reservation.gymName }}</h4>

                    <div class="v-history-stat-row">
                      <div class="v-profile-log-stat-chip v-history-stat-chip">
                        <span class="v-profile-log-stat-key">상태</span>
                        <span class="v-history-stat-value">{{ reservation.statusLabel }}</span>
                      </div>
                      <div class="v-profile-log-stat-chip v-history-stat-chip">
                        <span class="v-profile-log-stat-key">기준</span>
                        <span class="v-history-stat-value">{{ reservation.relativeLabel }}</span>
                      </div>
                      <div v-if="reservation.cancelReason" class="v-profile-log-stat-chip v-history-stat-chip">
                        <span class="v-profile-log-stat-key">사유</span>
                        <span class="v-history-stat-value">{{ reservation.cancelReason }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="v-history-empty-state">
              <div class="v-history-empty-icon-wrap"><Search class="v-icon-28-md32" /></div>
              <div>
                <p class="v-history-empty-title">{{ emptyTitle }}</p>
                <p class="v-history-empty-subtitle">{{ emptySubtitle }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, CalendarDays, Search, Calendar } from 'lucide-vue-next';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { reservationApi } from '@/services/apis';
import { extractList, extractPayload } from '@/utils/api';
import { normalizeReservationRecord, sortReservationRecords } from '@/utils/reservationHistory';

const route = useRoute();

const statusFilters = [
  { value: 'all', label: '전체' },
  { value: 'upcoming', label: '예정' },
  { value: 'past', label: '지난 예약' },
  { value: 'cancelled', label: '취소' },
];

const parseDateParam = (value) => {
  const raw = String(value || '').trim();
  if (!raw || raw.toLowerCase() === 'all') return '';
  const sliced = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(sliced) ? sliced : '';
};

const isLoading = ref(false);
const errorMessage = ref('');
const reservations = ref([]);
const searchTerm = ref('');
const activeFilter = ref('all');
const selectedDate = ref(parseDateParam(route.query?.date));

const normalizedDate = computed(() => parseDateParam(selectedDate.value));
const selectedDateInput = computed(() => normalizedDate.value || '');
const pageTitle = computed(() => '예약 내역');
const pageSubtitle = computed(() => '예약한 수업과 슬롯 내역을 확인하세요.');
const emptyTitle = computed(() => (reservations.value.length > 0 ? '조건에 맞는 예약이 없습니다' : '예약 내역이 없습니다'));
const emptySubtitle = computed(() => (
  reservations.value.length > 0
    ? '검색어, 날짜, 필터 조건을 다시 확인해주세요.'
    : '예약한 수업이나 슬롯이 아직 없습니다.'
));

const filteredReservations = computed(() => {
  const keyword = String(searchTerm.value || '').trim().toLowerCase();
  return reservations.value.filter((reservation) => {
    const matchesKeyword = !keyword || String(reservation.gymName || '').toLowerCase().includes(keyword);
    const matchesDate = !normalizedDate.value || reservation.dateKey === normalizedDate.value;
    const matchesFilter = activeFilter.value === 'all' || reservation.phase === activeFilter.value;
    return matchesKeyword && matchesDate && matchesFilter;
  });
});

const reservationPhaseClass = (reservation) => ({
  'v-reservation-phase-chip-upcoming': reservation.phase === 'upcoming',
  'v-reservation-phase-chip-past': reservation.phase === 'past',
  'v-reservation-phase-chip-cancelled': reservation.phase === 'cancelled',
});

const onDateInput = (event) => {
  selectedDate.value = parseDateParam(event?.target?.value);
};

const resetFilters = () => {
  searchTerm.value = '';
  selectedDate.value = '';
  activeFilter.value = 'all';
};

const loadReservations = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await reservationApi.listMine();
    const payload = extractPayload(response, []);
    const list = extractList(payload);
    const now = Date.now();
    reservations.value = sortReservationRecords(
      list.map((item, index) => normalizeReservationRecord(item, index, now)),
      now,
    );
  } catch (error) {
    reservations.value = [];
    const status = Number(error?.response?.status || 0);
    if (status === 401) {
      errorMessage.value = '로그인이 필요합니다.';
    } else if (status >= 500) {
      errorMessage.value = '서버 오류로 예약 내역을 불러오지 못했습니다.';
    } else {
      errorMessage.value = '예약 내역을 불러오지 못했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => route.query?.date,
  (value) => {
    const parsed = parseDateParam(value);
    if (parsed !== selectedDate.value) {
      selectedDate.value = parsed;
    }
  },
);

loadReservations();
</script>

<style scoped>
.v-reservation-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.v-reservation-filter-btn {
  min-height: 38px;
  border: 1px solid #dbe3ef;
  border-radius: 9999px;
  background: #ffffff;
  color: #64748b;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.v-reservation-filter-btn:hover {
  border-color: #bfdbfe;
  color: #1d4ed8;
  background: #eff6ff;
}

.v-reservation-filter-btn-active {
  border-color: #bfdbfe;
  color: #1d4ed8;
  background: #eff6ff;
}

.v-reservation-phase-chip {
  border-radius: 9999px;
  padding: 4px 10px;
}

.v-reservation-phase-chip-upcoming {
  background: #dbeafe;
  color: #1d4ed8;
}

.v-reservation-phase-chip-past {
  background: #f1f5f9;
  color: #475569;
}

.v-reservation-phase-chip-cancelled {
  background: #fee2e2;
  color: #dc2626;
}
</style>
