<template>
  <div class="search-panel-shell">
    <div
      class="info-panel search-panel-root"
      :class="[
        isCollapsed ? 'search-panel-collapsed' : 'search-panel-expanded',
        selectedGym ? 'search-panel-has-selection' : 'search-panel-no-selection',
      ]"
    >
      <button
        type="button"
        class="search-panel-mobile-grab"
        aria-label="슬라이드 패널 열기 또는 닫기"
        @click="toggleMobileSheetByHandle"
        @touchstart.passive="onHandleTouchStart"
        @touchend.passive="onHandleTouchEnd"
      >
        <span class="search-panel-mobile-grab-bar" />
      </button>
      <UiIconButton
        v-if="!selectedGym && mobileSheetState === 'full'"
        class="search-panel-mobile-close"
        variant="overlay"
        size="sm"
        aria-label="슬라이드 닫기"
        @click="hideMobileSheet"
      >
        <X :size="20" />
      </UiIconButton>

      <div class="search-panel-content-shell">
        <div class="search-panel-list-pane">
        <div class="search-panel-search-wrap">
          <div class="sx-components-sections-searchpanel-005">
            <div class="search-input-shell">
              <button class="search-panel-search-icon-btn" aria-label="검색" @click="submitSearch">
                <Search class="search-panel-search-icon" :stroke-width="2.5" />
              </button>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="헬스장, PT, 운동 시설 검색"
                class="search-input-field"
                @keyup.enter="submitSearch"
              />
              <button v-if="searchQuery.length > 0" class="search-panel-clear-btn" @click="clearSearch">
                <X :size="20" />
              </button>
            </div>
          </div>
        </div>

        <div class="search-panel-notice-wrap">
          <div class="search-panel-notice">
            <Speaker class="search-panel-notice-icon" />
            <span class="search-panel-notice-text">오운완 커뮤니티 오픈 기념 포인트 이벤트 진행 중!</span>
          </div>
        </div>

        <div class="search-panel-event-wrap">
          <div class="search-panel-event-card">
            <div class="search-panel-event-icon">
              <Dumbbell :size="32" />
            </div>
            <div class="v-grow-1 ux-components-sections-searchpanel-019">
              <div class="search-panel-event-title-row">
                <span class="search-panel-event-title">머슬 마인드 짐 3개월 50% 할인!</span>
                <span class="search-panel-event-tag">이벤트</span>
              </div>
              <p class="search-panel-event-sub">선착순 10명, PT 2회 무료 제공까지...</p>
            </div>
          </div>
        </div>

        <div class="search-panel-list">
          <div
            v-for="gym in filteredGyms"
            :key="gym.id"
            class="search-panel-list-item"
            @click="onSelectGym(gym.id)"
          >
            <div class="search-panel-list-row">
              <div class="search-panel-list-image-wrap">
                <img :src="gym.image || defaultGymImage" :alt="gym.name" class="ux-components-sections-searchpanel-020" />
                <div class="search-panel-list-image-badge">
                  <Camera :size="10" />
                  <span>{{ toImageUrls(gym.images).length || 1 }}</span>
                </div>
              </div>

              <div class="search-panel-list-body">
                <div>
                  <div class="sx-components-sections-searchpanel-006">
                    <h3 class="search-panel-list-title">{{ gym.name }}</h3>
                    <Star
                      :size="18"
                      :class="isFavorite(gym.id) ? 'search-panel-list-favorite-active' : 'search-panel-list-favorite-inactive'"
                      :fill="isFavorite(gym.id) ? 'currentColor' : 'none'"
                    />
                  </div>
                  <div class="search-panel-list-rating">
                    <span class="ux-components-sections-searchpanel-021">★</span>
                    <span class="ux-components-sections-searchpanel-022">{{ formatRating(gym.rating) }}</span>
                    <span class="ux-components-sections-searchpanel-023">(리뷰 {{ formatCount(gym.reviews) }}개)</span>
                    <span class="u-text-gray-300">·</span>
                    <span class="search-panel-list-location">{{ gym.location || '-' }}</span>
                  </div>
                  <p class="search-panel-list-desc">"{{ truncateText(gym.about, 40) }}"</p>
                  <div class="search-panel-list-open-row">
                    <span class="ux-components-sections-searchpanel-024">영업 중</span>
                    <span class="u-text-gray-300">·</span>
                    <span class="ux-components-sections-searchpanel-025">23:00 영업 종료</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="search-panel-list-footer">
            <p class="search-panel-list-footer-text">총 {{ filteredGyms.length }}개 결과</p>
          </div>
        </div>
        </div>

        <div class="search-panel-detail-pane">
          <div v-if="selectedGym" ref="detailScrollRef" class="search-panel-detail">
            <div class="sx-components-sections-searchpanel-001">
              <img :src="selectedGymHeroImage" :alt="selectedGym.name" class="ux-components-sections-searchpanel-001" />
              <UiIconButton
                class="search-panel-hero-btn search-panel-hero-btn-left"
                variant="overlay"
                size="sm"
                @click="onCloseGym"
              >
                <ArrowLeft :size="20" />
              </UiIconButton>
              <UiIconButton
                v-if="mobileSheetState === 'full'"
                class="search-panel-hero-btn search-panel-hero-btn-right ux-components-sections-searchpanel-002"
                variant="overlay"
                size="sm"
                @click="onCloseGym"
              >
                <X :size="20" />
              </UiIconButton>
              <UiIconButton
                class="search-panel-hero-btn search-panel-hero-btn-right search-panel-hero-btn-desktop-close"
                variant="overlay"
                size="sm"
                @click="onCloseGym"
                aria-label="상세 슬라이드 닫기"
              >
                <X :size="20" />
              </UiIconButton>
              <div class="search-panel-hero-badge-wrap">
                <button class="search-panel-hero-badge" @click="handleTabClick('사진')">
                  <Grid :size="14" />
                  <span>{{ photoItems.length }}</span>
                </button>
              </div>
            </div>

            <div class="search-panel-detail-body">
              <div class="search-panel-detail-head">
                <div class="search-panel-title-row">
                  <h2 class="ux-components-sections-searchpanel-003">{{ selectedGym.name }}</h2>
                  <span class="ux-components-sections-searchpanel-004">{{ selectedGymType }}</span>
                </div>
                <div class="search-panel-rating-row">
                  <span class="ux-components-sections-searchpanel-005">★</span>
                  <span class="ux-components-sections-searchpanel-006">{{ formatRating(selectedGymRating) }}</span>
                  <span class="u-text-gray-400">리뷰 {{ selectedGymReviewCount }}</span>
                </div>

                <div class="search-panel-route-btns">
                  <button class="search-panel-route-btn search-panel-route-btn-start">출발</button>
                  <button
                    class="search-panel-route-btn search-panel-route-btn-arrive"
                    @click="onRequestArriveDirection"
                  >
                    도착
                  </button>
                </div>

                <div class="search-panel-divider" />

                <div class="search-panel-action-row">
                  <button class="sx-components-sections-searchpanel-002" @click="onToggleFavoriteGym(selectedGym.id)">
                    <Star
                      :size="24"
                      :class="isFavorite(selectedGym.id) ? 'ux-components-sections-searchpanel-007' : 'u-text-gray-400'"
                      :fill="isFavorite(selectedGym.id) ? 'currentColor' : 'none'"
                    />
                    <span class="ux-components-sections-searchpanel-008">저장</span>
                  </button>
                  <div class="search-panel-action-divider" />
                  <button class="sx-components-sections-searchpanel-002">
                    <Share2 :size="24" class="u-text-gray-400" />
                    <span class="ux-components-sections-searchpanel-009">공유</span>
                  </button>
                </div>
              </div>

              <div class="search-panel-tabs-wrap">
                <div class="search-panel-tabs">
                  <button
                    v-for="tab in tabs"
                    :key="tab"
                    class="search-panel-tab-btn"
                    :class="activeTab === tab ? 'search-panel-tab-active' : 'search-panel-tab-inactive'"
                    @click="handleTabClick(tab)"
                  >
                    {{ tab }}
                    <div v-if="activeTab === tab" class="search-panel-tab-underline" />
                  </button>
                </div>
              </div>

              <div class="search-panel-content">
                <div v-if="activeTab === '홈'" class="search-panel-content-home">
                  <div class="u-white-soft-card">
                    <h3 class="search-panel-card-title">
                      <Info :size="18" class="ux-components-sections-searchpanel-010" /> 상세 정보
                    </h3>
                    <p class="ux-components-sections-searchpanel-011">{{ selectedGymAbout }}</p>
                  </div>

                  <div class="u-white-soft-card">
                    <h3 class="sx-components-sections-searchpanel-003">편의 시설</h3>
                    <div class="search-panel-feature-grid">
                      <div
                        v-for="amenity in displayAmenities"
                        :key="amenity.key"
                        class="search-panel-feature-item"
                      >
                        <component :is="amenity.icon" v-if="amenity.icon" :size="18" class="search-panel-feature-icon" />
                        <span>{{ amenity.label }}</span>
                      </div>
                    </div>
                    <p v-if="displayAmenities.length === 0" class="search-panel-feature-empty">등록된 편의시설이 없습니다.</p>
                  </div>

                  <div class="u-white-soft-card">
                    <div class="search-panel-contact-row">
                      <h3 class="ux-components-sections-searchpanel-016">연락처</h3>
                      <Phone :size="16" class="u-text-gray-400" />
                    </div>
                    <p class="sx-components-sections-searchpanel-004">{{ selectedGymPhone }}</p>
                    <p class="ux-components-sections-searchpanel-017">{{ selectedGymWebsite }}</p>
                  </div>
                </div>

                <div v-else-if="activeTab === '리뷰'" class="search-panel-tab-content">
                  <div v-if="tabLoading" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <MessageSquare :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">리뷰 정보를 불러오는 중입니다...</p>
                  </div>
                  <div v-else-if="tabError" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <MessageSquare :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">{{ tabError }}</p>
                  </div>
                  <div v-else-if="reviewItems.length === 0" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <MessageSquare :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">등록된 리뷰가 없습니다.</p>
                  </div>
                  <div v-else class="search-panel-review-list">
                    <article v-for="review in reviewItems" :key="review.reviewId || review.id" class="search-panel-review-item">
                      <div class="search-panel-review-head">
                        <strong>{{ review.nickname || '익명' }}</strong>
                        <span>★ {{ formatRating(review.rating) }}</span>
                      </div>
                      <p class="search-panel-review-comment">{{ review.comment || '' }}</p>
                      <div v-if="toImageUrls(review.images).length > 0" class="search-panel-review-images">
                        <img
                          v-for="(imageUrl, imageIndex) in toImageUrls(review.images)"
                          :key="`${review.reviewId || review.id}-${imageIndex}`"
                          :src="imageUrl"
                          alt="리뷰 사진"
                          class="search-panel-review-image"
                        />
                      </div>
                    </article>
                  </div>
                </div>

                <div v-else-if="activeTab === '사진'" class="search-panel-tab-content">
                  <div v-if="tabLoading" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <Camera :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">사진 정보를 불러오는 중입니다...</p>
                  </div>
                  <div v-else-if="tabError" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <Camera :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">{{ tabError }}</p>
                  </div>
                  <div v-else-if="photoItems.length === 0" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <Camera :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">등록된 사진이 없습니다.</p>
                  </div>
                  <div v-else class="search-panel-photo-grid">
                    <div v-for="(photoUrl, index) in photoItems" :key="`${photoUrl}-${index}`" class="search-panel-photo-item">
                      <img :src="photoUrl" alt="체육관 사진" class="search-panel-photo-image" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      class="search-panel-toggle-btn ux-components-sections-searchpanel-026"
      :class="[
        isCollapsed ? 'search-panel-toggle-btn-collapsed' : 'search-panel-toggle-btn-open',
        selectedGym && !isCollapsed ? 'search-panel-toggle-btn-on-detail' : '',
      ]"
      @click="onToggle"
      aria-label="검색 패널 접기/펼치기"
    >
      <ChevronRight v-if="isCollapsed" :size="16" class="u-text-666" />
      <ChevronLeft v-else :size="16" class="u-text-666" />
    </button>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Speaker,
  Dumbbell,
  User,
  Star,
  Wifi,
  Phone,
  ArrowLeft,
  X,
  Share2,
  Grid,
  Camera,
  MessageSquare,
  Info,
} from 'lucide-vue-next';
import UiIconButton from '@/components/ui/UiIconButton.vue';
import { gymApi, reviewApi } from '@/services/apis';
import { extractList, extractPayload } from '@/utils/api';

const defaultGymImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop';
const tabs = ['홈', '리뷰', '사진'];
const activeTab = ref('홈');
const searchQuery = ref('');
const appliedSearchQuery = ref('');
const detailScrollRef = ref(null);
const tabLoading = ref(false);
const tabError = ref('');
const gymDetailMap = ref({});
const reviewMap = ref({});

const amenityLabelMap = {
  FREE_WIFI: '무료 Wi-Fi',
  SHOWER: '샤워실',
  PARKING: '주차 가능',
  PERSONAL_TRAINING: 'PT 가능',
  PT: 'PT 가능',
  LOCKER: '락커',
  INBODY: '인바디',
  LAUNDRY: '세탁실',
};

const amenityIconMap = {
  FREE_WIFI: Wifi,
  PERSONAL_TRAINING: User,
  PT: User,
};

const props = defineProps({
  isCollapsed: { type: Boolean, required: true },
  onToggle: { type: Function, required: true },
  mobileSheetState: { type: String, default: 'peek' },
  onSetMobileSheetState: { type: Function, default: null },
  selectedGym: { type: Object, default: null },
  onCloseGym: { type: Function, required: true },
  gyms: { type: Array, required: true },
  onSelectGym: { type: Function, required: true },
  favoriteGymIds: { type: Array, required: true },
  onToggleFavoriteGym: { type: Function, required: true },
  onArriveDirection: { type: Function, default: null },
});

