<template>
  <div class="screen-rail-white">
    <NavigationRail />

    <div class="app-main-column app-main-column-no-scroll">
      <header class="sx-views-community-communityview-001">
        <div class="v-header-inner v-community-header-inline">
          <div class="v-title-row v-community-header-title">
            <MessageCircle class="ux-views-community-communityview-002" :size="24" />
            <h1 class="v-title-text">커뮤니티</h1>
          </div>

          <form class="v-search-pill v-community-header-search" @submit.prevent="applySearch">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="관심있는 내용을 검색해보세요!"
              class="v-search-input"
              @focus="handleSearchFocus"
              @blur="handleSearchBlur"
            />
            <Search class="v-search-icon" :size="18" />
            <button
              v-if="hasSearchTerm"
              type="button"
              class="v-search-clear-btn"
              aria-label="검색어 지우기"
              @pointerdown.prevent.stop="clearSearch"
              @click.prevent.stop="clearSearch"
            >
              <X :size="16" />
            </button>
            <div v-if="showSuggestionPanel" class="v-search-suggest-panel">
              <div v-if="isSuggestLoading" class="v-search-suggest-empty">추천 검색어를 불러오는 중...</div>
              <button
                v-for="suggestion in searchSuggestions"
                v-else
                :key="suggestion"
                type="button"
                class="v-search-suggest-item"
                @pointerdown.prevent.stop="applySuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
              <div v-if="!isSuggestLoading && searchSuggestions.length === 0" class="v-search-suggest-empty">
                추천 검색어가 없습니다.
              </div>
            </div>
          </form>

          <RouterLink to="/community/write" class="v-community-header-write">
            <button class="v-cta-btn v-community-header-write-btn">글쓰기</button>
          </RouterLink>
        </div>
      </header>

      <main class="sx-views-community-communityview-004 v-community-list-main">
        <div class="v-content-wrap">
          <div class="v-community-toolbar-row">
            <div class="v-community-category-strip">
              <div
                class="sx-views-community-communityview-005 v-community-category-scroller"
              >
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="v-community-tab"
                  :class="cat === selectedCategory ? 'v-community-tab-active' : 'v-community-tab-inactive'"
                  @click="handleCategoryChange(cat)"
                >
                  {{ cat }}
                </button>
              </div>
            </div>

            <div class="v-filter-row">
              <div class="v-sort-dropdown">
                <button type="button" class="v-sort-btn v-sort-btn-trigger" @click="toggleSortMenu">
                  <ArrowUpDown :size="20" />
                  {{ selectedSortLabel }}
                </button>
                <div v-if="isSortMenuOpen" class="v-sort-menu">
                  <button
                    v-for="option in sortOptions"
                    :key="option.value"
                    type="button"
                    class="v-sort-menu-item"
                    :class="selectedSortType === option.value ? 'v-sort-menu-item-active' : ''"
                    @click="selectSortType(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="sx-views-community-communityview-007">
            <div v-for="post in posts" :key="post.id" class="v-community-post-card" @click="openPost(post)">
              <div class="v-card-pad">
                <div class="sx-views-community-communityview-008">
                  <div class="v-user-row"><img :src="post.authorImage" alt="" class="v-user-avatar" /><div><div class="v-text-user">{{ post.author }}</div><div class="v-text-subtle">{{ post.time }}{{ post.location ? ` · ${post.location}` : '' }}</div></div></div>
                </div>

                <div v-if="post.type === 'workout' || post.hasWorkout">
                  <div class="sx-views-community-communityview-009"><Zap :size="18" class="ux-views-community-communityview-008" /><span class="ux-views-community-communityview-009">{{ post.author }}님이 운동을 공유했어요!</span></div>
                  <div class="sx-views-community-communityview-010">
                    <div class="sx-views-community-communityview-011">
                      <div class="sx-views-community-communityview-012"><MapPin :size="12" />{{ post.gymName || '운동 기록 첨부' }}</div>
                      <div class="sx-views-community-communityview-013"><Clock :size="12" />총 시간: {{ post.duration && post.duration !== '-' ? post.duration : '정보 없음' }}</div>
                      <div class="ux-views-community-communityview-010">
                        <template v-if="post.exercises && post.exercises.length > 0">
                          <div v-for="ex in post.exercises" :key="ex.name" class="sx-views-community-communityview-014"><span class="ux-views-community-communityview-011">{{ ex.name }}</span><span class="ux-views-community-communityview-012">{{ ex.stats }}</span></div>
                        </template>
                        <div v-else class="sx-views-community-communityview-014"><span class="ux-views-community-communityview-011">운동 기록</span><span class="ux-views-community-communityview-012">요약 정보 없음</span></div>
                      </div>
                    </div>
                    <div v-if="post.image" class="ux-views-community-communityview-013"><img :src="post.image" alt="" class="ux-views-community-communityview-014" /></div>
                  </div>
                </div>
                <div v-else>
                  <div v-if="post.image" class="sx-views-community-communityview-015"><img :src="post.image" alt="" class="ux-views-community-communityview-015" /></div>
                  <p class="ux-views-community-communityview-016"><span class="ux-views-community-communityview-017">{{ post.author }}</span> {{ post.excerpt }}</p>
                </div>

                <div class="v-community-reaction-row">
                  <div class="sx-views-community-communityview-016">
                    <button
                      class="v-community-reaction-btn ux-views-community-communityview-018"
                      :class="post.liked ? 'v-community-like-active' : 'v-community-like-inactive'"
                      @click.stop="toggleLike(post.id)"
                    >
                      <Heart
                        :size="18"
                        :fill="post.liked ? 'currentColor' : 'none'"
                        :class="post.liked ? 'v-community-like-active' : 'ux-views-community-communityview-019'"
                      />
                      {{ post.likes }}
                    </button>
                    <button class="v-community-reaction-btn ux-views-community-communityview-020">
                      <MessageCircle :size="18" class="ux-views-community-communityview-021" /> {{ post.comments }}
                    </button>
                    <button class="v-community-reaction-btn ux-views-community-communityview-020">
                      <Eye :size="18" class="ux-views-community-communityview-021" /> {{ post.views }}
                    </button>
                  </div>
                  <button
                    class="v-community-report-btn ux-views-community-communityview-022"
                    :disabled="isReportingPostId === post.id"
                    @click.stop="reportPost(post)"
                  >
                    <Flag :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isLoadingPosts" class="ux-views-community-communityview-023">게시글 목록 불러오는 중...</div>
          <div v-else-if="postLoadError" class="ux-views-community-communityview-024">{{ postLoadError }}</div>
          <div v-else-if="posts.length === 0" class="ux-views-community-communityview-025">게시글이 없습니다.</div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { Search, MessageCircle, Heart, ArrowUpDown, MapPin, Clock, Zap, Flag, X, Eye } from 'lucide-vue-next';
