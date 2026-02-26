<template>
  <div class="v-community-write-screen">
    <div class="sx-views-community-communitywriteview-001">
      <header class="v-write-header">
        <div class="v-layer-10">
          <RouterLink to="/community" class="sx-views-community-communitywriteview-002">
            <X class="v-icon-24-dark" />
          </RouterLink>
        </div>
        <h1 class="v-write-header-title">글쓰기</h1>
        <button :disabled="isSubmitting || isContentOverLimit" class="v-write-submit-btn v-layer-10" @click="handleCreatePost">
          {{ isSubmitting ? '등록 중...' : '등록' }}
        </button>
      </header>

      <main class="sx-views-community-communitywriteview-003">
        <div class="v-write-pill-row">
          <button
            v-for="category in categoryPills"
            :key="category"
            class="v-write-pill-btn"
            :class="selectedCategory === category ? 'v-write-pill-active' : 'v-write-pill-inactive'"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <div class="v-community-write-form">
          <input v-model="title" type="text" placeholder="제목을 입력하세요" class="v-write-title-input v-focus-ring-0 v-placeholder-title" />
          <div class="v-write-divider" />
          <div
            ref="contentEditorRef"
            class="v-write-content-input v-focus-ring-0 v-placeholder-content"
            :class="{ 'is-over-limit': isContentOverLimit }"
            contenteditable="true"
            role="textbox"
            aria-multiline="true"
            data-placeholder="내용을 입력하세요. (운동 기록 공유 시 프로필의 잔디 데이터가 자동으로 첨부될 수 있습니다)"
            @input="onContentInput"
            @blur="onContentBlur"
            @paste="onContentPaste"
            @compositionstart="onContentCompositionStart"
            @compositionend="onContentCompositionEnd"
          ></div>
          <p class="v-write-content-count" :class="{ 'is-over-limit': isContentOverLimit }">
            {{ isContentOverLimit ? contentRemaining : `${contentLength}/${CONTENT_MAX_LENGTH}` }}
          </p>

          <div v-if="attachedWorkout" class="v-write-workout-card">
            <div class="v-write-workout-top">
              <div class="v-write-workout-icon-wrap">
                <Calendar class="v-icon-24-brand-green" />
              </div>
              <div class="v-write-workout-meta">
                <div class="v-write-workout-title">{{ attachedWorkout.title }}</div>
                <div class="v-write-workout-subtitle">{{ attachedWorkout.subtitle }}</div>
              </div>
            </div>

            <div class="v-write-workout-grass">
              <span
                v-for="idx in 12"
                :key="idx"
                class="v-write-grass-dot"
                :class="idx <= attachedWorkout.dotCount ? 'v-write-grass-dot-on' : ''"
              />
            </div>
            <div class="v-write-workout-extra">{{ attachedWorkout.meta }}</div>

            <button class="v-write-workout-close" @click="clearAttachedWorkout">
              <X class="v-icon-20-muted" />
            </button>
          </div>

          <p v-if="errorMessage" class="u-text-error-xs">{{ errorMessage }}</p>
          <p v-if="selectedImages.length > 0" class="v-write-selected-count">{{ selectedImages.length }}개 이미지 선택됨</p>
          <div v-if="imagePreviews.length > 0" class="sx-views-community-communitywriteview-005">
            <div v-for="(preview, index) in imagePreviews" :key="preview.id" class="sx-views-community-communitywriteview-006">
              <img :src="preview.url" alt="첨부 이미지 미리보기" class="v-cover-image" />
              <button class="ui-thumb-delete v-thumb-delete-hover" @click="removeSelectedImage(index)">
                <X class="v-icon-14" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer class="v-write-footer v-shrink-0">
        <div class="sx-views-community-communitywriteview-007">
          <label class="ui-icon-text-action v-text-hover-blue v-cursor-pointer v-shrink-0">
            <ImageIcon class="u-icon-20" /><span class="u-hidden-md-inline-14">사진</span>
            <input class="ux-views-community-communitywriteview-001" type="file" multiple accept="image/*" @change="handleImageChange" />
          </label>
          <button class="ui-icon-text-action u-hover-blue v-shrink-0"><Film class="u-icon-20" /><span class="u-hidden-md-inline-14">동영상</span></button>
          <button class="ui-icon-text-action u-hover-blue v-shrink-0"><LinkIcon class="u-icon-20" /><span class="u-hidden-md-inline-14">링크</span></button>
          <button class="v-write-attach-btn" @click="toggleWorkoutSelector"><Grid class="u-icon-20" /><span class="v-text-12-md14">기록 첨부</span></button>
        </div>

        <div class="sx-views-community-communitywriteview-008">
          <span class="v-text-12-md14-dark">익명</span>
          <button class="v-toggle-switch" :class="isAnonymous ? 'v-toggle-on' : 'v-toggle-off'" @click="isAnonymous = !isAnonymous"><div class="v-toggle-knob" :class="isAnonymous ? 'v-toggle-knob-on' : 'v-toggle-knob-off'" /></button>
        </div>

        <div v-if="showWorkoutSelector" class="v-popover-panel">
          <div class="v-popover-head"><h3 class="v-popover-title">내 운동 기록 선택</h3><button class="sx-views-community-communitywriteview-009" @click="showWorkoutSelector = false"><X class="v-icon-16-muted" /></button></div>
          <div v-if="isLoadingTodayWorkouts" class="v-popover-state">오늘 운동 기록을 불러오는 중입니다.</div>
          <p v-else-if="workoutSelectorError" class="v-popover-error">{{ workoutSelectorError }}</p>
          <div v-else-if="todayWorkoutOptions.length > 0" class="v-popover-record-list">
            <button
              v-for="workout in todayWorkoutOptions"
              :key="workout.id"
              class="v-popover-card v-popover-record-btn"
              :class="isAttachedWorkout(workout) ? 'v-popover-record-active' : ''"
              @click="selectWorkout(workout)"
            >
              <div class="sx-views-community-communitywriteview-010">
                <span class="v-text-12-md13-brand">{{ workout.dateLabel }}</span>
                <div class="v-popover-dots">
                  <span
                    v-for="idx in 3"
                    :key="`popover-dot-${workout.id}-${idx}`"
                    class="v-popover-dot"
                    :class="idx <= workout.dotPreview ? 'v-popover-dot-on' : ''"
                  />
                </div>
              </div>
              <div class="v-text-11-muted">{{ workout.subtitle }}</div>
              <div class="v-popover-streak">{{ workout.meta }}</div>
            </button>
          </div>
          <div v-else class="v-popover-state">오늘 운동기록이 없습니다.</div>
          <button class="v-popover-link" @click="goToProfileActivity"><span>내 활동 잔디 보기</span><ChevronRight class="v-icon-14" /></button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { X, Image as ImageIcon, Film, Link as LinkIcon, Grid, ChevronRight, Calendar } from 'lucide-vue-next';