const handleTouchStartY = ref(null);

const normalizeId = (value) => String(value ?? '').trim();
const isFavorite = (id) => props.favoriteGymIds.includes(normalizeId(id));

const selectedGymId = computed(() => normalizeId(props.selectedGym?.id));
const selectedGymDetail = computed(() => gymDetailMap.value[selectedGymId.value] || null);
const reviewItems = computed(() => reviewMap.value[selectedGymId.value] || []);
const selectedGymReviewCount = computed(() => {
  if (reviewItems.value.length > 0) return reviewItems.value.length;
  return formatCount(props.selectedGym?.reviews);
});

const selectedGymType = computed(() =>
  selectedGymDetail.value?.categoryName
    || props.selectedGym?.type
    || props.selectedGym?.categoryName
    || '-');

const selectedGymRating = computed(() => Number(props.selectedGym?.rating ?? 0));
const selectedGymAbout = computed(() =>
  selectedGymDetail.value?.description
    || props.selectedGym?.about
    || '');
const selectedGymPhone = computed(() =>
  selectedGymDetail.value?.tel
    || props.selectedGym?.phone
    || '-');
const selectedGymWebsite = computed(() => props.selectedGym?.website || '');

const toImageUrls = (rawImages) => {
  if (!rawImages) return [];
  if (typeof rawImages === 'string') return rawImages ? [rawImages] : [];
  if (!Array.isArray(rawImages)) return [];
  return rawImages
    .map((item) => {
      if (typeof item === 'string') return item;
      return item?.imageUrl || item?.url || item?.path || item?.src || '';
    })
    .filter(Boolean);
};

