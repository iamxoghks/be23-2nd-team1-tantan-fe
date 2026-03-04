<template>
  <div class="screen-rail-slate">
    <NavigationRail />

    <div class="sx-views-user-profile-profilehistoryview-001">
      <div class="v-profile-history-wrap">
        <div class="sx-views-community-communityview-016">
          <RouterLink :to="profileLink" class="v-history-back-btn">
            <ArrowLeft class="v-icon-18-md20" />
          </RouterLink>
          <div>
            <h1 class="v-history-title">
              <UserRound class="v-history-title-icon" />
              {{ isGymOwner ? '시설 정보 수정' : '프로필 관리' }}
            </h1>
            <p class="v-profile-history-subtitle">
              {{ isGymOwner ? '헬스장 운영 정보를 수정하세요.' : '프로필 정보와 계정을 관리하세요.' }}
            </p>
          </div>
        </div>

        <template v-if="isGymOwner">
          <div class="view-card owner-edit-page">
            <section class="owner-edit-section">
              <h2>기본 정보</h2>
              <div class="owner-edit-grid owner-edit-grid-2">
                <label class="owner-edit-field">
                  <span>짐 이름</span>
                  <input v-model="gymForm.name" type="text" class="v-modal-line-input" />
                </label>
                <label class="owner-edit-field">
                  <span>전화번호</span>
                  <input v-model="gymForm.tel" type="text" class="v-modal-line-input" />
                </label>
              </div>
              <label class="owner-edit-field">
                <span>주소</span>
                <input v-model="gymForm.address" type="text" class="v-modal-line-input" />
              </label>
              <label class="owner-edit-field">
                <span>카테고리 ID</span>
                <input v-model.number="gymForm.categoryId" type="number" min="1" class="v-modal-line-input" />
              </label>
              <label class="owner-edit-field">
                <span>소개</span>
                <textarea v-model="gymForm.description" rows="4" class="v-modal-line-input owner-edit-textarea" />
              </label>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isSavingGymProfile" @click="saveGymProfile">
                {{ isSavingGymProfile ? '저장 중...' : '기본 정보 저장' }}
              </button>
            </section>

            <section class="owner-edit-section">
              <h2>영업 시간</h2>
              <div class="owner-edit-hours">
                <div v-for="item in gymHours" :key="item.dayOfWeek" class="owner-edit-hour-row">
                  <span class="owner-edit-hour-day">{{ dayLabelMap[item.dayOfWeek] }}</span>
                  <label class="owner-edit-hour-closed">
                    <input v-model="item.isClosed" type="checkbox" />
                    휴무
                  </label>
                  <input v-model="item.openTime" type="time" :disabled="item.isClosed" class="v-modal-line-input" />
                  <span>~</span>
                  <input v-model="item.closeTime" type="time" :disabled="item.isClosed" class="v-modal-line-input" />
                </div>
              </div>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isSavingGymHours" @click="saveGymHours">
                {{ isSavingGymHours ? '저장 중...' : '영업 시간 저장' }}
              </button>
            </section>

            <section class="owner-edit-section">
              <h2>편의시설</h2>
              <label class="owner-edit-field">
                <span>편의시설 코드 (쉼표 구분)</span>
                <input v-model="amenitiesInput" type="text" placeholder="PARKING, SHOWER, WIFI" class="v-modal-line-input" />
              </label>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isSavingAmenities" @click="saveAmenities">
                {{ isSavingAmenities ? '저장 중...' : '편의시설 저장' }}
              </button>
            </section>

            <section class="owner-edit-section">
              <h2>짐 이미지</h2>
              <label class="owner-edit-field">
                <span>이미지 업로드</span>
                <input type="file" accept="image/*" multiple @change="handleImageChange" />
              </label>
              <p v-if="selectedImageNames.length" class="owner-edit-help">선택 파일: {{ selectedImageNames.join(', ') }}</p>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isUploadingImages || pendingImages.length === 0" @click="uploadImages">
                {{ isUploadingImages ? '업로드 중...' : '이미지 업로드' }}
              </button>
              <div v-if="gymImages.length > 0" class="owner-edit-image-grid">
                <div v-for="image in gymImages" :key="image.key" class="owner-edit-image-card">
                  <img :src="image.url" alt="짐 이미지" class="owner-edit-image-thumb" />
                  <button type="button" class="owner-edit-small-btn" :disabled="isDeletingImage || !image.id" @click="deleteImage(image)">
                    {{ isDeletingImage ? '삭제 중...' : '삭제' }}
                  </button>
                </div>
              </div>
            </section>

            <section class="owner-edit-section">
              <h2>상품</h2>
              <div class="owner-edit-row-gap">
                <div v-for="(item, idx) in products" :key="idx" class="owner-edit-product-row">
                  <input v-model="item.productName" type="text" placeholder="상품명" class="v-modal-line-input" />
                  <input v-model.number="item.price" type="number" min="0" placeholder="가격" class="v-modal-line-input" />
                  <button type="button" class="owner-edit-small-btn" @click="removeProduct(idx)">삭제</button>
                </div>
              </div>
              <div class="owner-edit-inline-actions">
                <button type="button" class="v-modal-cancel-btn owner-edit-action-btn" @click="addProduct">상품 추가</button>
                <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isSavingProducts" @click="saveProducts">
                  {{ isSavingProducts ? '저장 중...' : '상품 저장' }}
                </button>
              </div>
            </section>

            <section class="owner-edit-section">
              <h2>예외 운영시간</h2>
              <div class="owner-edit-grid owner-edit-grid-2">
                <label class="owner-edit-field">
                  <span>날짜</span>
                  <input v-model="exceptionForm.specificDate" type="date" class="v-modal-line-input" />
                </label>
                <label class="owner-edit-field">
                  <span>휴무 여부</span>
                  <input v-model="exceptionForm.isClosed" type="checkbox" />
                </label>
              </div>
              <div class="owner-edit-grid owner-edit-grid-2">
                <label class="owner-edit-field">
                  <span>오픈 시간</span>
                  <input v-model="exceptionForm.openTime" type="time" :disabled="exceptionForm.isClosed" class="v-modal-line-input" />
                </label>
                <label class="owner-edit-field">
                  <span>마감 시간</span>
                  <input v-model="exceptionForm.closeTime" type="time" :disabled="exceptionForm.isClosed" class="v-modal-line-input" />
                </label>
              </div>
              <label class="owner-edit-field">
                <span>사유</span>
                <input v-model="exceptionForm.description" type="text" class="v-modal-line-input" />
              </label>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isCreatingException" @click="createException">
                {{ isCreatingException ? '추가 중...' : '예외 시간 추가' }}
              </button>

              <div class="owner-edit-row-gap">
                <div v-for="item in exceptions" :key="item.id" class="owner-edit-exception-row">
                  <div>
                    <p class="owner-edit-date">{{ item.specificDate || item.date }}</p>
                    <p class="owner-edit-help">
                      {{ item.isClosed ? '휴무' : `${formatTime(item.openTime)} ~ ${formatTime(item.closeTime)}` }}
                      <template v-if="item.description"> · {{ item.description }}</template>
                    </p>
                  </div>
                  <button type="button" class="owner-edit-small-btn" @click="deleteException(item.id)">삭제</button>
                </div>
              </div>
            </section>

            <p v-if="ownerMessage" class="owner-edit-message">{{ ownerMessage }}</p>
            <p v-if="ownerError" class="owner-edit-error">{{ ownerError }}</p>
          </div>
        </template>

        <template v-else>
          <div class="view-card-sm v-profile-edit-layout">
            <div class="v-profile-edit-main">
              <div class="v-profile-edit-avatar-wrap">
                <div class="v-profile-edit-avatar-frame">
                  <img :src="form.profileImage" alt="프로필" class="v-cover-image" />
                </div>
                <button class="v-profile-edit-avatar-btn" type="button" @click="openProfileImagePicker">
                  <Camera class="v-icon-18-md20" />
                  사진 변경
                </button>
                <input
                  ref="profileImageInputRef"
                  type="file"
                  accept="image/*"
                  class="u-hidden"
                  @change="onProfileImageChange"
                />
              </div>

              <div class="v-profile-edit-form">
                <label class="v-form-label">
                  이름
                  <input v-model="form.userName" type="text" class="v-history-search-input v-profile-edit-input v-profile-edit-input-left" placeholder="이름을 입력하세요" />
                </label>

                <label class="v-form-label">
                  닉네임
                  <input v-model="form.nickName" type="text" class="v-history-search-input v-profile-edit-input v-profile-edit-input-left" placeholder="닉네임을 입력하세요" />
                </label>

                <label class="v-form-label">
                  이메일
                  <div class="v-profile-email-verify-wrap">
                    <div class="v-profile-email-row">
                      <input
                        v-model="form.email"
                        type="email"
                        class="v-history-search-input v-profile-edit-input v-profile-edit-input-left"
                        placeholder="이메일을 입력하세요"
                      />
                      <button
                        type="button"
                        class="v-profile-email-btn"
                        :disabled="isSendingEmailCode || !isEmailChangeRequested || isEmailChangeVerifiedForCurrent"
                        @click="sendEmailVerificationCode"
                      >
                        {{ isSendingEmailCode ? '발송 중...' : (isEmailCodeSent ? '재전송' : '인증') }}
                      </button>
                    </div>

                    <div v-if="isEmailCodeSent || isEmailChangeVerifiedForCurrent" class="v-profile-email-row">
                      <input
                        v-model="emailVerificationCode"
                        type="text"
                        class="v-history-search-input v-profile-edit-input v-profile-edit-input-left"
                        placeholder="인증코드 입력"
                        :disabled="isEmailChangeVerifiedForCurrent"
                      />
                      <button
                        type="button"
                        class="v-profile-email-btn v-profile-email-btn-verify"
                        :disabled="!isEmailCodeSent || isVerifyingEmailCode || isEmailChangeVerifiedForCurrent"
                        @click="verifyEmailCode"
                      >
                        {{ isEmailChangeVerifiedForCurrent ? '인증 완료' : (isVerifyingEmailCode ? '확인 중...' : '인증') }}
                      </button>
                    </div>

                    <p
                      v-if="emailVerifyMessage"
                      class="v-profile-email-msg v-profile-email-msg-success"
                    >
                      {{ emailVerifyMessage }}
                    </p>
                    <p
                      v-else-if="emailVerifyError"
                      class="v-profile-email-msg v-profile-email-msg-error"
                    >
                      {{ emailVerifyError }}
                    </p>
                  </div>
                </label>

                <label class="v-form-label">
                  소개
                  <div class="v-profile-edit-bio-wrap" :class="{ 'is-over-limit': isBioOverLimit }">
                    <div
                      ref="bioEditorRef"
                      class="v-profile-edit-textarea"
                      :class="{ 'is-over-limit': isBioOverLimit }"
                      contenteditable="true"
                      role="textbox"
                      aria-multiline="true"
                      data-placeholder="자신을 소개해 보세요"
                      @input="onBioInput"
                      @blur="onBioBlur"
                      @paste="onBioPaste"
                      @compositionstart="onBioCompositionStart"
                      @compositionend="onBioCompositionEnd"
                    ></div>
                  </div>
                  <div class="v-profile-edit-bio-meter-row">
                    <div class="v-profile-edit-bio-meter" :class="{ 'is-over-limit': isBioOverLimit }">
                      <svg viewBox="0 0 28 28" class="v-profile-edit-bio-meter-svg" aria-hidden="true">
                        <circle class="v-profile-edit-bio-meter-track" cx="14" cy="14" r="10" />
                        <circle
                          class="v-profile-edit-bio-meter-progress"
                          :class="{ 'is-over-limit': isBioOverLimit }"
                          cx="14"
                          cy="14"
                          r="10"
                          :style="{
                            strokeDasharray: `${BIO_CIRCLE_CIRCUMFERENCE} ${BIO_CIRCLE_CIRCUMFERENCE}`,
                            strokeDashoffset: `${bioCircleDashOffset}`,
                          }"
                        />
                      </svg>
                    </div>
                    <p class="v-profile-edit-bio-count" :class="{ 'is-over-limit': isBioOverLimit }">
                      {{ isBioOverLimit ? bioRemaining : `${bioLength}/${PROFILE_BIO_MAX_LENGTH}` }}
                    </p>
                  </div>
                </label>

              </div>
            </div>

            <div class="v-profile-edit-side">
              <h3 class="v-profile-edit-side-title">공개 설정</h3>
              <div class="v-profile-edit-toggle-item">
                <div>
                  <p class="v-profile-edit-toggle-label">프로필 공개</p>
                  <p class="v-profile-edit-toggle-desc">다른 사용자가 내 프로필을 볼 수 있어요.</p>
                </div>
                <button type="button" class="v-profile-edit-toggle" :class="form.isPublic ? 'v-toggle-on' : 'v-toggle-off'" @click="form.isPublic = !form.isPublic">
                  <span class="v-profile-edit-toggle-knob" :class="form.isPublic ? 'v-toggle-knob-on' : 'v-toggle-knob-off'" />
                </button>
              </div>
              <div class="v-profile-edit-toggle-item">
                <div>
                  <p class="v-profile-edit-toggle-label">활동 통계 공개</p>
                  <p class="v-profile-edit-toggle-desc">운동 기록 통계를 다른 사용자에게 보여줘요.</p>
                </div>
                <button type="button" class="v-profile-edit-toggle" :class="form.showStats ? 'v-toggle-on' : 'v-toggle-off'" @click="form.showStats = !form.showStats">
                  <span class="v-profile-edit-toggle-knob" :class="form.showStats ? 'v-toggle-knob-on' : 'v-toggle-knob-off'" />
                </button>
              </div>
            </div>
            <div class="v-profile-edit-actions">
              <RouterLink :to="profileLink" class="v-modal-cancel-btn v-profile-edit-action-btn">취소</RouterLink>
              <button class="v-modal-save-btn v-profile-edit-action-btn" type="button" :disabled="isBioOverLimit" @click="saveProfile">수정하기</button>
            </div>
          </div>
          <div class="v-profile-edit-account-bottom">
            <button
              type="button"
              class="v-profile-delete-link"
              :disabled="isProcessingAccountAction"
              @click="deleteAccount"
            >
              회원탈퇴
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { ArrowLeft, UserRound, Camera } from 'lucide-vue-next';
import { gymApi, userApi } from '@/services/apis';
import { clearAuthTokens, normalizeRole } from '@/services/token';
import { extractPayload } from '@/utils/api';
import { useSession } from '@/composables/useSession';

