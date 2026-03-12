<template>
  <div class="screen-rail-white">
    <NavigationRail />
    <main class="screen-with-rail-main">
      <div
        class="home-panel-shell"
        :class="[
          isSearchPanelCollapsed ? 'home-panel-state-collapsed' : 'home-panel-state-open',
          hasMobileSearchKeyword && !selectedGym ? 'home-panel-mobile-search-results' : '',
          mobileSheetStateClass,
        ]"
      >
        <SearchPanel
          :is-collapsed="isSearchPanelCollapsed"
          :on-toggle="toggleSearchPanel"
          :mobile-sheet-state="mobileSheetState"
          :on-set-mobile-sheet-state="setMobileSheetState"
          :selected-gym="selectedGym"
          :on-close-gym="closeGym"
          :gyms="searchedGyms"
          :on-select-gym="handleSelectGym"
          :favorite-gym-ids="favoriteGymIds"
          :on-toggle-favorite-gym="toggleFavoriteGym"
          :on-arrive-direction="openArriveDirection"
          :on-require-auth="openAuthModal"
          :on-sync-gym="syncGymFromDetail"
        />
      </div>

      <div class="home-map-shell">
        <div class="home-map-mobile-search">
          <form class="home-map-mobile-search-form" @submit.prevent="applyMobileSearch">
            <input
              v-model="mobileSearchInput"
              type="text"
              class="home-map-mobile-search-input"
              placeholder="헬스장 검색"
              aria-label="헬스장 검색"
            />
            <button
              v-if="mobileSearchInput"
              type="button"
              class="home-map-mobile-clear-btn"
              aria-label="검색어 지우기"
              @click="clearMobileSearch"
            >
              <X :size="16" />
            </button>
            <button type="submit" class="home-map-mobile-search-submit" aria-label="검색">
              <Search :size="18" />
            </button>
          </form>
        </div>
        <CategoryPills
          :selected-category-name="selectedCategoryName"
          @select="handleCategorySelect"
        />
        <MapCanvasContainer
          :gyms="mapGyms"
          :selected-gym-id="selectedGymId"
          :on-pin-click="handleSelectGym"
          :favorite-gym-ids="favoriteGymIds"
          :route-path="routePath"
          @map-ready="handleMapReady"
        />
        <div v-if="isRouting" class="home-map-route-summary">
          자동차 경로 계산 중...
        </div>
        <div v-else-if="routeSummary" class="home-map-route-summary">
          자동차 · {{ formatDuration(routeSummary.duration) }} · {{ formatDistance(routeSummary.distance) }}
        </div>
        <MapControlsOverlay
          :map-instance="mapInstance"
          :show-favorites-only="showFavoritesOnlyOnMap"
          @toggle-favorites-only="toggleFavoritesOnlyOnMap"
        />
      </div>
    </main>

    <div
      v-if="isDirectionModalOpen"
      class="home-direction-modal-backdrop"
      role="button"
      tabindex="0"
      aria-label="이동수단 선택 모달 닫기"
      @click="closeDirectionModal"
      @keyup.enter="closeDirectionModal"
    >
      <div class="home-direction-modal" role="dialog" aria-modal="true" @click.stop>
        <p class="home-direction-modal-title">이동수단 선택</p>
        <p class="home-direction-modal-subtitle">{{ directionTargetGym?.name || '목적지' }}까지 어떻게 이동할까요?</p>
        <div class="home-direction-modal-actions">
          <button class="home-direction-option home-direction-option-car" @click="handleDirectionModeSelect('car')">
            자동차
          </button>
          <button class="home-direction-option" @click="handleDirectionModeSelect('walk')">
            도보
          </button>
          <button class="home-direction-option" @click="handleDirectionModeSelect('transit')">
            대중교통
          </button>
        </div>
        <button class="home-direction-modal-cancel" @click="closeDirectionModal">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import SearchPanel from '@/components/sections/SearchPanel.vue';