const photoItems = computed(() => {
  const detailImages = toImageUrls(selectedGymDetail.value?.images);
  if (detailImages.length > 0) return detailImages;
  const listImages = toImageUrls(props.selectedGym?.images);
  if (listImages.length > 0) return listImages;
  return toImageUrls(props.selectedGym?.image);
});

const selectedGymHeroImage = computed(() =>
  photoItems.value[0]
    || props.selectedGym?.image
    || defaultGymImage);

const formatAmenityLabel = (code, name) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (amenityLabelMap[normalizedCode]) return amenityLabelMap[normalizedCode];
  if (name && name !== code) return String(name);
  if (!normalizedCode) return '';
  return normalizedCode.replace(/_/g, ' ');
};

const displayAmenities = computed(() => {
  const source = selectedGymDetail.value?.amenities
    || props.selectedGym?.amenities
    || props.selectedGym?.amenityCodes
    || props.selectedGym?.features
    || [];
  const list = Array.isArray(source) ? source : [];
  const dedup = new Set();

  return list
    .map((item) => {
      if (typeof item === 'string') {
        const normalizedCode = item.toUpperCase();
        return {
          key: normalizedCode,
          label: formatAmenityLabel(normalizedCode, item),
          icon: amenityIconMap[normalizedCode] || null,
        };
      }

      const code = String(item?.code || item?.amenityCode || item?.name || '').toUpperCase();
      const key = code || String(item?.id || item?.name || Math.random());
      return {
        key,
        label: formatAmenityLabel(code, item?.name),
        icon: amenityIconMap[code] || null,
      };
    })
    .filter((item) => {
      if (!item?.label || dedup.has(item.key)) return false;
      dedup.add(item.key);
      return true;
    });
});

const formatRating = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0.0';
  return numeric.toFixed(1);
};

const formatCount = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric);
};

const truncateText = (text, maxLength = 40) => {
  const value = String(text || '').trim();
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
};

const ensureGymDetail = async (gymId) => {
  if (!gymId || gymDetailMap.value[gymId]) {
    return gymDetailMap.value[gymId] || null;
  }

  const response = await gymApi.detail(gymId);
  const payload = extractPayload(response, {});
  gymDetailMap.value = {
    ...gymDetailMap.value,
    [gymId]: payload || {},
  };
  return gymDetailMap.value[gymId];
};