const router = useRouter();
const route = useRoute();
const { sessionProfile, primeSessionFromToken, syncSessionFromServer, resetSession } = useSession();
const PROFILE_BIO_MAX_LENGTH = 120;
const BIO_CIRCLE_RADIUS = 10;
const BIO_CIRCLE_CIRCUMFERENCE = 2 * Math.PI * BIO_CIRCLE_RADIUS;

const previewRole = computed(() => normalizeRole(route.query.previewRole));
const effectiveRole = computed(() => previewRole.value || normalizeRole(sessionProfile.value?.role) || 'USER');
const isGymOwner = computed(() => effectiveRole.value === 'GYM_OWNER');
const profileLink = computed(() => (
  previewRole.value
    ? { path: '/profile', query: { previewRole: previewRole.value } }
    : { path: '/profile' }
));

const form = ref({
  userName: '',
  nickName: '',
  email: '',
  bio: '',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&auto=format&fit=crop',
  isPublic: true,
  showStats: true,
});
const originalEmail = ref('');
const verifiedEmail = ref('');
const emailVerificationCode = ref('');
const isSendingEmailCode = ref(false);
const isEmailCodeSent = ref(false);
const isVerifyingEmailCode = ref(false);
const emailVerifyMessage = ref('');
const emailVerifyError = ref('');
const profileImageInputRef = ref(null);
const profileImageFile = ref(null);
const profileImagePreviewUrl = ref(null);