import { communityPostApi, workoutApi } from '@/services/apis';

const categoryPills = [
  '자유게시판',
  '운동 공유',
  '운동 꿀팁',
  '헬스장 리뷰',
  '식단 공유',
  '질문게시판',
];
const selectedCategory = ref(categoryPills[0]);
const showWorkoutSelector = ref(false);
const attachedWorkout = ref(null);
const isAnonymous = ref(false);
const title = ref('');
const content = ref('');
const contentEditorRef = ref(null);
const isContentComposing = ref(false);
const selectedImages = ref([]);
const imagePreviews = ref([]);
const isSubmitting = ref(false);
const errorMessage = ref('');
const todayWorkoutOptions = ref([]);
const isLoadingTodayWorkouts = ref(false);
const workoutSelectorError = ref('');
const route = useRoute();
const router = useRouter();
const CONTENT_MAX_LENGTH = 3000;

const contentChars = computed(() => Array.from(String(content.value || '')));
const contentLength = computed(() => contentChars.value.length);
const contentRemaining = computed(() => CONTENT_MAX_LENGTH - contentLength.value);
const isContentOverLimit = computed(() => contentRemaining.value < 0);
const contentSafeText = computed(() => contentChars.value.slice(0, CONTENT_MAX_LENGTH).join(''));
const contentOverflowText = computed(() => contentChars.value.slice(CONTENT_MAX_LENGTH).join(''));

