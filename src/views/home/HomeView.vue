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
          :search-keyword="appliedSearchQuery"
          :on-search-gyms="handleDesktopSearch"
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
          @current-location-selected="handleCurrentLocationSelected"
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import SearchPanel from '@/components/sections/SearchPanel.vue';
import MapCanvasContainer from '@/components/sections/MapCanvasContainer.vue';
import MapControlsOverlay from '@/components/sections/MapControlsOverlay.vue';
import CategoryPills from '@/components/sections/CategoryPills.vue';
import { Search, X } from 'lucide-vue-next';
import { gymApi, gymFavoriteApi, mapApi } from '@/services/apis';
import { getAccessToken } from '@/services/token';
import { useAuthModal } from '@/composables/useAuthModal';
import { getPrimaryThumbnailImageUrl, toImageVariantItems } from '@/utils/imageVariants';

const { openAuthModal } = useAuthModal();
const route = useRoute();
const router = useRouter();
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
const nearbyModeEnabled = ref(false);
const routePath = ref([]);
const routeSummary = ref(null);
const isRouting = ref(false);
const isDirectionModalOpen = ref(false);
const directionTargetGym = ref(null);
const pendingFavoriteGymIds = new Set();
const mapIdleDebounceMs = 250;
const gymListPageSize = 1000;
let gymLoadSequence = 0;
let mapIdleListener = null;
let viewportSearchTimer = null;
let lastGymListRequestKey = '';

const selectedGym = computed(() => gyms.value.find((gym) => gym.id === selectedGymId.value) || null);
const hasMobileSearchKeyword = computed(() => appliedSearchQuery.value.length > 0);
const mobileSheetStateClass = computed(() => {
  if (mobileSheetState.value === 'full') return 'home-panel-vertical-open';
  if (mobileSheetState.value === 'hidden') return 'home-panel-vertical-hidden';
  return 'home-panel-vertical-peek';
});

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

const normalizeCoordinate = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Number(numeric.toFixed(6));
};

const getMapLatLng = (latLng) => {
  if (!latLng) return null;
  if (typeof latLng.lat === 'function' && typeof latLng.lng === 'function') {
    return {
      lat: normalizeCoordinate(latLng.lat()),
      lng: normalizeCoordinate(latLng.lng()),
    };
  }
  if (Number.isFinite(latLng.y) && Number.isFinite(latLng.x)) {
    return {
      lat: normalizeCoordinate(latLng.y),
      lng: normalizeCoordinate(latLng.x),
    };
  }
  return null;
};

const toRadians = (value) => (Number(value) * Math.PI) / 180;

const calculateDistanceMeters = (start, end) => {
  if (!start || !end) return null;

  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);
  const startLat = toRadians(start.lat);
  const endLat = toRadians(end.lat);

  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
};

const computeMapViewportSearch = () => {
  if (!mapInstance.value || !nearbyModeEnabled.value) return null;

  const center = getMapLatLng(mapInstance.value.getCenter?.());
  const bounds = mapInstance.value.getBounds?.();
  const northEast = getMapLatLng(bounds?.getNE?.());
  const southWest = getMapLatLng(bounds?.getSW?.());

  if (!center || !northEast || !southWest) {
    return null;
  }

  const corners = [
    northEast,
    southWest,
    { lat: northEast.lat, lng: southWest.lng },
    { lat: southWest.lat, lng: northEast.lng },
  ];

  const maxDistance = corners.reduce((acc, corner) => {
    const distance = calculateDistanceMeters(center, corner);
    if (!Number.isFinite(distance)) return acc;
    return Math.max(acc, distance);
  }, 0);

  if (!Number.isFinite(maxDistance) || maxDistance <= 0) {
    return {
      userLatitude: center.lat,
      userLongitude: center.lng,
      radiusMeters: 3000,
    };
  }

  return {
    userLatitude: center.lat,
    userLongitude: center.lng,
    radiusMeters: Math.max(300, Math.round(maxDistance)),
  };
};

const buildGymListParams = () => {
  const params = {
    page: 0,
    size: gymListPageSize,
  };

  const keyword = appliedSearchQuery.value.trim();
  if (keyword) {
    params.name = keyword;
  }

  const category = selectedCategoryName.value.trim();
  if (category) {
    params.category = category;
  }

  if (nearbyModeEnabled.value) {
    const geoParams = computeMapViewportSearch();
    if (geoParams) {
      params.userLatitude = geoParams.userLatitude;
      params.userLongitude = geoParams.userLongitude;
      params.radiusMeters = geoParams.radiusMeters;
    }
  }

  return params;
};

const serializeGymListParams = (params = {}) => JSON.stringify(
  Object.entries(params)
    .filter(([, value]) => value != null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right)),
);

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

const searchedGyms = computed(() => gyms.value);

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
  syncHomeDetailQuery(null);
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
  syncHomeDetailQuery(id, { resetTab: true });
};

const handleMapReady = (map) => {
  if (mapIdleListener && window.naver?.maps?.Event) {
    window.naver.maps.Event.removeListener(mapIdleListener);
    mapIdleListener = null;
  }
  mapInstance.value = map;
  if (!map || !window.naver?.maps?.Event) return;
  mapIdleListener = window.naver.maps.Event.addListener(map, 'idle', () => {
    if (!nearbyModeEnabled.value) return;
    scheduleViewportSearchReload();
  });
};