const bioEditorRef = ref(null);
const isBioComposing = ref(false);
const bioChars = computed(() => Array.from(String(form.value.bio || '')));
const bioLength = computed(() => bioChars.value.length);
const bioRemaining = computed(() => PROFILE_BIO_MAX_LENGTH - bioLength.value);
const isBioOverLimit = computed(() => bioRemaining.value < 0);
const bioSafeText = computed(() => bioChars.value.slice(0, PROFILE_BIO_MAX_LENGTH).join(''));
const bioOverflowText = computed(() => bioChars.value.slice(PROFILE_BIO_MAX_LENGTH).join(''));
const bioCircleRatio = computed(() => Math.min(bioLength.value / PROFILE_BIO_MAX_LENGTH, 1));
const bioCircleDashOffset = computed(() => BIO_CIRCLE_CIRCUMFERENCE * (1 - bioCircleRatio.value));
const normalizedCurrentEmail = computed(() => String(form.value.email || '').trim().toLowerCase());
const normalizedOriginalEmail = computed(() => String(originalEmail.value || '').trim().toLowerCase());
const isEmailChangeRequested = computed(() => (
  Boolean(normalizedCurrentEmail.value)
  && normalizedCurrentEmail.value !== normalizedOriginalEmail.value
));
const isEmailVerifiedForCurrent = computed(() => (
  Boolean(normalizedCurrentEmail.value)
  && normalizedCurrentEmail.value === verifiedEmail.value
));
const isEmailChangeVerifiedForCurrent = computed(() => (
  isEmailChangeRequested.value && isEmailVerifiedForCurrent.value
));

