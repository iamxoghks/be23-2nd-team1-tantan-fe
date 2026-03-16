<template>
  <div class="screen-rail-slate">
    <NavigationRail />

    <div class="sx-views-user-profile-profilehistoryview-001">
      <div class="v-profile-history-wrap">
        <div class="sx-views-user-profile-profilehistoryview-002">
          <div class="sx-views-community-communityview-016">
            <RouterLink :to="profileRouteLink" class="v-history-back-btn"><ArrowLeft class="v-icon-18-md20" /></RouterLink>
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
                placeholder="운동 명칭이나 태그로 검색..."
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
                @click="setAllMode"
              >
                <CalendarDays :size="18" />
                전체 기록 보기
              </button>
            </div>
          </div>

          <div class="u-col-gap-4">
            <div v-if="isLoading && workouts.length === 0" class="v-history-empty-state">
              <div class="v-history-empty-icon-wrap"><Search class="v-icon-28-md32" /></div>
              <div>
                <p class="v-history-empty-title">운동 기록을 불러오는 중...</p>
              </div>
            </div>

            <div v-else-if="errorMessage" class="v-history-empty-state">
              <div class="v-history-empty-icon-wrap"><Search class="v-icon-28-md32" /></div>
              <div>
                <p class="v-history-empty-title">운동 기록 조회 실패</p>
                <p class="v-history-empty-subtitle u-text-error-xs">{{ errorMessage }}</p>
              </div>
            </div>

            <template v-else-if="filteredWorkouts.length > 0">
              <div
                v-for="workout in filteredWorkouts"
                :key="workout.id"
                class="sx-views-user-profile-profilehistoryview-004 v-history-log-item"
              >
                <div class="sx-views-user-profile-profilehistoryview-005">
                  <div class="u-flex-1-min">
                    <div class="sx-views-user-profile-profilehistoryview-007">
                      <span class="v-profile-history-meta">{{ workout.date }} {{ workout.time }}</span>
                      <span class="v-profile-history-duration">{{ workout.duration || 'Daily' }}</span>
                    </div>
                    <h4 class="sx-views-user-profile-profilehistoryview-008">{{ workout.title }}</h4>
                    <div v-if="workout.exercises && workout.exercises.length > 0" class="v-history-exercise-list">
                      <div
                        v-for="(exercise, exerciseIndex) in workout.exercises"
                        :key="`${workout.id}-${exerciseIndex}-${exercise.name}`"
                        class="v-history-exercise-item"
                      >
                        <span class="v-history-exercise-name">{{ exercise.name }}</span>
                        <span class="v-history-exercise-stats">{{ exercise.stats }}</span>
                      </div>
                    </div>

                    <div class="v-history-stat-row">
                      <div
                        v-for="([key, val]) in Object.entries(workout.stats || {})"
                        :key="key"
                        class="v-profile-log-stat-chip v-history-stat-chip"
                      >
                        <span class="v-profile-log-stat-key">{{ key }}</span>
                        <span class="v-history-stat-value">{{ val }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  v-if="isOwnWorkoutHistory"
                  type="button"
                  class="v-history-delete-btn v-history-delete-btn-align v-day-history-delete-btn"
                  :disabled="isDeletingWorkout(workout.id)"
                  @click="deleteWorkout(workout.id)"
                >
                  <Trash2 class="v-icon-18-md20" />
                </button>
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

        <div v-if="isAllMode" class="v-history-load-more-wrap">
          <button
            v-if="hasNextPage"
            class="v-history-load-more-btn"
            type="button"
            :disabled="isLoading || isLoadingMore"
            @click="loadNextPage"
          >
            {{ isLoadingMore ? '이전 기록 불러오는 중...' : '이전 기록 더 불러오기' }}
          </button>
          <p v-else-if="workouts.length > 0" class="v-history-end-label">
            모든 기록을 불러왔습니다.
          </p>
          <div
            v-show="hasNextPage && !isLoading && !isLoadingMore"
            ref="infiniteSentinelRef"
            class="v-history-infinite-sentinel"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, CalendarDays, Search, Calendar, Trash2 } from 'lucide-vue-next';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { workoutApi } from '@/services/apis';
import { useSession } from '@/composables/useSession';
import { buildWorkoutTags, buildWorkoutTitle, extractWorkoutExercises } from '@/utils/workoutDisplay';

const PAGE_SIZE = 20;

const route = useRoute();
const { sessionProfile, primeSessionFromToken } = useSession();

const isLoading = ref(false);
const isLoadingMore = ref(false);
const errorMessage = ref('');
const workouts = ref([]);
const deletingWorkoutIds = ref(new Set());
const searchTerm = ref('');
const currentPage = ref(-1);
const hasNextPage = ref(false);
const infiniteSentinelRef = ref(null);

let infiniteObserver = null;