const normalizePostContent = (value) => (
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
);

const codePointLength = (value) => Array.from(String(value || '')).length;

const codePointToCodeUnitIndex = (text, codePointIndex) => {
  if (codePointIndex <= 0) return 0;
  let consumedCodePoints = 0;
  let codeUnitIndex = 0;
  for (const char of String(text || '')) {
    if (consumedCodePoints >= codePointIndex) break;
    consumedCodePoints += 1;
    codeUnitIndex += char.length;
  }
  return codeUnitIndex;
};

const getSelectionOffsetsInEditor = (editor) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return null;

  const startRange = document.createRange();
  startRange.selectNodeContents(editor);
  startRange.setEnd(range.startContainer, range.startOffset);

  const endRange = document.createRange();
  endRange.selectNodeContents(editor);
  endRange.setEnd(range.endContainer, range.endOffset);

  return {
    start: codePointLength(startRange.toString()),
    end: codePointLength(endRange.toString()),
  };
};

const resolveEditorPositionByOffset = (editor, codePointOffset) => {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let remaining = Math.max(0, codePointOffset);
  let node = walker.nextNode();

  while (node) {
    const text = node.textContent || '';
    const nodeCodePointLength = codePointLength(text);
    if (remaining <= nodeCodePointLength) {
      return {
        node,
        offset: codePointToCodeUnitIndex(text, remaining),
      };
    }
    remaining -= nodeCodePointLength;
    node = walker.nextNode();
  }

  return {
    node: editor,
    offset: editor.childNodes.length,
  };
};

const setSelectionOffsetsInEditor = (editor, start, end = start) => {
  const selection = window.getSelection();
  if (!selection) return;
  const normalizedStart = Math.max(0, start);
  const normalizedEnd = Math.max(normalizedStart, end);
  const startPos = resolveEditorPositionByOffset(editor, normalizedStart);
  const endPos = resolveEditorPositionByOffset(editor, normalizedEnd);

  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  selection.removeAllRanges();
  selection.addRange(range);
};

const renderContentEditor = ({ preserveSelection = false } = {}) => {
  const editor = contentEditorRef.value;
  if (!editor) return;

  const selectionOffsets = preserveSelection ? getSelectionOffsetsInEditor(editor) : null;
  const safeText = contentSafeText.value;
  const overflowText = contentOverflowText.value;

  editor.replaceChildren();

  if (safeText) {
    editor.appendChild(document.createTextNode(safeText));
  }

  if (overflowText) {
    const overflowSpan = document.createElement('span');
    overflowSpan.className = 'v-write-content-overflow';
    overflowSpan.textContent = overflowText;
    editor.appendChild(overflowSpan);
  }

  if (!selectionOffsets) return;

  const maxOffset = contentLength.value;
  setSelectionOffsetsInEditor(
    editor,
    Math.min(selectionOffsets.start, maxOffset),
    Math.min(selectionOffsets.end, maxOffset),
  );
};

const clearContentOverflowMarkup = ({ preserveSelection = false } = {}) => {
  const editor = contentEditorRef.value;
  if (!editor) return;
  if (!editor.querySelector('.v-write-content-overflow')) return;

  const selectionOffsets = preserveSelection ? getSelectionOffsetsInEditor(editor) : null;
  const plain = normalizePostContent(editor.innerText);
  editor.textContent = plain;

  if (!selectionOffsets) return;
  const maxOffset = codePointLength(plain);
  setSelectionOffsetsInEditor(
    editor,
    Math.min(selectionOffsets.start, maxOffset),
    Math.min(selectionOffsets.end, maxOffset),
  );
};

