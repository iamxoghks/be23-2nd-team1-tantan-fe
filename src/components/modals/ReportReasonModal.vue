<template>
  <Teleport to="body">
    <div v-if="open" class="v-report-modal-backdrop" @click.self="emitClose">
      <div class="v-report-modal">
        <h3 class="v-report-modal-title">{{ title }}</h3>
        <p class="v-report-modal-desc">{{ description }}</p>
        <div
          ref="editorRef"
          class="v-report-textarea"
          :class="{ 'is-over-limit': isReasonOverLimit }"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          data-placeholder="신고 사유를 입력해주세요."
          @input="onEditorInput"
          @blur="syncReasonFromEditor({ preserveSelection: false })"
          @paste="onEditorPaste"
          @compositionstart="isComposing = true"
          @compositionend="onEditorCompositionEnd"
        ></div>
        <div class="v-report-modal-meta">
          <span v-if="errorMessage" class="v-report-error">{{ errorMessage }}</span>
          <div class="v-report-meter-group">
            <div class="v-report-meter" aria-hidden="true">
              <svg viewBox="0 0 28 28" class="v-report-meter-svg">
                <circle class="v-report-meter-track" cx="14" cy="14" r="10" />
                <circle
                  class="v-report-meter-progress"
                  :class="{ 'is-over-limit': isReasonOverLimit }"
                  cx="14"
                  cy="14"
                  r="10"
                  :style="{
                    strokeDasharray: `${REPORT_REASON_METER_CIRCUMFERENCE} ${REPORT_REASON_METER_CIRCUMFERENCE}`,
                    strokeDashoffset: `${reportReasonMeterDashOffset}`,
                  }"
                />
              </svg>
            </div>
            <span class="v-report-count" :class="{ 'is-over-limit': isReasonOverLimit }">
              {{ reportReasonCountLabel }}
            </span>
          </div>
        </div>
        <div class="v-report-actions">
          <button type="button" class="v-report-cancel" :disabled="submitting" @click="emitClose">취소</button>
          <button type="button" class="v-report-submit" :disabled="submitting" @click="$emit('submit')">
            {{ submitting ? submittingLabel : submitLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';

const REPORT_REASON_MAX_LENGTH = 500;
const REPORT_REASON_METER_RADIUS = 10;
const REPORT_REASON_METER_CIRCUMFERENCE = 2 * Math.PI * REPORT_REASON_METER_RADIUS;

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
    default: '',
  },
  errorMessage: {
    type: String,
    default: '',
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '신고하기',
  },
  description: {
    type: String,
    default: '신고 사유를 입력해주세요. 5자 이상 500자 이하로 작성 가능합니다.',
  },
  submitLabel: {
    type: String,
    default: '신고 접수',
  },
  submittingLabel: {
    type: String,
    default: '접수 중...',
  },
});

const emit = defineEmits(['update:reason', 'close', 'submit']);
const editorRef = ref(null);
const internalReason = ref(String(props.reason || ''));
const isComposing = ref(false);

const normalizeReasonText = (value) => (
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

const safeReasonText = computed(() => Array.from(internalReason.value).slice(0, REPORT_REASON_MAX_LENGTH).join(''));
const overflowReasonText = computed(() => Array.from(internalReason.value).slice(REPORT_REASON_MAX_LENGTH).join(''));
const reportReasonLength = computed(() => Array.from(String(internalReason.value || '')).length);
const reportReasonRemaining = computed(() => REPORT_REASON_MAX_LENGTH - reportReasonLength.value);
const isReasonOverLimit = computed(() => reportReasonRemaining.value < 0);
const reportReasonCountLabel = computed(() => (
  isReasonOverLimit.value ? String(reportReasonRemaining.value) : `${reportReasonLength.value}/${REPORT_REASON_MAX_LENGTH}`
));
const reportReasonMeterRatio = computed(() => Math.min(reportReasonLength.value / REPORT_REASON_MAX_LENGTH, 1));
const reportReasonMeterDashOffset = computed(() => (
  REPORT_REASON_METER_CIRCUMFERENCE * (1 - reportReasonMeterRatio.value)
));

const renderEditor = ({ preserveSelection = false } = {}) => {
  const editor = editorRef.value;
  if (!editor) return;

  const selectionOffsets = preserveSelection ? getSelectionOffsetsInEditor(editor) : null;
  const safeText = safeReasonText.value;
  const overflowText = overflowReasonText.value;

  editor.replaceChildren();

  if (safeText) {
    editor.appendChild(document.createTextNode(safeText));
  }

  if (overflowText) {
    const overflowSpan = document.createElement('span');
    overflowSpan.className = 'v-report-textarea-overflow';
    overflowSpan.textContent = overflowText;
    editor.appendChild(overflowSpan);
  }

  if (!selectionOffsets) return;

  const maxOffset = reportReasonLength.value;
  setSelectionOffsetsInEditor(
    editor,
    Math.min(selectionOffsets.start, maxOffset),
    Math.min(selectionOffsets.end, maxOffset),
  );
};

const updateReason = (nextReason, options = {}) => {
  internalReason.value = normalizeReasonText(nextReason);
  renderEditor({ preserveSelection: options.preserveSelection ?? false });
  emit('update:reason', internalReason.value);
};

const syncReasonFromEditor = ({ preserveSelection = true } = {}) => {
  const editor = editorRef.value;
  if (!editor) return;
  updateReason(editor.innerText, { preserveSelection });
};

const onEditorInput = () => {
  if (isComposing.value) return;
  syncReasonFromEditor({ preserveSelection: true });
};

const onEditorPaste = (event) => {
  event.preventDefault();
  const pastedText = event.clipboardData?.getData('text/plain') || '';
  document.execCommand('insertText', false, pastedText);
};

const onEditorCompositionEnd = () => {
  isComposing.value = false;
  syncReasonFromEditor({ preserveSelection: true });
};

const emitClose = () => {
  if (props.submitting) return;
  emit('close');
};

watch(
  () => props.reason,
  (nextReason) => {
    const normalizedReason = normalizeReasonText(nextReason);
    if (normalizedReason === internalReason.value) return;
    internalReason.value = normalizedReason;
    renderEditor({ preserveSelection: false });
  },
  { immediate: true },
);

watch(
  () => props.open,
  async (nextOpen) => {
    if (!nextOpen) return;
    await nextTick();
    renderEditor({ preserveSelection: false });
    editorRef.value?.focus?.();
  },
);
</script>