import { communityLikeApi, communityPostApi, reportApi } from '@/services/apis';
import { normalizeCommunityPost } from '@/utils/postNormalizer';
import { extractList, extractPayload } from '@/utils/api';

const categories = ['전체', '자유게시판', '운동 공유', '운동 꿀팁', '헬스장 리뷰', '식단 공유', '질문게시판'];
const route = useRoute();
const router = useRouter();

const posts = ref([]);
const selectedCategory = ref('전체');
const searchTerm = ref('');
const searchSuggestions = ref([]);
const isSuggestLoading = ref(false);
const isSearchFocused = ref(false);
const selectedSortType = ref('LATEST');
const isSortMenuOpen = ref(false);
const isLoadingPosts = ref(false);
const postLoadError = ref('');
const isReportingPostId = ref(null);
let suggestDebounceTimer = null;
let suggestRequestId = 0;
const sortOptions = [
  { value: 'LATEST', label: '최신순' },
  { value: 'LIKE', label: '좋아요순' },
  { value: 'COMMENT', label: '댓글순' },
  { value: 'VIEW', label: '조회순' },
];

const normalizeSortType = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  return sortOptions.some((item) => item.value === normalized) ? normalized : 'LATEST';
};
const selectedSortLabel = computed(() => (
  sortOptions.find((item) => item.value === normalizeSortType(selectedSortType.value))?.label || '최신순'
));
const hasSearchTerm = computed(() => String(searchTerm.value || '').length > 0);
const hasSuggestTarget = computed(() => String(searchTerm.value || '').trim().length >= 2);
const showSuggestionPanel = computed(() => isSearchFocused.value && hasSuggestTarget.value);

const getNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getPostId = (post) => getNumber(post?.id ?? post?.postId ?? post?.communityPostId, 0);
const getPostCreatedTime = (post) => {
  const parsed = new Date(post?.createdTime || post?.createdAt || post?.createdDate || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};
const getPostLikeCount = (post) => getNumber(post?.likeCount ?? post?.likes, 0);
const getPostCommentCount = (post) => getNumber(post?.commentCount ?? post?.comments, 0);
const getPostViewCount = (post) => getNumber(post?.viewCount ?? post?.views, 0);

const compareByCreatedAndId = (a, b) => {
  const createdDiff = getPostCreatedTime(b) - getPostCreatedTime(a);
  if (createdDiff !== 0) return createdDiff;
  return getPostId(b) - getPostId(a);
};

const sortPostsByType = (items, sortType) => {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (sortType === 'LIKE') {
      const metricDiff = getPostLikeCount(b) - getPostLikeCount(a);
      if (metricDiff !== 0) return metricDiff;
      return compareByCreatedAndId(a, b);
    }
    if (sortType === 'COMMENT') {
      const metricDiff = getPostCommentCount(b) - getPostCommentCount(a);
      if (metricDiff !== 0) return metricDiff;
      return compareByCreatedAndId(a, b);
    }
    if (sortType === 'VIEW') {
      const metricDiff = getPostViewCount(b) - getPostViewCount(a);
      if (metricDiff !== 0) return metricDiff;
      return compareByCreatedAndId(a, b);
    }
    return compareByCreatedAndId(a, b);
  });
  return sorted;
};

const extractDetailPayload = (response) => (
  response?.data?.data ?? response?.data?.result ?? response?.data ?? {}
);

const shouldHydratePostMeta = (entry) => Boolean(entry?.id);

const mergePostFromDetail = (basePost, detailSource) => {
  const normalizedDetail = normalizeCommunityPost(detailSource || {}, 0);
  const hasWorkout = Boolean(
    basePost.hasWorkout ||
    normalizedDetail.hasWorkout ||
    normalizedDetail.workoutId,
  );

  return {
    ...basePost,
    type: hasWorkout ? 'workout' : basePost.type,
    hasWorkout,
    hasWorkoutPreview: Boolean(basePost.hasWorkoutPreview || normalizedDetail.hasWorkoutPreview),
    workoutId: basePost.workoutId || normalizedDetail.workoutId || null,
    gymName: normalizedDetail.gymName || basePost.gymName,
    duration: normalizedDetail.duration || basePost.duration,
    streak: Number.isFinite(Number(normalizedDetail.streak)) ? normalizedDetail.streak : basePost.streak,
    exercises: Array.isArray(basePost.exercises) && basePost.exercises.length > 0
      ? basePost.exercises
      : (normalizedDetail.exercises || []),
    image: basePost.image || normalizedDetail.image || '',
    images: Array.isArray(basePost.images) && basePost.images.length > 0
      ? basePost.images
      : (normalizedDetail.images || []),
    liked: Boolean(normalizedDetail.liked ?? basePost.liked),
  };
};

const hydrateWorkoutMetaFromDetail = async (normalizedList) => {
  const targets = normalizedList.filter(shouldHydratePostMeta);
  if (targets.length === 0) return normalizedList;

  const hydratedEntries = await Promise.all(targets.map(async (entry) => {
    try {
      const response = await communityPostApi.detail(entry.id);
      const detailPayload = extractDetailPayload(response);
      const detailSource = detailPayload?.post && typeof detailPayload.post === 'object'
        ? { ...detailPayload, ...detailPayload.post }
        : detailPayload;
      return [String(entry.id), mergePostFromDetail(entry, detailSource)];
    } catch (error) {
      return [String(entry.id), entry];
    }
  }));

  const hydrateMap = new Map(hydratedEntries);
  return normalizedList.map((entry) => hydrateMap.get(String(entry.id)) || entry);
};

const toFriendlyApiError = (error) => {
  const status = Number(error?.response?.status || 0);
  if (status === 401) return '로그인이 필요합니다.';
  if (status === 403) return '커뮤니티 조회 권한이 없습니다.';
  if (status === 404) return '커뮤니티 API 경로를 찾지 못했습니다. 프론트 API 주소를 확인해주세요.';
  if (status >= 500) return '서버 오류로 게시글 목록을 불러오지 못했습니다.';
  if (!error?.response) return '백엔드 연결에 실패했습니다. API 주소/CORS 설정을 확인해주세요.';
  return '게시글 목록을 불러오지 못했습니다.';
};

const buildListQuery = () => {
  const query = {};
  const category = String(selectedCategory.value || '').trim();
  const keyword = String(searchTerm.value || '').trim();
  const sortType = normalizeSortType(selectedSortType.value);
  if (category && category !== '전체') query.category = category;
  if (keyword) query.q = keyword;
  if (sortType) query.sortType = sortType;
  return query;
};