const syncContentFromEditor = ({ preserveSelection = true, forceDecorate = false } = {}) => {
  const editor = contentEditorRef.value;
  if (!editor) return;
  const plain = normalizePostContent(editor.innerText);
  content.value = plain;

  const overLimit = codePointLength(plain) > CONTENT_MAX_LENGTH;
  if (forceDecorate || overLimit) {
    renderContentEditor({ preserveSelection });
    return;
  }

  clearContentOverflowMarkup({ preserveSelection });
};

const onContentInput = () => {
  if (isContentComposing.value) {
    const editor = contentEditorRef.value;
    if (!editor) return;
    content.value = normalizePostContent(editor.innerText);
    return;
  }
  syncContentFromEditor({ preserveSelection: true, forceDecorate: false });
};

const onContentBlur = () => {
  syncContentFromEditor({ preserveSelection: false, forceDecorate: false });
};

const onContentCompositionStart = () => {
  isContentComposing.value = true;
};

const onContentCompositionEnd = () => {
  isContentComposing.value = false;
  syncContentFromEditor({ preserveSelection: true, forceDecorate: false });
};

const insertPlainTextAtCursor = (text) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  selection.deleteFromDocument();
  const range = selection.getRangeAt(0);
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const onContentPaste = (event) => {
  event.preventDefault();
  const text = normalizePostContent(event.clipboardData?.getData('text/plain') || '');
  insertPlainTextAtCursor(text);
  syncContentFromEditor({ preserveSelection: true, forceDecorate: false });
};

const toDateParam = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateOnly = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const direct = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(direct)) return direct;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return toDateParam(parsed);
};

const resolveWorkoutLookupDate = () => {
  const candidates = [
    route.query?.workoutDate,
    route.query?.postDate,
    route.query?.createdTime,
    route.query?.date,
  ];
  for (const candidate of candidates) {
    const dateOnly = toDateOnly(candidate);
    if (dateOnly) return dateOnly;
  }
  return toDateParam();
};

const formatWorkoutDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '오늘 운동 기록';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 운동 기록`;
};

const formatWorkoutTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

const extractListPayload = (raw = {}) => {
  const payload = raw?.data ?? raw?.result ?? raw;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload)) return payload;
  return [];
};

const normalizeTodayWorkout = (item, index) => {
  const workoutId = item?.workoutId ?? item?.id ?? item?.attachWorkoutId ?? null;
  const workoutDate = item?.workoutDate ?? item?.createdTime ?? item?.createdAt ?? item?.date ?? '';
  const details = Array.isArray(item?.workoutDetailList)
    ? item.workoutDetailList
    : Array.isArray(item?.workoutDetails)
      ? item.workoutDetails
    : Array.isArray(item?.workoutDetailCreateDtoList)
      ? item.workoutDetailCreateDtoList
      : [];
  const detailNames = details.map((detail) => detail?.workoutName).filter(Boolean);
  const subtitle = detailNames.join(', ')
    || item?.gymName
    || item?.subtitle
    || item?.workoutCondition
    || item?.title
    || '운동 기록';
  const totalSets = Number(item?.totalSets ?? item?.setCount ?? details.length ?? 0);
  const totalVolume = Number(item?.totalVolume ?? 0);
  const streak = Number(item?.streakDays ?? item?.streak ?? 0);

  let meta = '오늘 기록';
  if (totalVolume > 0) {
    meta = `총 볼륨 ${totalVolume.toLocaleString()}kg`;
  } else if (totalSets > 0) {
    meta = `총 ${totalSets}세트`;
  } else if (streak > 0) {
    meta = `연속 ${streak}일 달성 중!`;
  } else if (item?.meta) {
    meta = String(item.meta);
  }

  const normalizedSetCount = Number.isFinite(totalSets) && totalSets > 0 ? totalSets : detailNames.length;
  const dotCount = Math.max(3, Math.min(normalizedSetCount || 3, 12));

  return {
    id: workoutId ?? `today-workout-${index + 1}`,
    workoutId,
    dateLabel: formatWorkoutTime(workoutDate) ? `오늘 ${formatWorkoutTime(workoutDate)}` : '오늘',
    title: formatWorkoutDate(workoutDate),
    subtitle,
    meta,
    dotCount,
    dotPreview: Math.max(1, Math.min(3, Math.ceil(dotCount / 4))),
  };
};

const fetchTodayWorkouts = async () => {
  isLoadingTodayWorkouts.value = true;
  workoutSelectorError.value = '';

  try {
    const targetDate = resolveWorkoutLookupDate();
    const response = await workoutApi.day(targetDate, {
      page: 0,
      size: 20,
      sort: 'workoutDate,desc',
    });
    const list = extractListPayload(response.data);
    if (!Array.isArray(list) || list.length === 0) {
      todayWorkoutOptions.value = [];
      if (attachedWorkout.value) attachedWorkout.value = null;
      return;
    }
    const onlyTodayList = list.map((item, index) => normalizeTodayWorkout(item, index));

    todayWorkoutOptions.value = onlyTodayList;

    if (attachedWorkout.value) {
      const matched = onlyTodayList.find((item) => String(item.id) === String(attachedWorkout.value.id));
      attachedWorkout.value = matched || null;
    }
  } catch (error) {
    todayWorkoutOptions.value = [];
    const status = Number(error?.response?.status || 0);
    if (status === 401) {
      workoutSelectorError.value = '로그인 후 오늘 운동 기록을 선택할 수 있습니다.';
    } else {
      workoutSelectorError.value = '오늘 운동 기록을 불러오지 못했습니다.';
    }
    console.error('Failed to load today workouts:', error);
  } finally {
    isLoadingTodayWorkouts.value = false;
  }
};

const toggleWorkoutSelector = async () => {
  showWorkoutSelector.value = !showWorkoutSelector.value;
  if (showWorkoutSelector.value) {
    await fetchTodayWorkouts();
  }
};

const selectWorkout = (workout) => {
  attachedWorkout.value = workout;
  showWorkoutSelector.value = false;
};

const clearAttachedWorkout = () => {
  attachedWorkout.value = null;
};

const isAttachedWorkout = (workout) => (
  Boolean(attachedWorkout.value) && String(attachedWorkout.value.id) === String(workout.id)
);

const goToProfileActivity = () => {
  showWorkoutSelector.value = false;
  router.push('/profile');
};

const selectedWorkoutId = computed(() => {
  const rawId = attachedWorkout.value?.workoutId;
  if (rawId === undefined || rawId === null || rawId === '') return null;
  const numberId = Number(rawId);
  return Number.isNaN(numberId) ? rawId : numberId;
});

const handleImageChange = (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const previews = files.map((file) => ({
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    url: URL.createObjectURL(file),
  }));

  selectedImages.value = [...selectedImages.value, ...files];
  imagePreviews.value = [...imagePreviews.value, ...previews];
  event.target.value = '';
};

const removeSelectedImage = (index) => {
  const target = imagePreviews.value[index];
  if (target?.url) URL.revokeObjectURL(target.url);

  imagePreviews.value = imagePreviews.value.filter((_, idx) => idx !== index);
  selectedImages.value = selectedImages.value.filter((_, idx) => idx !== index);
};

const handleCreatePost = async () => {
  syncContentFromEditor({ preserveSelection: false });

  if (!title.value || !String(content.value || '').trim()) {
    errorMessage.value = '제목과 내용을 입력해주세요.';
    return;
  }

  if (isContentOverLimit.value) {
    errorMessage.value = `내용은 ${CONTENT_MAX_LENGTH}자까지 입력할 수 있습니다.`;
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const postPayload = {
      title: title.value,
      content: content.value,
      category: selectedCategory.value,
    };

    if (selectedWorkoutId.value !== null) {
      postPayload.workoutId = selectedWorkoutId.value;
    }

    await communityPostApi.create({
      post: postPayload,
      images: selectedImages.value,
    });

    router.push('/community');
  } catch (error) {
    errorMessage.value = '게시글 등록에 실패했습니다.';
    console.error('Create community post failed:', error);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  await nextTick();
  renderContentEditor();
});

onBeforeUnmount(() => {
  imagePreviews.value.forEach((preview) => {
    if (preview.url) URL.revokeObjectURL(preview.url);
  });
});
</script>