const normalizeBioText = (value) => (
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

const renderBioEditor = ({ preserveSelection = false } = {}) => {
  const editor = bioEditorRef.value;
  if (!editor) return;

  const selectionOffsets = preserveSelection ? getSelectionOffsetsInEditor(editor) : null;
  const safeText = bioSafeText.value;
  const overflowText = bioOverflowText.value;

  editor.replaceChildren();

  if (safeText) {
    editor.appendChild(document.createTextNode(safeText));
  }

  if (overflowText) {
    const overflowSpan = document.createElement('span');
    overflowSpan.className = 'v-profile-edit-bio-overflow';
    overflowSpan.textContent = overflowText;
    editor.appendChild(overflowSpan);
  }

  if (!selectionOffsets) return;

  const maxOffset = bioLength.value;
  setSelectionOffsetsInEditor(
    editor,
    Math.min(selectionOffsets.start, maxOffset),
    Math.min(selectionOffsets.end, maxOffset),
  );
};

const syncBioFromEditor = ({ preserveSelection = true } = {}) => {
  const editor = bioEditorRef.value;
  if (!editor) return;
  form.value.bio = normalizeBioText(editor.innerText);
  renderBioEditor({ preserveSelection });
};

const onBioInput = () => {
  if (isBioComposing.value) {
    const editor = bioEditorRef.value;
    if (!editor) return;
    form.value.bio = normalizeBioText(editor.innerText);
    return;
  }
  syncBioFromEditor({ preserveSelection: true });
};

const onBioBlur = () => {
  syncBioFromEditor({ preserveSelection: false });
};

const onBioCompositionStart = () => {
  isBioComposing.value = true;
};

const onBioCompositionEnd = () => {
  isBioComposing.value = false;
  syncBioFromEditor({ preserveSelection: true });
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

const onBioPaste = (event) => {
  event.preventDefault();
  const text = normalizeBioText(event.clipboardData?.getData('text/plain') || '');
  insertPlainTextAtCursor(text);
  syncBioFromEditor({ preserveSelection: true });
};

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const dayLabelMap = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};
const defaultHours = () => DAY_ORDER.map((day) => ({
  dayOfWeek: day,
  openTime: '06:00',
  closeTime: '23:00',
  isClosed: false,
}));

const gymForm = ref({
  name: '',
  address: '',
  description: '',
  categoryId: 1,
  tel: '',
});
const gymHours = ref(defaultHours());
const amenitiesInput = ref('');
const products = ref([{ productName: '', price: 0 }]);
const exceptions = ref([]);
const exceptionForm = ref({
  specificDate: '',
  openTime: '09:00',
  closeTime: '18:00',
  isClosed: false,
  description: '',
});
const gymImages = ref([]);
const pendingImages = ref([]);
const selectedImageNames = ref([]);

const isSavingGymProfile = ref(false);
const isSavingGymHours = ref(false);
const isSavingAmenities = ref(false);
const isSavingProducts = ref(false);
const isCreatingException = ref(false);
const isUploadingImages = ref(false);
const isDeletingImage = ref(false);
const ownerMessage = ref('');
const ownerError = ref('');
const isProcessingAccountAction = ref(false);

const toHHmm = (value, fallback = '00:00') => {
  if (!value) return fallback;
  return String(value).slice(0, 5);
};

const toHHmmss = (value, fallback = '00:00:00') => {
  if (!value) return fallback;
  const time = String(value).slice(0, 8);
  if (time.length === 5) return `${time}:00`;
  if (time.length === 8) return time;
  return fallback;
};

const formatTime = (value) => toHHmm(value, '--:--');

const applyGymData = (payload = {}) => {
  gymForm.value.name = payload.name || '';
  gymForm.value.address = payload.address || '';
  gymForm.value.description = payload.description || '';
  gymForm.value.categoryId = Number(payload.categoryId || 1);
  gymForm.value.tel = payload.tel || payload.phone || '';

  const hours = payload.hours || payload.businessHours || payload.gymHours || [];
  if (Array.isArray(hours) && hours.length > 0) {
    const merged = defaultHours();
    hours.forEach((item) => {
      const idx = merged.findIndex((base) => base.dayOfWeek === String(item.dayOfWeek || '').toUpperCase());
      if (idx < 0) return;
      merged[idx] = {
        ...merged[idx],
        openTime: toHHmm(item.openTime, merged[idx].openTime),
        closeTime: toHHmm(item.closeTime, merged[idx].closeTime),
        isClosed: Boolean(item.isClosed ?? item.closed),
      };
    });
    gymHours.value = merged;
  }

  const amenityList = payload.amenities || payload.amenityCodes || [];
  amenitiesInput.value = Array.isArray(amenityList) && amenityList.length > 0 ? amenityList.join(', ') : '';

  const productList = payload.products || [];
  products.value = Array.isArray(productList) && productList.length > 0
    ? productList.map((item) => ({
      productName: item.productName || item.name || '',
      price: Number(item.price || 0),
    }))
    : [{ productName: '', price: 0 }];

  const rawImages = payload.images || payload.imageList || payload.gymImages || [];
  gymImages.value = Array.isArray(rawImages)
    ? rawImages
      .map((item, index) => {
        const id = item?.imageId ?? item?.id ?? null;
        const url = item?.imageUrl || item?.url || item?.path || item?.src || '';
        if (!url) return null;
        return { id, url, key: `${id ?? 'no-id'}-${index}` };
      })
      .filter(Boolean)
    : [];
};

const toFriendlyEmailVerifyError = (error, fallbackMessage) => {
  const serverMessage = String(
    error?.response?.data?.message
      || error?.response?.data?.error
      || error?.response?.data?.result
      || '',
  ).trim();
  return serverMessage || fallbackMessage;
};

const resetEmailVerificationState = () => {
  verifiedEmail.value = '';
  emailVerificationCode.value = '';
  isEmailCodeSent.value = false;
  emailVerifyMessage.value = '';
  emailVerifyError.value = '';
};

const sendEmailVerificationCode = async () => {
  const email = normalizedCurrentEmail.value;
  if (!email) {
    emailVerifyError.value = '이메일을 입력해주세요.';
    emailVerifyMessage.value = '';
    return;
  }
  if (!isEmailChangeRequested.value) {
    emailVerifyError.value = '변경할 이메일을 입력해주세요.';
    emailVerifyMessage.value = '';
    return;
  }

  isSendingEmailCode.value = true;
  emailVerifyError.value = '';
  emailVerifyMessage.value = '';
  verifiedEmail.value = '';
  try {
    await userApi.sendEmailVerification({ email });
    isEmailCodeSent.value = true;
    emailVerificationCode.value = '';
    emailVerifyMessage.value = '인증코드를 전송했습니다. 이메일을 확인해주세요.';
  } catch (error) {
    emailVerifyError.value = toFriendlyEmailVerifyError(error, '인증코드 전송에 실패했습니다.');
  } finally {
    isSendingEmailCode.value = false;
  }
};

const verifyEmailCode = async () => {
  const email = normalizedCurrentEmail.value;
  const code = String(emailVerificationCode.value || '').trim();
  if (!email) {
    emailVerifyError.value = '이메일을 입력해주세요.';
    emailVerifyMessage.value = '';
    return;
  }
  if (!code) {
    emailVerifyError.value = '인증코드를 입력해주세요.';
    emailVerifyMessage.value = '';
    return;
  }

  isVerifyingEmailCode.value = true;
  emailVerifyError.value = '';
  emailVerifyMessage.value = '';
  try {
    await userApi.verifyEmailCode({ email, code });
    verifiedEmail.value = email;
    emailVerifyMessage.value = '인증 완료되었습니다.';
  } catch (error) {
    emailVerifyError.value = toFriendlyEmailVerifyError(error, '이메일 인증에 실패했습니다.');
  } finally {
    isVerifyingEmailCode.value = false;
  }
};

const loadProfile = async () => {
  try {
    const response = await userApi.myInfo();
    const data = extractPayload(response);
    form.value.userName = data.userName || data.name || data.displayName || '';
    form.value.nickName = data.nickName || data.nickname || '';
    form.value.email = data.email || '';
    originalEmail.value = String(data.email || '').trim().toLowerCase();
    verifiedEmail.value = originalEmail.value;
    form.value.bio = String(data.bio ?? '');
    form.value.profileImage = data.profileImageUrl || data.profileImage || form.value.profileImage;
    form.value.isPublic = typeof data.isPublic === 'boolean' ? data.isPublic : true;
    form.value.showStats = typeof data.showStats === 'boolean' ? data.showStats : true;
  } catch (error) {
    console.error('Failed to load profile edit data:', error);
  }
  await nextTick();
  renderBioEditor();
};

const openProfileImagePicker = () => {
  if (profileImageInputRef.value) {
    profileImageInputRef.value.value = '';
  }
  profileImageInputRef.value?.click();
};

const onProfileImageChange = (event) => {
  const file = event?.target?.files?.[0];
  if (!file) return;
  if (profileImagePreviewUrl.value) {
    URL.revokeObjectURL(profileImagePreviewUrl.value);
  }
  const previewUrl = URL.createObjectURL(file);
  profileImagePreviewUrl.value = previewUrl;
  profileImageFile.value = file;
  form.value.profileImage = previewUrl;
};

watch(
  () => normalizedCurrentEmail.value,
  (next, prev) => {
    if (next === prev) return;
    emailVerifyError.value = '';

    if (next !== verifiedEmail.value) {
      resetEmailVerificationState();
      if (next && next === normalizedOriginalEmail.value) {
        verifiedEmail.value = normalizedOriginalEmail.value;
      }
    }
  },
);

const saveProfile = async () => {
  syncBioFromEditor({ preserveSelection: false });
  if (isBioOverLimit.value) return;
  if (isEmailChangeRequested.value && !isEmailChangeVerifiedForCurrent.value) {
    emailVerifyError.value = '이메일 변경 시 인증을 완료해주세요.';
    emailVerifyMessage.value = '';
    return;
  }

  try {
    await userApi.update({
      userName: form.value.userName,
      nickName: form.value.nickName,
      email: form.value.email,
      bio: String(form.value.bio || ''),
      isPublic: form.value.isPublic,
      showStats: form.value.showStats,
      profileImage: profileImageFile.value || undefined,
    });
    router.push(profileLink.value);
  } catch (error) {
    console.error('Failed to update profile:', error);
    router.push(profileLink.value);
  }
};

const deleteAccount = async () => {
  if (isProcessingAccountAction.value) return;
  if (!window.confirm('정말 회원탈퇴를 진행하시겠습니까?')) return;

  isProcessingAccountAction.value = true;
  try {
    await userApi.delete();
    clearAuthTokens();
    resetSession();
    router.push('/');
  } catch (error) {
    isProcessingAccountAction.value = false;
    window.alert('회원탈퇴에 실패했습니다.');
  }
};

const loadExceptions = async () => {
  try {
    const response = await gymApi.listException();
    const payload = extractPayload(response);
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.list)
          ? payload.list
          : [];
    exceptions.value = list.map((item) => ({
      ...item,
      isClosed: Boolean(item?.isClosed ?? item?.closed),
    }));
  } catch (error) {
    exceptions.value = [];
  }
};