import MapCanvasContainer from '@/components/sections/MapCanvasContainer.vue';
import MapControlsOverlay from '@/components/sections/MapControlsOverlay.vue';
import CategoryPills from '@/components/sections/CategoryPills.vue';
import { Search, X } from 'lucide-vue-next';
import { gymApi, gymFavoriteApi, mapApi, reviewApi } from '@/services/apis';
import { getAccessToken } from '@/services/token';
import { useAuthModal } from '@/composables/useAuthModal';
import { extractList, extractPayload } from '@/utils/api';

const { openAuthModal } = useAuthModal();
const isSearchPanelCollapsed = ref(false);
const selectedGymId = ref(null);
const mobileSheetState = ref('peek');
const gyms = ref([]);
const mapInstance = ref(null);
const favoriteGymIds = ref([]);
const showFavoritesOnlyOnMap = ref(false);
const mobileSearchInput = ref('');
const appliedSearchQuery = ref('');
const selectedCategoryName = ref('');
const routePath = ref([]);
const routeSummary = ref(null);
const isRouting = ref(false);
const isDirectionModalOpen = ref(false);
const directionTargetGym = ref(null);
const pendingFavoriteGymIds = new Set();
let gymLoadSequence = 0;

const selectedGym = computed(() => gyms.value.find((gym) => gym.id === selectedGymId.value) || null);
const hasMobileSearchKeyword = computed(() => appliedSearchQuery.value.length > 0);
const mobileSheetStateClass = computed(() => {
  if (mobileSheetState.value === 'full') return 'home-panel-vertical-open';
  if (mobileSheetState.value === 'hidden') return 'home-panel-vertical-hidden';
  return 'home-panel-vertical-peek';
});

const filterGymsByKeyword = (sourceGyms, keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return sourceGyms;

  return sourceGyms.filter((gym) => {
    const haystack = [gym.name, gym.address, gym.location, gym.category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedKeyword);
  });
};

const toGymLatLng = (gym) => {
  const lat = Number(gym?.latitude ?? gym?.lat ?? gym?.y);
  const lng = Number(gym?.longitude ?? gym?.lng ?? gym?.x);

  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return { lat, lng };
  }

  return null;
};

const encodePathSegment = (value) => encodeURIComponent(String(value ?? '').trim());

const openNaverDirection = ({ startLng, startLat, goalLng, goalLat, goalName, mode = 'transit' }) => {
  const start = `${startLng},${startLat}`;
  const goal = `${goalLng},${goalLat},${encodePathSegment(goalName || '목적지')}`;
  const routeMode = ['car', 'walk', 'transit'].includes(mode) ? mode : 'transit';
  return `https://map.naver.com/v5/directions/${start}/${goal}/-/${routeMode}?c=${goalLng},${goalLat},15,0,0,0,dh`;
};