const syncListQuery = () => {
  router.replace({ path: '/community', query: buildListQuery() });
};

const loadPosts = async (
  category = selectedCategory.value,
  keyword = searchTerm.value,
  sortType = selectedSortType.value,
) => {
  isLoadingPosts.value = true;
  postLoadError.value = '';
  try {
    const normalizedSortType = normalizeSortType(sortType);
    const trimmedKeyword = String(keyword || '').trim();
    const params = {
      page: 0,
      size: 20,
      sortType: normalizedSortType,
      ...(category && category !== '전체' ? { category } : {}),
      ...(trimmedKeyword ? { title: trimmedKeyword, content: trimmedKeyword } : {}),
    };
    const response = await communityPostApi.list(params);
    const list = extractList(extractPayload(response));
    if (list.length > 0) {
      const normalizedList = list.map((item, index) => normalizeCommunityPost(item, index));
      const hydratedList = await hydrateWorkoutMetaFromDetail(normalizedList);
      posts.value = sortPostsByType(hydratedList, normalizedSortType);
    } else {
      posts.value = [];
    }
  } catch (error) {
    posts.value = [];
    postLoadError.value = toFriendlyApiError(error);
    console.error('Failed to load community posts:', error);
  } finally {
    isLoadingPosts.value = false;
  }
};

const openPost = (post) => {
  if (!post?.id) return;
  router.push({ path: `/community/${post.id}`, query: buildListQuery() });
};

const handleCategoryChange = (category) => {
  selectedCategory.value = category;
  syncListQuery();
  loadPosts(category, searchTerm.value, selectedSortType.value);
};

const applySearch = () => {
  syncListQuery();
  loadPosts(selectedCategory.value, searchTerm.value, selectedSortType.value);
};
const clearSearch = () => {
  if (!hasSearchTerm.value && searchSuggestions.value.length === 0) return;
  searchTerm.value = '';
  searchSuggestions.value = [];
  isSuggestLoading.value = false;
  syncListQuery();
  loadPosts(selectedCategory.value, '', selectedSortType.value);
};
const handleSearchFocus = () => {
  isSearchFocused.value = true;
};
const handleSearchBlur = () => {
  window.setTimeout(() => {
    isSearchFocused.value = false;
  }, 120);
};
const applySuggestion = (suggestion) => {
  const next = String(suggestion || '').trim();
  if (!next) return;
  searchTerm.value = next;
  isSearchFocused.value = false;
  searchSuggestions.value = [];
  syncListQuery();
  loadPosts(selectedCategory.value, next, selectedSortType.value);
};

const normalizeSuggestionText = (value) => String(value || '')
  .replace(/\s+/g, ' ')
  .trim();