const loadGym = async () => {
  try {
    const response = await gymApi.myGym();
    applyGymData(extractPayload(response));
    await loadExceptions();
  } catch (error) {
    ownerError.value = '짐 정보를 불러오지 못했습니다.';
  }
};

const saveGymProfile = async () => {
  isSavingGymProfile.value = true;
  ownerMessage.value = '';
  ownerError.value = '';
  try {
    await gymApi.updateProfile({
      name: gymForm.value.name,
      address: gymForm.value.address,
      description: gymForm.value.description,
      categoryId: Number(gymForm.value.categoryId || 1),
      tel: gymForm.value.tel,
    });
    ownerMessage.value = '짐 기본 정보가 저장되었습니다.';
  } catch (error) {
    ownerError.value = '짐 기본 정보 저장에 실패했습니다.';
  } finally {
    isSavingGymProfile.value = false;
  }
};

const saveGymHours = async () => {
  isSavingGymHours.value = true;
  ownerMessage.value = '';
  ownerError.value = '';
  try {
    await gymApi.replaceHours(gymHours.value.map((item) => ({
      dayOfWeek: item.dayOfWeek,
      openTime: toHHmmss(item.openTime, '06:00:00'),
      closeTime: toHHmmss(item.closeTime, '23:00:00'),
      closed: Boolean(item.isClosed),
    })));
    ownerMessage.value = '영업 시간이 저장되었습니다.';
  } catch (error) {
    ownerError.value = '영업 시간 저장에 실패했습니다.';
  } finally {
    isSavingGymHours.value = false;
  }
};