const ensureGymReviews = async (gymId) => {
  if (!gymId || reviewMap.value[gymId]) {
    return reviewMap.value[gymId] || [];
  }

  const response = await reviewApi.listPage({ gymId, page: 0, size: 50 });
  const payload = extractPayload(response, {});
  const list = extractList(payload);
  const hasGymIdField = list.some((item) =>
    item?.gymId != null || item?.gym?.id != null);
  const filtered = hasGymIdField
    ? list.filter((item) => {
      const candidateGymId = item?.gymId ?? item?.gym?.id;
      return normalizeId(candidateGymId) === gymId;
    })
    : list;

  reviewMap.value = {
    ...reviewMap.value,
    [gymId]: filtered,
  };
  return filtered;
};

const submitSearch = () => {
  appliedSearchQuery.value = searchQuery.value.trim();
};

const clearSearch = () => {
  searchQuery.value = '';
  appliedSearchQuery.value = '';
};

const hideMobileSheet = () => {
  if (typeof props.onSetMobileSheetState === 'function') {
    props.onSetMobileSheetState('hidden');
  }
};

const toggleMobileSheetByHandle = () => {
  if (typeof props.onSetMobileSheetState !== 'function') return;
  if (props.mobileSheetState === 'full') {
    props.onSetMobileSheetState('peek');
  } else {
    props.onSetMobileSheetState('full');
  }
};

const onHandleTouchStart = (event) => {
  handleTouchStartY.value = event.changedTouches?.[0]?.clientY ?? null;
};

const onHandleTouchEnd = (event) => {
  if (typeof props.onSetMobileSheetState !== 'function') return;

  const startY = handleTouchStartY.value;
  const endY = event.changedTouches?.[0]?.clientY;
  handleTouchStartY.value = null;

  if (startY == null || endY == null) {
    toggleMobileSheetByHandle();
    return;
  }

  const deltaY = endY - startY;
  if (Math.abs(deltaY) < 20) {
    toggleMobileSheetByHandle();
    return;
  }

  if (deltaY > 40) {
    if (props.mobileSheetState === 'full' && deltaY > 140) {
      props.onSetMobileSheetState('hidden');
    } else if (props.mobileSheetState === 'full') {
      props.onSetMobileSheetState('peek');
    } else if (props.mobileSheetState === 'peek') {
      props.onSetMobileSheetState('hidden');
    }
    return;
  }

  if (deltaY < -40) {
    if (props.mobileSheetState === 'hidden') {
      props.onSetMobileSheetState('peek');
    } else if (props.mobileSheetState === 'peek') {
      props.onSetMobileSheetState('full');
    }
  }
};

const handleTabClick = async (tab) => {
  activeTab.value = tab;
  await nextTick();
  if (detailScrollRef.value) {
    detailScrollRef.value.scrollTo({ top: 0, behavior: 'auto' });
  }
};

const loadTabData = async (tab) => {
  const gymId = selectedGymId.value;
  if (!gymId) return;

  tabError.value = '';

  if (tab === '홈') {
    try {
      await ensureGymDetail(gymId);
    } catch (error) {
      console.error('Failed to load gym detail:', error);
    }
    return;
  }

  tabLoading.value = true;
  try {
    if (tab === '리뷰') {
      await ensureGymReviews(gymId);
      return;
    }

    if (tab === '사진') {
      await ensureGymDetail(gymId);
    }
  } catch (error) {
    console.error(`Failed to load ${tab} tab data:`, error);
    tabError.value = `${tab} 정보를 불러오지 못했습니다.`;
  } finally {
    tabLoading.value = false;
  }
};

const onRequestArriveDirection = () => {
  if (!props.selectedGym) return;
  if (typeof props.onArriveDirection === 'function') {
    props.onArriveDirection(props.selectedGym);
  }
};

const filteredGyms = computed(() => {
  const keyword = appliedSearchQuery.value.toLowerCase();
  if (!keyword) return props.gyms;
  return props.gyms.filter((gym) => {
    const fields = [gym.name, gym.type, gym.location, gym.about];
    return fields.some((field) => String(field || '').toLowerCase().includes(keyword));
  });
});

watch(selectedGymId, async (nextGymId, prevGymId) => {
  tabError.value = '';
  tabLoading.value = false;

  if (!nextGymId) return;
  if (nextGymId !== prevGymId) {
    activeTab.value = '홈';
  }

  await loadTabData('홈');
}, { immediate: true });

watch(activeTab, async (tab) => {
  await loadTabData(tab);
});
</script>