const parseDateParam = (value) => {
  const raw = String(value || '').trim();
  if (!raw || raw.toLowerCase() === 'all') return '';
  const sliced = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(sliced) ? sliced : '';
};

const selectedDate = ref(parseDateParam(route.query?.date));
const routeTargetUserId = computed(() => {
  const raw = String(route.query?.userId || '').trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});
const currentUserId = computed(() => {
  const raw = Number(sessionProfile.value?.id ?? 0);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
});
const isOwnWorkoutHistory = computed(() => {
  if (!routeTargetUserId.value) return true;
  if (!currentUserId.value) return false;
  return Number(routeTargetUserId.value) === Number(currentUserId.value);
});
const profileRouteLink = computed(() => ({
  path: '/profile',
  query: routeTargetUserId.value ? { userId: String(routeTargetUserId.value) } : undefined,
}));

const isAllMode = computed(() => !selectedDate.value);
const normalizedDate = computed(() => parseDateParam(selectedDate.value));

const dateTitle = computed(() => (
  normalizedDate.value
    ? normalizedDate.value.replaceAll('-', '. ')
    : ''
));
const pageTitle = computed(() => '운동 기록');
const pageSubtitle = computed(() => '운동 내역을 확인하고 관리하세요.');
const emptyTitle = computed(() => (isAllMode.value ? '운동 기록이 없습니다' : '해당 날짜 운동 기록이 없습니다'));
const emptySubtitle = computed(() => (
  isAllMode.value
    ? '등록된 운동 내역이 없습니다.'
    : '선택한 날짜에 등록된 운동 내역이 없습니다.'
));
const selectedDateInput = computed(() => (isAllMode.value ? '' : normalizedDate.value));

const filteredWorkouts = computed(() => {
  const keyword = String(searchTerm.value || '').trim().toLowerCase();
  if (!keyword) return workouts.value;
  return workouts.value.filter((item) => (
    String(item.title || '').toLowerCase().includes(keyword)
    || String(item.tags || '').toLowerCase().includes(keyword)
  ));
});

const isDeletingWorkout = (id) => deletingWorkoutIds.value.has(String(id));

const formatDate = (value) => {
  if (!value) {
    if (normalizedDate.value) {
      return normalizedDate.value.replaceAll('-', '.');
    }
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const extractListPayload = (raw = {}) => {
  const payload = raw?.data ?? raw?.result ?? raw;
  if (Array.isArray(payload?.content)) {
    const number = Number(payload?.number ?? 0);
    const totalPages = Number(payload?.totalPages ?? 1);
    const hasTotalPages = Number.isFinite(totalPages) && totalPages > 0;
    const lastByPage = hasTotalPages ? number + 1 >= totalPages : undefined;
    const last = typeof payload?.last === 'boolean' ? payload.last : Boolean(lastByPage);
    return {
      items: payload.content,
      number,
      totalPages: hasTotalPages ? totalPages : 1,
      last,
    };
  }
  if (Array.isArray(payload?.items)) {
    return { items: payload.items, number: 0, totalPages: 1, last: true };
  }
  if (Array.isArray(payload?.list)) {
    return { items: payload.list, number: 0, totalPages: 1, last: true };
  }
  if (Array.isArray(payload)) {
    return { items: payload, number: 0, totalPages: 1, last: true };
  }
  return { items: [], number: 0, totalPages: 1, last: true };
};

const normalizeWorkout = (item, index) => {
  const exercises = extractWorkoutExercises(item);
  const hasExerciseValues = exercises.some((exercise) => exercise.hasWeight || exercise.hasSets || exercise.hasReps);
  const totalWeight = exercises.reduce((sum, exercise) => sum + Number(exercise?.weight ?? 0), 0);
  const totalSets = exercises.reduce((sum, exercise) => sum + Number(exercise?.sets ?? 0), 0);
  const fallbackWeight = Number(item?.totalVolume ?? item?.totalWeight ?? item?.weight ?? 0);
  const fallbackSets = Number(item?.totalSets ?? item?.setCount ?? item?.sets ?? 0);
  const fallbackTitle = item?.workoutCondition || item?.title || item?.name || `운동 기록 ${index + 1}`;

  return {
    id: item?.workoutId ?? item?.id ?? `workout-${index + 1}`,
    title: buildWorkoutTitle(exercises, fallbackTitle),
    time: formatTime(item?.workoutDate || item?.createdAt || item?.createdTime),
    date: formatDate(item?.workoutDate || item?.createdAt || item?.createdTime),
    duration: 'Daily',
    tags: buildWorkoutTags(exercises),
    exercises,
    stats: {
      볼륨: `${Number(hasExerciseValues ? totalWeight : fallbackWeight || 0).toLocaleString()}kg`,
      세트: Number(hasExerciseValues ? totalSets : fallbackSets || 0),
      종목: exercises.length,
    },
    bgColor: '#dbeafe',
    fgColor: '#2563eb',
  };
};

const setAllMode = () => {
  if (!selectedDate.value) {
    loadWorkouts({ reset: true });
    return;
  }
  selectedDate.value = '';
};

const onDateInput = (event) => {
  selectedDate.value = parseDateParam(event?.target?.value);
};

const disconnectInfiniteObserver = () => {
  if (!infiniteObserver) return;
  infiniteObserver.disconnect();
  infiniteObserver = null;
};

const loadNextPage = async () => {
  await loadWorkouts({ reset: false });
};

const deleteWorkout = async (workoutId) => {
  const normalizedId = Number(workoutId);
  if (!Number.isFinite(normalizedId) || normalizedId <= 0) return;
  if (isDeletingWorkout(normalizedId)) return;
  if (!window.confirm('이 운동 기록을 삭제하시겠습니까?')) return;

  const key = String(normalizedId);
  deletingWorkoutIds.value.add(key);
  try {
    await workoutApi.delete(normalizedId);
    workouts.value = workouts.value.filter((workout) => Number(workout.id) !== normalizedId);
  } catch (error) {
    window.alert('운동 기록 삭제에 실패했습니다.');
  } finally {
    deletingWorkoutIds.value.delete(key);
  }
};

const refreshInfiniteObserver = () => {
  disconnectInfiniteObserver();
  if (!isAllMode.value || !hasNextPage.value || !infiniteSentinelRef.value) return;

  infiniteObserver = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;
      if (isLoading.value || isLoadingMore.value || !hasNextPage.value || !isAllMode.value) return;
      loadNextPage();
    },
    {
      root: null,
      rootMargin: '200px 0px',
      threshold: 0,
    },
  );

  infiniteObserver.observe(infiniteSentinelRef.value);
};