const saveAmenities = async () => {
  isSavingAmenities.value = true;
  ownerMessage.value = '';
  ownerError.value = '';
  try {
    const payload = amenitiesInput.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    await gymApi.replaceAmenities(payload);
    ownerMessage.value = '편의시설이 저장되었습니다.';
  } catch (error) {
    ownerError.value = '편의시설 저장에 실패했습니다.';
  } finally {
    isSavingAmenities.value = false;
  }
};

const addProduct = () => {
  products.value.push({ productName: '', price: 0 });
};

const removeProduct = (index) => {
  products.value = products.value.filter((_, idx) => idx !== index);
};

const saveProducts = async () => {
  isSavingProducts.value = true;
  ownerMessage.value = '';
  ownerError.value = '';
  try {
    const payload = products.value
      .filter((item) => item.productName)
      .map((item) => ({
        productName: item.productName,
        price: Number(item.price || 0),
      }));
    await gymApi.replaceProducts(payload);
    ownerMessage.value = '상품 정보가 저장되었습니다.';
  } catch (error) {
    ownerError.value = '상품 저장에 실패했습니다.';
  } finally {
    isSavingProducts.value = false;
  }
};

const createException = async () => {
  if (!exceptionForm.value.specificDate) {
    ownerError.value = '예외 날짜를 선택해주세요.';
    return;
  }

  isCreatingException.value = true;
  ownerMessage.value = '';
  ownerError.value = '';
  try {
    const openTime = exceptionForm.value.isClosed ? null : toHHmmss(exceptionForm.value.openTime, '09:00:00');
    const closeTime = exceptionForm.value.isClosed ? null : toHHmmss(exceptionForm.value.closeTime, '18:00:00');

    await gymApi.createException({
      specificDate: exceptionForm.value.specificDate,
      openTime,
      closeTime,
      closed: exceptionForm.value.isClosed,
      description: exceptionForm.value.description || null,
    });
    exceptionForm.value.specificDate = '';
    exceptionForm.value.description = '';
    await loadExceptions();
    ownerMessage.value = '예외 운영시간이 추가되었습니다.';
  } catch (error) {
    ownerError.value = '예외 운영시간 추가에 실패했습니다.';
  } finally {
    isCreatingException.value = false;
  }
};