const extractDrivingRoute = (rawResponse) => {
  const payload = rawResponse?.data?.data || rawResponse?.data?.result || rawResponse?.data || rawResponse;
  const route = payload?.route || payload?.data?.route || null;
  if (!route || typeof route !== 'object') return null;

  const priorityKeys = ['trafast', 'traoptimal', 'tracomfort', 'traavoidtoll', 'traavoidcaronly'];
  let selected = null;

  priorityKeys.some((key) => {
    const candidate = route[key];
    if (Array.isArray(candidate) && candidate.length > 0) {
      selected = candidate[0];
      return true;
    }
    return false;
  });

  if (!selected) {
    const firstAvailable = Object.values(route).find((value) => Array.isArray(value) && value.length > 0);
    selected = firstAvailable?.[0] || null;
  }
  if (!selected) return null;

  const path = Array.isArray(selected.path)
    ? selected.path
      .map((point) => {
        const lng = Number(point?.[0]);
        const lat = Number(point?.[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng };
      })
      .filter(Boolean)
    : [];

  if (path.length < 2) return null;

  return {
    path,
    summary: {
      distance: Number(selected.summary?.distance || 0),
      duration: Number(selected.summary?.duration || 0),
    },
  };
};

const requestDrivingRoute = async ({ startLng, startLat, goalLng, goalLat }) => {
  const response = await mapApi.drivingRoute({
    start: `${startLng},${startLat}`,
    goal: `${goalLng},${goalLat}`,
    option: 'trafast',
    cartype: 1,
  });
  return extractDrivingRoute(response);
};

const formatDistance = (distance) => {
  const value = Number(distance || 0);
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}km`;
  }
  return `${Math.round(value)}m`;
};

const formatDuration = (duration) => {
  const totalMinutes = Math.max(1, Math.round(Number(duration || 0) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
};

const closeDirectionModal = () => {
  isDirectionModalOpen.value = false;
  directionTargetGym.value = null;
};

const drawCarRoute = (gym) => {
  const destination = toGymLatLng(gym);
  if (!destination) {
    window.alert('이 체육관의 위치 정보가 없어 길찾기를 시작할 수 없습니다.');
    return;
  }

  if (!navigator.geolocation) {
    window.alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      isRouting.value = true;
      routeSummary.value = null;
      routePath.value = [];
      try {
        const result = await requestDrivingRoute({
          startLng: coords.longitude,
          startLat: coords.latitude,
          goalLng: destination.lng,
          goalLat: destination.lat,
        });

        if (!result) {
          throw new Error('No driving route returned');
        }

        routePath.value = result.path;
        routeSummary.value = result.summary;
      } catch (error) {
        console.error('Failed to fetch internal driving route:', error);
        const url = openNaverDirection({
          startLng: coords.longitude,
          startLat: coords.latitude,
          goalLng: destination.lng,
          goalLat: destination.lat,
          goalName: gym?.name,
          mode: 'car',
        });
        window.open(url, '_blank', 'noopener,noreferrer');
        window.alert('내부 자동차 경로를 불러오지 못해 네이버 지도 길찾기를 대신 열었습니다.');
      } finally {
        isRouting.value = false;
      }
    },
    () => {
      window.alert('현재 위치를 가져올 수 없습니다. 브라우저 위치 권한을 확인해주세요.');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
};

const openExternalNaverDirection = (gym, mode) => {
  const destination = toGymLatLng(gym);
  if (!destination) {
    window.alert('이 체육관의 위치 정보가 없어 길찾기를 시작할 수 없습니다.');
    return;
  }
  if (!navigator.geolocation) {
    window.alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const url = openNaverDirection({
        startLng: coords.longitude,
        startLat: coords.latitude,
        goalLng: destination.lng,
        goalLat: destination.lat,
        goalName: gym?.name,
        mode,
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    () => {
      window.alert('현재 위치를 가져올 수 없습니다. 브라우저 위치 권한을 확인해주세요.');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
};

const handleDirectionModeSelect = (mode) => {
  const gym = directionTargetGym.value;
  closeDirectionModal();
  if (!gym) return;

  if (mode === 'car') {
    drawCarRoute(gym);
    return;
  }

  routePath.value = [];
  routeSummary.value = null;
  isRouting.value = false;
  openExternalNaverDirection(gym, mode);
};

const openArriveDirection = (gym) => {
  if (!gym) return;
  directionTargetGym.value = gym;
  isDirectionModalOpen.value = true;
};

const searchedGyms = computed(() => {
  return filterGymsByKeyword(gyms.value, appliedSearchQuery.value);
});

const mapGyms = computed(() => {
  if (!showFavoritesOnlyOnMap.value) return searchedGyms.value;
  return searchedGyms.value.filter((gym) => favoriteGymIds.value.includes(gym.id));
});

const toggleSearchPanel = () => {
  isSearchPanelCollapsed.value = !isSearchPanelCollapsed.value;
};

const closeGym = () => {
  selectedGymId.value = null;
  mobileSheetState.value = 'hidden';
  routePath.value = [];
  routeSummary.value = null;
  isRouting.value = false;
};

const handleSelectGym = (id) => {
  selectedGymId.value = id;
  mobileSheetState.value = 'full';
  routePath.value = [];
  routeSummary.value = null;
  isRouting.value = false;
  if (id && isSearchPanelCollapsed.value) {
    isSearchPanelCollapsed.value = false;
  }
};

const handleMapReady = (map) => {
  mapInstance.value = map;
};

const applyMobileSearch = () => {
  appliedSearchQuery.value = mobileSearchInput.value.trim();
  const nextGyms = filterGymsByKeyword(gyms.value, appliedSearchQuery.value);
  selectedGymId.value = null;
  isSearchPanelCollapsed.value = false;
  if (appliedSearchQuery.value.length > 0) {
    mobileSheetState.value = 'full';
    return;
  }
  if (nextGyms.length > 0) {
    mobileSheetState.value = 'peek';
  }
};

const clearMobileSearch = () => {
  mobileSearchInput.value = '';
  appliedSearchQuery.value = '';
  selectedGymId.value = null;
  mobileSheetState.value = 'peek';
};

const setMobileSheetState = (nextState) => {
  if (!['full', 'peek', 'hidden'].includes(nextState)) return;
  mobileSheetState.value = nextState;
};

const resetSelectedGymContext = () => {
  selectedGymId.value = null;
  routePath.value = [];
  routeSummary.value = null;
  isRouting.value = false;
};

const handleCategorySelect = async (category) => {
  const clickedCategoryName = String(category?.name || '').trim();
  const nextCategoryName = selectedCategoryName.value === clickedCategoryName ? '' : clickedCategoryName;

  selectedCategoryName.value = nextCategoryName;
  resetSelectedGymContext();

  if (mobileSheetState.value === 'hidden') {
    mobileSheetState.value = 'peek';
  }

  await loadGyms(nextCategoryName ? { category: nextCategoryName } : {});
};

const toggleFavoriteGym = async (id) => {
  if (!id) return;
  if (!getAccessToken()) {
    openAuthModal();
    return;
  }

  const normalizedId = String(id);
  if (pendingFavoriteGymIds.has(normalizedId)) return;
  const isFavorite = favoriteGymIds.value.includes(normalizedId);
  pendingFavoriteGymIds.add(normalizedId);

  try {
    if (isFavorite) {
      await gymFavoriteApi.remove(normalizedId);
      favoriteGymIds.value = favoriteGymIds.value.filter((gymId) => gymId !== normalizedId);
    } else {
      await gymFavoriteApi.add(normalizedId);
      favoriteGymIds.value = [...favoriteGymIds.value, normalizedId];
    }
  } catch (error) {
    console.error('Failed to toggle favorite gym:', error);
  } finally {
    pendingFavoriteGymIds.delete(normalizedId);
  }
};

const toggleFavoritesOnlyOnMap = () => {
  if (!getAccessToken()) {
    openAuthModal();
    return;
  }
  showFavoritesOnlyOnMap.value = !showFavoritesOnlyOnMap.value;
};


const normalizeGym = (gym) => ({
  ...gym,
  id: String(gym.id),
  iconType: gym.iconType || 'default',
  color: gym.color || '#1a1a1a',
});

const syncGymFromDetail = (detail, requestId = gymLoadSequence) => {
  if (requestId !== gymLoadSequence) return;

  const targetId = String(detail?.id ?? detail?.gymId ?? '').trim();
  if (!targetId) return;

  const imageList = Array.isArray(detail?.images) ? detail.images : [];
  const firstImage = imageList.find((item) => {
    if (typeof item === 'string') return Boolean(item);
    return Boolean(item?.imageUrl || item?.url || item?.path || item?.src);
  });
  const imageUrl = typeof firstImage === 'string'
    ? firstImage
    : firstImage?.imageUrl || firstImage?.url || firstImage?.path || firstImage?.src || '';

  gyms.value = gyms.value.map((gym) => {
    if (String(gym.id) !== targetId) return gym;
    return {
      ...gym,
      name: detail?.name ?? gym.name,
      about: detail?.description ?? gym.about,
      address: detail?.address ?? gym.address,
      location: detail?.location ?? detail?.address ?? gym.location,
      phone: detail?.tel ?? gym.phone,
      type: detail?.categoryName ?? detail?.category ?? gym.type,
      category: detail?.categoryName ?? detail?.category ?? gym.category,
      rating: Number(detail?.rating ?? detail?.avgRating ?? gym.rating ?? 0),
      reviews: Number(detail?.reviewCount ?? detail?.reviewCnt ?? detail?.reviews ?? gym.reviews ?? 0),
      image: imageUrl || gym.image,
      images: imageList.length > 0 ? imageList : (gym.images || []),
    };
  });
};

const refreshGymSummariesFromDetails = async (requestId) => {
  if (requestId !== gymLoadSequence) return;

  const gymIds = gyms.value
    .map((gym) => String(gym.id || '').trim())
    .filter(Boolean)
    .slice(0, 30);

  if (gymIds.length === 0) return;

  await Promise.allSettled(gymIds.map(async (gymId) => {
    try {
      const response = await gymApi.detail(gymId);
      const payload = response.data?.data || response.data?.result || response.data;
      if (payload && requestId === gymLoadSequence) {
        syncGymFromDetail(payload, requestId);
      }
    } catch (error) {
      // keep list data as-is when one detail request fails
    }
  }));
};

const refreshGymReviewStatsFromReviews = async (requestId) => {
  if (requestId !== gymLoadSequence) return;

  const targetGymIds = new Set(
    gyms.value
      .map((gym) => String(gym.id || '').trim())
      .filter(Boolean),
  );
  if (targetGymIds.size === 0) return;

  const statsByGymId = new Map();
  const pageSize = 100;
  const maxPages = 50;
  let page = 0;
  let totalPages = null;

  while (page < maxPages) {
    if (requestId !== gymLoadSequence) return;

    let list = [];

    try {
      const response = await reviewApi.listPage({ page, size: pageSize });
      const payload = extractPayload(response, {});
      list = extractList(payload);
      const parsedTotalPages = Number(payload?.totalPages);
      if (Number.isFinite(parsedTotalPages) && parsedTotalPages > 0) {
        totalPages = parsedTotalPages;
      }
    } catch (error) {
      break;
    }

    if (list.length === 0) break;

    list.forEach((item) => {
      const gymId = String(item?.gymId ?? item?.gym?.id ?? '').trim();
      if (!gymId || !targetGymIds.has(gymId)) return;

      const current = statsByGymId.get(gymId) || { sum: 0, count: 0 };
      const rating = Number(item?.rating || 0);
      statsByGymId.set(gymId, {
        sum: current.sum + (Number.isFinite(rating) ? rating : 0),
        count: current.count + 1,
      });
    });

    if (totalPages != null && page >= totalPages - 1) break;
    if (list.length < pageSize) break;
    page += 1;
  }

  if (statsByGymId.size === 0) return;
  if (requestId !== gymLoadSequence) return;

  gyms.value = gyms.value.map((gym) => {
    const gymId = String(gym.id || '').trim();
    const stat = statsByGymId.get(gymId);
    if (!stat || stat.count <= 0) return gym;
    return {
      ...gym,
      rating: stat.sum / stat.count,
      reviews: stat.count,
    };
  });
};

const loadGyms = async (params = {}) => {
  const requestId = ++gymLoadSequence;

  try {
    const response = await gymApi.list(params);
    const list = response.data?.data || response.data?.result || response.data;
    if (requestId !== gymLoadSequence) return;

    gyms.value = (Array.isArray(list) ? list : []).map((gym) => normalizeGym(gym));

    if (selectedGymId.value && !gyms.value.some((gym) => gym.id === selectedGymId.value)) {
      resetSelectedGymContext();
    }

    await refreshGymSummariesFromDetails(requestId);
    if (requestId !== gymLoadSequence) return;

    await refreshGymReviewStatsFromReviews(requestId);
  } catch (error) {
    console.error('Failed to load gyms:', error);
  }
};

const loadFavoriteGyms = async () => {
  if (!getAccessToken()) return;

  try {
    const response = await gymFavoriteApi.list();
    const payload = response.data?.data || response.data?.result || response.data;
    const list = Array.isArray(payload) ? payload : [];
    favoriteGymIds.value = list
      .map((item) => String(item?.gymId ?? item?.id ?? item ?? '').trim())
      .filter(Boolean);
  } catch (error) {
    console.error('Failed to load favorite gyms:', error);
  }
};

onMounted(async () => {
  await loadGyms();
  await loadFavoriteGyms();
});
</script>
