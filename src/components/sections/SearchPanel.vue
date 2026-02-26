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
                <img :src="gym.image" :alt="gym.name" class="ux-components-sections-searchpanel-020" />
                <div class="search-panel-list-image-badge">
                  <Camera :size="10" />
                  <span>12</span>
                </div>
              </div>

              <div class="search-panel-list-body">
                <div>
                  <div class="sx-components-sections-searchpanel-006">
                    <h3 class="search-panel-list-title">{{ gym.name }}</h3>
                    <Heart :size="18" class="u-text-gray-300" />
                  </div>
                  <div class="search-panel-list-rating">
                    <span class="ux-components-sections-searchpanel-021">★</span>
                    <span class="ux-components-sections-searchpanel-022">{{ gym.rating.toFixed(1) }}</span>
                    <span class="ux-components-sections-searchpanel-023">(리뷰 {{ gym.reviews }}개)</span>
                    <span class="u-text-gray-300">·</span>
                    <span class="search-panel-list-location">{{ gym.location }}역</span>
                  </div>
                  <p class="search-panel-list-desc">"{{ gym.about.substring(0, 40) }}..."</p>
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
              <img :src="selectedGym.image" :alt="selectedGym.name" class="ux-components-sections-searchpanel-001" />
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
                  <span>12</span>
                </button>
              </div>
            </div>

            <div class="search-panel-detail-body">
              <div class="search-panel-detail-head">
                <div class="search-panel-title-row">
                  <h2 class="ux-components-sections-searchpanel-003">{{ selectedGym.name }}</h2>
                  <span class="ux-components-sections-searchpanel-004">{{ selectedGym.type }}</span>
                </div>
                <div class="search-panel-rating-row">
                  <span class="ux-components-sections-searchpanel-005">★</span>
                  <span class="ux-components-sections-searchpanel-006">{{ selectedGym.rating.toFixed(1) }}</span>
                  <span class="u-text-gray-400">리뷰 {{ selectedGym.reviews + Math.floor(selectedGym.reviews / 3) }}</span>
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
                    <p class="ux-components-sections-searchpanel-011">{{ selectedGym.about }}</p>
                  </div>

                  <div class="u-white-soft-card">
                    <h3 class="sx-components-sections-searchpanel-003">편의 시설</h3>
                    <div class="search-panel-feature-grid">
                      <div
                        v-for="(feature, idx) in selectedGym.features"
                        :key="idx"
                        class="search-panel-feature-item"
                      >
                        <Wifi v-if="feature.includes('Wi-Fi')" :size="14" class="ux-components-sections-searchpanel-012" />
                        <ShowerHead v-if="feature.includes('샤워')" :size="14" class="ux-components-sections-searchpanel-013" />
                        <Car v-if="feature.includes('주차')" :size="14" class="ux-components-sections-searchpanel-014" />
                        <User v-if="feature.includes('PT')" :size="14" class="ux-components-sections-searchpanel-015" />
                        <span>{{ feature }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="u-white-soft-card">
                    <div class="search-panel-contact-row">
                      <h3 class="ux-components-sections-searchpanel-016">연락처</h3>
                      <Phone :size="16" class="u-text-gray-400" />
                    </div>
                    <p class="sx-components-sections-searchpanel-004">{{ selectedGym.phone }}</p>
                    <p class="ux-components-sections-searchpanel-017">{{ selectedGym.website }}</p>
                  </div>
                </div>

                <div v-else class="search-panel-empty">
                  <div class="search-panel-empty-icon">
                    <Menu v-if="activeTab === '가격정보'" :size="32" />
                    <MessageSquare v-else-if="activeTab === '리뷰'" :size="32" />
                    <Camera v-else :size="32" />
                  </div>
                  <p class="ux-components-sections-searchpanel-018">{{ activeTab }} 정보를 불러오는 중입니다...</p>
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
import { computed, nextTick, ref } from 'vue';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Speaker,
  Dumbbell,
  User,
  Star,
  Wifi,
  ShowerHead,
  Car,
  Phone,
  ArrowLeft,
  X,
  Share2,
  Heart,
  Grid,
  Camera,
  MessageSquare,
  Menu,
  Info,
} from 'lucide-vue-next';
import UiIconButton from '@/components/ui/UiIconButton.vue';

const tabs = ['홈', '가격정보', '리뷰', '사진'];
const activeTab = ref('홈');
const searchQuery = ref('');
const appliedSearchQuery = ref('');
const detailScrollRef = ref(null);

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

const isFavorite = (id) => props.favoriteGymIds.includes(id);

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
</script>