const deleteException = async (id) => {
  if (!window.confirm('해당 예외 시간을 삭제할까요?')) return;
  try {
    await gymApi.deleteException(id);
    await loadExceptions();
  } catch (error) {
    ownerError.value = '예외 운영시간 삭제에 실패했습니다.';
  }
};

const handleImageChange = (event) => {
  const files = Array.from(event?.target?.files || []);
  pendingImages.value = files;
  selectedImageNames.value = files.map((file) => file.name);
};

const uploadImages = async () => {
  if (pendingImages.value.length === 0) return;
  isUploadingImages.value = true;
  ownerMessage.value = '';
  ownerError.value = '';
  try {
    await gymApi.addImages(pendingImages.value);
    pendingImages.value = [];
    selectedImageNames.value = [];
    await loadGym();
    ownerMessage.value = '짐 이미지가 업로드되었습니다.';
  } catch (error) {
    ownerError.value = '짐 이미지 업로드에 실패했습니다.';
  } finally {
    isUploadingImages.value = false;
  }
};

const deleteImage = async (image) => {
  if (!image?.id) return;
  if (!window.confirm('해당 이미지를 삭제할까요?')) return;
  isDeletingImage.value = true;
  ownerMessage.value = '';
  ownerError.value = '';
  try {
    await gymApi.deleteImage(image.id);
    await loadGym();
    ownerMessage.value = '짐 이미지가 삭제되었습니다.';
  } catch (error) {
    ownerError.value = '짐 이미지 삭제에 실패했습니다.';
  } finally {
    isDeletingImage.value = false;
  }
};