const buildSuggestions = (items, keyword) => {
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();
  if (!normalizedKeyword) return [];
  const seen = new Set();
  const suggestions = [];
  const push = (value) => {
    const text = normalizeSuggestionText(value);
    if (!text) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(text);
  };

  items.forEach((item = {}) => {
    const title = normalizeSuggestionText(item.title);
    const excerpt = normalizeSuggestionText(item.excerpt || item.content || item.contents);
    if (title && title.toLowerCase().includes(normalizedKeyword)) push(title);
    if (excerpt && excerpt.toLowerCase().includes(normalizedKeyword)) push(excerpt);

    const tokens = `${title} ${excerpt}`
      .match(/[0-9A-Za-z가-힣_#]{2,}/g) || [];
    tokens
      .filter((token) => token.toLowerCase().includes(normalizedKeyword))
      .forEach((token) => push(token));
  });

  return suggestions.slice(0, 8);
};

const fetchSuggestions = async (keyword) => {
  const trimmedKeyword = String(keyword || '').trim();
  if (trimmedKeyword.length < 2) {
    searchSuggestions.value = [];
    isSuggestLoading.value = false;
    return;
  }

  const requestId = ++suggestRequestId;
  isSuggestLoading.value = true;
  try {
    const response = await communityPostApi.list({
      page: 0,
      size: 12,
      sortType: 'LATEST',
      ...(selectedCategory.value !== '전체' ? { category: selectedCategory.value } : {}),
      title: trimmedKeyword,
      content: trimmedKeyword,
    });
    if (requestId !== suggestRequestId) return;
    const list = extractList(extractPayload(response));
    searchSuggestions.value = buildSuggestions(list, trimmedKeyword);
  } catch (error) {
    if (requestId !== suggestRequestId) return;
    searchSuggestions.value = [];
  } finally {
    if (requestId === suggestRequestId) {
      isSuggestLoading.value = false;
    }
  }
};

const handleSortChange = (sortType) => {
  selectedSortType.value = normalizeSortType(sortType);
  syncListQuery();
  loadPosts(selectedCategory.value, searchTerm.value, selectedSortType.value);
};
const selectSortType = (sortType) => {
  const normalized = normalizeSortType(sortType);
  isSortMenuOpen.value = false;
  if (normalized === selectedSortType.value) return;
  handleSortChange(normalized);
};
const toggleSortMenu = () => {
  isSortMenuOpen.value = !isSortMenuOpen.value;
};
const handleOutsideClick = (event) => {
  if (!isSortMenuOpen.value) return;
  const target = event?.target;
  const clickedSortDropdown = target instanceof Element && target.closest('.v-sort-dropdown');
  if (!clickedSortDropdown) {
    isSortMenuOpen.value = false;
  }
};

const toggleLike = async (postId) => {
  try {
    const response = await communityLikeApi.toggle(postId);
    const payload = response?.data?.data ?? response?.data?.result ?? response?.data ?? {};
    const liked = payload?.liked;
    const likeCount = payload?.likeCount;
    posts.value = posts.value.map((post) => {
      if (post.id !== postId) return post;
      const nextLiked = liked ?? !post.liked;
      return {
        ...post,
        liked: nextLiked,
        likes: likeCount ?? Math.max(0, Number(post.likes || 0) + (nextLiked ? 1 : -1)),
      };
    });
  } catch (error) {
    console.error('Failed to toggle like:', error);
  }
};

const toFriendlyReportError = (error) => {
  const status = Number(error?.response?.status || 0);
  if (status === 401) return '로그인이 필요합니다.';
  if (status === 403) return '신고 권한이 없습니다.';
  if (status === 404) return '신고 대상을 찾을 수 없습니다.';
  if (status >= 500) return '서버 오류로 신고에 실패했습니다.';
  if (!error?.response) return '백엔드 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
  return '신고 처리에 실패했습니다.';
};

const reportPost = async (post) => {
  const postId = Number(post?.id || 0);
  if (!postId) return;

  const reasonInput = window.prompt('신고 사유를 입력해주세요. (5~500자)');
  if (reasonInput === null) return;

  const reason = String(reasonInput || '').trim();
  if (reason.length < 5 || reason.length > 500) {
    window.alert('신고 사유는 5자 이상 500자 이하로 입력해주세요.');
    return;
  }

  isReportingPostId.value = post.id;
  try {
    await reportApi.create({
      refId: postId,
      refType: 'POST',
      reason,
    });
    window.alert('신고가 접수되었습니다.');
  } catch (error) {
    window.alert(toFriendlyReportError(error));
  } finally {
    isReportingPostId.value = null;
  }
};

watch(searchTerm, (nextKeyword) => {
  if (suggestDebounceTimer) {
    clearTimeout(suggestDebounceTimer);
    suggestDebounceTimer = null;
  }
  const trimmedKeyword = String(nextKeyword || '').trim();
  if (trimmedKeyword.length < 2) {
    searchSuggestions.value = [];
    isSuggestLoading.value = false;
    return;
  }
  suggestDebounceTimer = window.setTimeout(() => {
    fetchSuggestions(trimmedKeyword);
  }, 300);
});

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
  const refId = String(route.query?.refId || '').trim();
  const queryCategory = String(route.query?.category || '').trim();
  const queryKeyword = String(route.query?.q || '').trim();
  const querySortType = normalizeSortType(route.query?.sortType);

  if (queryCategory && categories.includes(queryCategory)) {
    selectedCategory.value = queryCategory;
  }
  if (queryKeyword) {
    searchTerm.value = queryKeyword;
  }
  selectedSortType.value = querySortType;

  if (refId) {
    router.replace({
      path: `/community/${encodeURIComponent(refId)}`,
      query: {
        ...buildListQuery(),
      },
    });
    return;
  }

  loadPosts(selectedCategory.value, searchTerm.value, selectedSortType.value);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick);
  if (suggestDebounceTimer) {
    clearTimeout(suggestDebounceTimer);
    suggestDebounceTimer = null;
  }
});
</script>