const applyMobileSearch = async () => {
  appliedSearchQuery.value = mobileSearchInput.value.trim();
  selectedGymId.value = null;
  isSearchPanelCollapsed.value = false;
  syncHomeDetailQuery(null);
  await loadGymsForCurrentContext();
  if (appliedSearchQuery.value.length > 0) {
    mobileSheetState.value = 'full';
    return;
  }
  mobileSheetState.value = 'peek';
};

const clearMobileSearch = async () => {
  mobileSearchInput.value = '';
  appliedSearchQuery.value = '';
  selectedGymId.value = null;
  syncHomeDetailQuery(null);
  await loadGymsForCurrentContext();
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
  syncHomeDetailQuery(null);
};

const syncHomeDetailQuery = (gymId, options = {}) => {
  const nextQuery = { ...route.query };
  if (gymId) {
    nextQuery.g = String(gymId);
    delete nextQuery.gymId;
  } else {
    delete nextQuery.g;
    delete nextQuery.gymId;
  }

  if (options.resetTab || !gymId) {
    delete nextQuery.t;
    delete nextQuery.tab;
  }

  const currentGymId = String(route.query.g ?? route.query.gymId ?? '');
  const currentTab = String(route.query.t ?? route.query.tab ?? '');
  const nextGymId = String(nextQuery.g ?? nextQuery.gymId ?? '');
  const nextTab = String(nextQuery.t ?? nextQuery.tab ?? '');
  if (currentGymId === nextGymId && currentTab === nextTab) return;

  router.replace({ path: route.path, query: nextQuery }).catch(() => {});
};

const syncSelectedGymFromRoute = () => {
  const queryGymId = String(route.query.g ?? route.query.gymId ?? '').trim();
  if (!queryGymId) {
    if (selectedGymId.value != null) {
      closeGym();
    }
    return;
  }

  if (selectedGymId.value === queryGymId) {
    if (mobileSheetState.value !== 'full') {
      mobileSheetState.value = 'full';
    }
    return;
  }

  const targetGym = gyms.value.find((gym) => String(gym.id) === queryGymId);
  if (!targetGym) return;

  selectedGymId.value = queryGymId;
  mobileSheetState.value = 'full';
  routePath.value = [];
  routeSummary.value = null;
  isRouting.value = false;

  if (isSearchPanelCollapsed.value) {
    isSearchPanelCollapsed.value = false;
  }
};

const handleCategorySelect = async (category) => {
  const clickedCategoryName = String(category?.name || '').trim();
  const nextCategoryName = selectedCategoryName.value === clickedCategoryName ? '' : clickedCategoryName;

  selectedCategoryName.value = nextCategoryName;
  resetSelectedGymContext();

  if (mobileSheetState.value === 'hidden') {
    mobileSheetState.value = 'peek';
  }

  await loadGymsForCurrentContext();
};

const handleDesktopSearch = async (keyword) => {
  appliedSearchQuery.value = String(keyword || '').trim();
  mobileSearchInput.value = appliedSearchQuery.value;
  resetSelectedGymContext();

  if (mobileSheetState.value === 'hidden') {
    mobileSheetState.value = 'peek';
  }

  await loadGymsForCurrentContext();
};

const handleCurrentLocationSelected = () => {
  nearbyModeEnabled.value = true;
  scheduleViewportSearchReload(true);
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

  const imageList = toImageVariantItems(detail?.images);
  const imageUrl = getPrimaryThumbnailImageUrl(imageList);

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

const loadGyms = async (params = {}, options = {}) => {
  const { force = false } = options;
  const requestId = ++gymLoadSequence;
  const requestKey = serializeGymListParams(params);

  if (!force && requestKey === lastGymListRequestKey) {
    return;
  }

  lastGymListRequestKey = requestKey;

  try {
    const response = await gymApi.list(params);
    const list = response.data?.data || response.data?.result || response.data;
    if (requestId !== gymLoadSequence) return;

    gyms.value = (Array.isArray(list) ? list : []).map((gym) => normalizeGym(gym));

    if (selectedGymId.value && !gyms.value.some((gym) => gym.id === selectedGymId.value)) {
      resetSelectedGymContext();
    }
  } catch (error) {
    if (lastGymListRequestKey === requestKey) {
      lastGymListRequestKey = '';
    }
    console.error('Failed to load gyms:', error);
  }
};

const loadGymsForCurrentContext = async (options = {}) => {
  await loadGyms(buildGymListParams(), options);
};

const scheduleViewportSearchReload = (force = false) => {
  if (viewportSearchTimer) {
    clearTimeout(viewportSearchTimer);
  }
  viewportSearchTimer = setTimeout(() => {
    loadGymsForCurrentContext({ force }).catch((error) => {
      console.error('Failed to reload nearby gyms:', error);
    });
  }, mapIdleDebounceMs);
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
  await loadGymsForCurrentContext();
  await loadFavoriteGyms();
  syncSelectedGymFromRoute();
});

onBeforeUnmount(() => {
  if (viewportSearchTimer) {
    clearTimeout(viewportSearchTimer);
    viewportSearchTimer = null;
  }
  if (mapIdleListener && window.naver?.maps?.Event) {
    window.naver.maps.Event.removeListener(mapIdleListener);
    mapIdleListener = null;
  }
});

watch(() => [route.query.g, route.query.gymId, gyms.value.length], () => {
  syncSelectedGymFromRoute();
});
</script>
