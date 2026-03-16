<template>
  <div ref="rootEl" class="category-pills-overlay">
    <div
      ref="pillScroller"
      class="sx-components-sections-categorypills-001"
      @wheel.prevent="handleWheel"
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
      @pointerdown.stop
    >
      <button
        v-for="category in renderedCategories"
        :key="category.id || category.code || category.name"
        :class="[
          'sx-components-sections-categorypills-002',
          isCategorySelected(category) ? 'category-pill-button-active' : '',
        ]"
        type="button"
        :aria-pressed="isCategorySelected(category)"
        @click="handleCategoryClick(category)"
      >
        <span class="category-pill-icon material-symbols-rounded" :style="{ color: category.color }">
          {{ category.material }}
        </span>
        <span class="category-pill-label">{{ category.name }}</span>
      </button>
    </div>

    <button
      v-if="isDesktop && hasOverflow"
      class="category-pill-more-btn"
      aria-label="카테고리 더보기"
      @click="toggleMorePanel"
    >
      <span class="category-pill-more-dot" />
      <span class="category-pill-more-dot" />
      <span class="category-pill-more-dot" />
    </button>

    <div v-if="isDesktop && hasOverflow && isMoreOpen" class="category-pill-more-panel">
      <button
        v-for="category in hiddenCategories"
        :key="`more-${category.name}`"
        :class="[
          'category-pill-more-item',
          isCategorySelected(category) ? 'category-pill-more-item-active' : '',
        ]"
        type="button"
        :aria-pressed="isCategorySelected(category)"
        @click="handleCategoryClick(category)"
      >
        <span class="category-pill-icon material-symbols-rounded" :style="{ color: category.color }">
          {{ category.material }}
        </span>
        <span>{{ category.name }}</span>
      </button>
    </div>

    <div class="category-pill-measure" aria-hidden="true">
      <button
        v-for="category in categories"
        :key="`measure-${category.name}`"
        ref="measureButtons"
        class="sx-components-sections-categorypills-002"
      >
        <span class="category-pill-icon material-symbols-rounded" :style="{ color: category.color }">
          {{ category.material }}
        </span>
        <span class="category-pill-label">{{ category.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { mapApi } from '@/services/apis';
import { extractList, extractPayload } from '@/utils/api';

const props = defineProps({
  selectedCategoryName: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['select']);

const rootEl = ref(null);
const pillScroller = ref(null);
const measureButtons = ref([]);
const isMoreOpen = ref(false);
const isDesktop = ref(false);
const hasOverflow = ref(false);
const visibleCategories = ref([]);
const hiddenCategories = ref([]);
const resizeObserver = ref(null);
const rafId = ref(0);

const CATEGORY_UI_MAP = {
  dumbbell: { material: 'fitness_center', color: '#0068ff' },
  person: { material: 'person', color: '#ff4b4b' },
  yoga: { material: 'self_improvement', color: '#00c73c' },
  pilates: { material: 'accessibility_new', color: '#9b59b6' },
  golf: { material: 'golf_course', color: '#f1c40f' },
  swim: { material: 'pool', color: '#3498db' },
  crossfit: { material: 'local_fire_department', color: '#e67e22' },
  climbing: { material: 'terrain', color: '#8e44ad' },
  boxing: { material: 'sports_martial_arts', color: '#e74c3c' },
  tennis: { material: 'sports_tennis', color: '#2ecc71' },
  badminton: { material: 'sports_tennis', color: '#1abc9c' },
};

const fallbackCategories = [
  { name: '헬스장', iconKey: 'dumbbell', material: 'fitness_center', color: '#0068ff', sortOrder: 10 },
  { name: 'PT', iconKey: 'person', material: 'person', color: '#ff4b4b', sortOrder: 20 },
  { name: '요가', iconKey: 'yoga', material: 'self_improvement', color: '#00c73c', sortOrder: 30 },
  { name: '필라테스', iconKey: 'pilates', material: 'accessibility_new', color: '#9b59b6', sortOrder: 40 },
  { name: '골프', iconKey: 'golf', material: 'golf_course', color: '#f1c40f', sortOrder: 50 },
  { name: '수영', iconKey: 'swim', material: 'pool', color: '#3498db', sortOrder: 60 },
  { name: '크로스핏', iconKey: 'crossfit', material: 'local_fire_department', color: '#e67e22', sortOrder: 70 },
  { name: '클라이밍', iconKey: 'climbing', material: 'terrain', color: '#8e44ad', sortOrder: 80 },
  { name: '복싱', iconKey: 'boxing', material: 'sports_martial_arts', color: '#e74c3c', sortOrder: 90 },
  { name: '배드민턴', iconKey: 'badminton', material: 'sports_tennis', color: '#1abc9c', sortOrder: 100 },
  { name: '테니스', iconKey: 'tennis', material: 'sports_tennis', color: '#2ecc71', sortOrder: 110 },
];

const categories = ref(fallbackCategories);

const renderedCategories = computed(() =>
  isDesktop.value && hasOverflow.value ? visibleCategories.value : categories.value,
);

const isCategorySelected = (category) => {
  const current = String(props.selectedCategoryName || '').trim();
  const target = String(category?.name || '').trim();
  return current.length > 0 && current === target;
};

const handleWheel = (event) => {
  if (!pillScroller.value) return;
  pillScroller.value.scrollLeft += event.deltaY + event.deltaX;
};

const handleCategoryClick = (category) => {
  emit('select', category);
  isMoreOpen.value = false;
};

const toggleMorePanel = () => {
  isMoreOpen.value = !isMoreOpen.value;
};

const handleOutsideClick = (event) => {
  if (!rootEl.value) return;
  if (!rootEl.value.contains(event.target)) {
    isMoreOpen.value = false;
  }
};

const scheduleUpdateDesktopOverflow = () => {
  if (rafId.value) {
    cancelAnimationFrame(rafId.value);
  }
  rafId.value = requestAnimationFrame(() => {
    rafId.value = 0;
    updateDesktopOverflow();
  });
};

const normalizeCategory = (category) => {
  const ui = CATEGORY_UI_MAP[category?.iconKey] || {};

  return {
    id: category?.id ?? category?.code ?? category?.name,
    code: category?.code ?? null,
    name: category?.name ?? '',
    iconKey: category?.iconKey ?? null,
    sortOrder: Number(category?.sortOrder ?? 999),
    material: ui.material || 'category',
    color: ui.color || '#64748b',
  };
};

const loadCategories = async () => {
  try {
    const response = await mapApi.categories();
    const payload = extractPayload(response, []);
    const list = extractList(payload)
      .map(normalizeCategory)
      .filter((category) => category.name);

    if (list.length > 0) {
      categories.value = list.sort((left, right) => left.sortOrder - right.sortOrder);
    }
  } catch (error) {
    console.error('카테고리 목록을 불러오지 못했습니다.', error);
  } finally {
    await nextTick();
    updateDesktopOverflow();
  }
};

const updateDesktopOverflow = () => {
  if (!rootEl.value) return;
  isDesktop.value = window.matchMedia('(min-width: 768px)').matches;

  if (!isDesktop.value) {
    hasOverflow.value = false;
    visibleCategories.value = categories.value;
    hiddenCategories.value = [];
    return;
  }

  const widths = measureButtons.value.map((el) => el.offsetWidth || 0);
  if (widths.length !== categories.value.length) return;

  const gap = 8;
  const available = rootEl.value.clientWidth;
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1);

  if (totalWidth <= available) {
    hasOverflow.value = false;
    visibleCategories.value = categories.value;
    hiddenCategories.value = [];
    isMoreOpen.value = false;
    return;
  }

  const moreButtonWidth = 30;
  const reserve = gap + moreButtonWidth;
  let used = 0;
  let count = 0;

  for (let i = 0; i < widths.length; i += 1) {
    const nextUsed = count === 0 ? widths[i] : used + gap + widths[i];
    if (nextUsed + reserve <= available) {
      used = nextUsed;
      count += 1;
    } else {
      break;
    }
  }

  const safeCount = Math.max(1, count);
  visibleCategories.value = categories.value.slice(0, safeCount);
  hiddenCategories.value = categories.value.slice(safeCount);
  hasOverflow.value = hiddenCategories.value.length > 0;
};

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick);
  loadCategories();
  window.addEventListener('resize', scheduleUpdateDesktopOverflow);

  if (typeof ResizeObserver !== 'undefined' && rootEl.value) {
    resizeObserver.value = new ResizeObserver(() => {
      scheduleUpdateDesktopOverflow();
    });
    resizeObserver.value.observe(rootEl.value);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  window.removeEventListener('resize', scheduleUpdateDesktopOverflow);
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
  if (rafId.value) {
    cancelAnimationFrame(rafId.value);
    rafId.value = 0;
  }
});
</script>
