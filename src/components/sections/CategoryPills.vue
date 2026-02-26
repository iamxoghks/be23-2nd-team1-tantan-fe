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
        :key="category.name"
        class="sx-components-sections-categorypills-002"
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
        class="category-pill-more-item"
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

const categories = [
  { name: '헬스장', material: 'fitness_center', color: '#0068ff' },
  { name: 'PT', material: 'person', color: '#ff4b4b' },
  { name: '요가', material: 'self_improvement', color: '#00c73c' },
  { name: '필라테스', material: 'accessibility_new', color: '#9b59b6' },
  { name: '골프', material: 'golf_course', color: '#f1c40f' },
  { name: '수영', material: 'pool', color: '#3498db' },
  { name: '크로스핏', material: 'local_fire_department', color: '#e67e22' },
  { name: '클라이밍', material: 'terrain', color: '#8e44ad' },
  { name: '복싱', material: 'sports_martial_arts', color: '#e74c3c' },
  { name: '테니스', material: 'sports_tennis', color: '#2ecc71' },
  { name: '배드민턴', material: 'sports_tennis', color: '#1abc9c' },
];

const renderedCategories = computed(() =>
  isDesktop.value && hasOverflow.value ? visibleCategories.value : categories,
);

const handleWheel = (event) => {
  if (!pillScroller.value) return;
  pillScroller.value.scrollLeft += event.deltaY + event.deltaX;
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

const updateDesktopOverflow = () => {
  if (!rootEl.value) return;
  isDesktop.value = window.matchMedia('(min-width: 768px)').matches;

  if (!isDesktop.value) {
    hasOverflow.value = false;
    visibleCategories.value = categories;
    hiddenCategories.value = [];
    return;
  }

  const widths = measureButtons.value.map((el) => el.offsetWidth || 0);
  if (widths.length !== categories.length) return;

  const gap = 8;
  const available = rootEl.value.clientWidth;
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1);

  if (totalWidth <= available) {
    hasOverflow.value = false;
    visibleCategories.value = categories;
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
  visibleCategories.value = categories.slice(0, safeCount);
  hiddenCategories.value = categories.slice(safeCount);
  hasOverflow.value = hiddenCategories.value.length > 0;
};

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick);
  nextTick(() => {
    updateDesktopOverflow();
  });
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