const loadWorkouts = async ({ reset } = { reset: false }) => {
  const shouldReset = Boolean(reset);

  if (!isAllMode.value && !normalizedDate.value) {
    errorMessage.value = '잘못된 날짜 형식입니다.';
    workouts.value = [];
    currentPage.value = -1;
    hasNextPage.value = false;
    return;
  }

  if (!shouldReset) {
    if (!hasNextPage.value || isLoading.value || isLoadingMore.value) return;
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
    errorMessage.value = '';
    workouts.value = [];
    currentPage.value = -1;
    hasNextPage.value = false;
  }

  const targetPage = shouldReset ? 0 : currentPage.value + 1;
  const requestedUserId = routeTargetUserId.value ? Number(routeTargetUserId.value) : null;

  try {
    const response = isAllMode.value
      ? await workoutApi.list({
        page: targetPage,
        size: PAGE_SIZE,
        sort: 'workoutDate,desc',
        ...(requestedUserId ? { userId: requestedUserId } : {}),
      })
      : await workoutApi.day(normalizedDate.value, {
        page: targetPage,
        size: PAGE_SIZE,
        sort: 'workoutDate,desc',
        ...(requestedUserId ? { userId: requestedUserId } : {}),
      });

    const {
      items,
      number,
      totalPages,
      last,
    } = extractListPayload(response?.data);

    const mapped = items.map((item, index) => normalizeWorkout(item, index + (targetPage * PAGE_SIZE)));
    workouts.value = shouldReset ? mapped : [...workouts.value, ...mapped];

    currentPage.value = Number.isFinite(number) ? number : targetPage;
    const hasMore = !Boolean(last) && currentPage.value + 1 < Number(totalPages || 1);
    hasNextPage.value = isAllMode.value ? hasMore : false;
  } catch (error) {
    if (shouldReset) {
      workouts.value = [];
    }

    const status = Number(error?.response?.status || 0);
    if (status === 401) {
      errorMessage.value = '로그인이 필요합니다.';
    } else if (status >= 500) {
      errorMessage.value = '서버 오류로 운동 기록을 불러오지 못했습니다.';
    } else {
      errorMessage.value = '운동 기록을 불러오지 못했습니다.';
    }
    hasNextPage.value = false;
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
    nextTick(refreshInfiniteObserver);
  }
};

watch(
  [isAllMode, hasNextPage],
  () => {
    nextTick(refreshInfiniteObserver);
  },
);

watch(
  () => selectedDate.value,
  () => {
    loadWorkouts({ reset: true });
  },
  { immediate: true },
);

watch(
  () => route.query?.date,
  (value) => {
    const parsed = parseDateParam(value);
    if (parsed !== selectedDate.value) {
      selectedDate.value = parsed;
    }
  },
);

watch(
  () => route.query?.userId,
  () => {
    loadWorkouts({ reset: true });
  },
);

onBeforeUnmount(() => {
  disconnectInfiniteObserver();
});

primeSessionFromToken();
</script>