onMounted(async () => {
  primeSessionFromToken();
  try {
    await syncSessionFromServer();
  } catch (error) {
    // preview mode fallback
  }

  if (isGymOwner.value) {
    await loadGym();
    return;
  }
  await loadProfile();
});
</script>

<style scoped>
.u-hidden {
  display: none;
}

.v-profile-email-verify-wrap {
  display: grid;
  gap: 8px;
}

.v-profile-email-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  gap: 8px;
}

.v-profile-email-btn {
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  min-height: 44px;
  padding: 0 8px;
}

.v-profile-email-btn:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
}

.v-profile-email-btn-verify {
  border-color: #93c5fd;
  background: #dbeafe;
}

.v-profile-email-msg {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
}

.v-profile-email-msg-success {
  color: #16a34a;
}

.v-profile-email-msg-error {
  color: #dc2626;
}

.v-profile-edit-input-left {
  text-align: left;
  padding-left: 14px;
}

.owner-edit-page {
  display: grid;
  gap: 14px;
}

.owner-edit-section {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  padding: 14px;
  display: grid;
  gap: 10px;
}

.owner-edit-section h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.owner-edit-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.owner-edit-field {
  display: grid;
  gap: 6px;
}

.owner-edit-field span {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.owner-edit-textarea {
  min-height: 96px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.owner-edit-hours {
  display: grid;
  gap: 8px;
}

.owner-edit-hour-row {
  display: grid;
  grid-template-columns: 36px auto 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}

.owner-edit-hour-day {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.owner-edit-hour-closed {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #475569;
}

.owner-edit-row-gap {
  display: grid;
  gap: 8px;
}

.owner-edit-product-row {
  display: grid;
  grid-template-columns: 1fr 130px 70px;
  gap: 8px;
  align-items: center;
}

.owner-edit-small-btn {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  min-height: 40px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.owner-edit-inline-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.owner-edit-action-btn {
  min-height: 44px;
}

.owner-edit-image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.owner-edit-image-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 8px;
  display: grid;
  gap: 8px;
}

.owner-edit-image-thumb {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 8px;
}

.owner-edit-exception-row {
  display: grid;
  grid-template-columns: 1fr 70px;
  gap: 8px;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px;
}

.owner-edit-date {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.owner-edit-help {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.owner-edit-message {
  margin: 0;
  font-size: 13px;
  color: #166534;
}

.owner-edit-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

.v-profile-edit-account-bottom {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.v-profile-delete-link {
  border: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  padding: 4px 2px;
}

.v-profile-delete-link:hover {
  color: #64748b;
  text-decoration: underline;
}

.v-profile-delete-link:disabled {
  opacity: 0.6;
  cursor: default;
  text-decoration: none;
}

@media (min-width: 900px) {
  .owner-edit-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .owner-edit-image-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
