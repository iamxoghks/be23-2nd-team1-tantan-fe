<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card admin-page">
          <button class="admin-back-btn" @click="goBackToAdmin">
            ← 관리자 대시보드
          </button>

          <div class="admin-head">
            <h1>신고 처리</h1>
            <div class="admin-filter-row">
              <select v-model="statusFilter" @change="loadReports(0)">
                <option value="">전체</option>
                <option value="PENDING">대기</option>
                <option value="RESOLVED">해결</option>
                <option value="REJECTED">기각</option>
              </select>
            </div>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>타입</th>
                  <th>신고자</th>
                  <th>피신고자</th>
                  <th>사유</th>
                  <th>상태</th>
                  <th>상세보기</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in reports" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.refType }}</td>
                  <td>{{ getReporterLabel(item) }}</td>
                  <td>{{ getTargetLabel(item) }}</td>
                  <td>{{ item.reason }}</td>
                  <td><span class="admin-status-label">{{ getStatusLabel(item) }}</span></td>
                  <td>
                    <button class="admin-detail-btn" @click="openReportDetail(item.id)">상세보기</button>
                  </td>
                </tr>
                <tr v-if="reports.length === 0">
                  <td colspan="7" class="admin-empty">표시할 신고가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-pagination">
            <button class="admin-btn admin-btn-muted" :disabled="page <= 0" @click="loadReports(page - 1)">이전</button>
            <span>{{ page + 1 }} / {{ totalPages }}</span>
            <button class="admin-btn admin-btn-muted" :disabled="page + 1 >= totalPages" @click="loadReports(page + 1)">다음</button>
          </div>

          <p v-if="pageErrorMessage" class="admin-error">{{ pageErrorMessage }}</p>
        </div>

        <div v-if="isDetailModalOpen" class="admin-report-modal-backdrop" @click.self="closeReportDetail">
          <div class="admin-report-modal" role="dialog" aria-modal="true" aria-labelledby="admin-report-detail-title">
            <div class="admin-report-modal-head">
              <div>
                <h2 id="admin-report-detail-title">신고 상세</h2>
                <p>신고 정보와 신고당한 콘텐츠를 확인합니다.</p>
              </div>
              <button type="button" class="admin-report-modal-close" @click="closeReportDetail" aria-label="신고 상세 닫기">
                ×
              </button>
            </div>

            <div v-if="isDetailLoading" class="admin-report-modal-loading">상세 정보를 불러오는 중입니다.</div>
            <div v-else-if="detailErrorMessage" class="admin-report-modal-error">{{ detailErrorMessage }}</div>
            <div v-else-if="selectedReportDetail" class="admin-report-modal-body">
              <div class="admin-report-detail-grid">
                <div class="admin-report-detail-item">
                  <span>신고 ID</span>
                  <strong>#{{ selectedReportDetail.reportId }}</strong>
                </div>
                <div class="admin-report-detail-item">
                  <span>타입</span>
                  <strong>{{ selectedReportDetail.refType || '-' }}</strong>
                </div>
                <div class="admin-report-detail-item">
                  <span>신고 시각</span>
                  <strong>{{ formatReportDateTime(selectedReportDetail.createdTime) }}</strong>
                </div>
                <div class="admin-report-detail-item">
                  <span>상태</span>
                  <strong>{{ getStatusLabel(selectedReportDetail) }}</strong>
                </div>
                <div class="admin-report-detail-item">
                  <span>신고자</span>
                  <strong>{{ getReporterLabel(selectedReportDetail) }}</strong>
                </div>
                <div class="admin-report-detail-item">
                  <span>피신고자</span>
                  <strong>{{ getTargetLabel(selectedReportDetail) }}</strong>
                </div>
              </div>

              <div class="admin-report-detail-section">
                <span class="admin-report-detail-label">신고 사유</span>
                <div class="admin-report-detail-box">{{ selectedReportDetail.reason || '-' }}</div>
              </div>

              <div class="admin-report-detail-section">
                <div class="admin-report-detail-section-head">
                  <span class="admin-report-detail-label">신고된 콘텐츠</span>
                  <button
                    v-if="canNavigateToTarget(selectedReportDetail)"
                    type="button"
                    class="admin-report-link-btn"
                    @click="goToReportTarget"
                  >
                    원문 바로가기
                  </button>
                </div>
                <div class="admin-report-detail-box admin-report-content-box">
                  <p v-if="selectedReportDetail.targetDeleted" class="admin-report-deleted-note">삭제 처리된 대상입니다.</p>
                  <p v-if="isTargetPreviewLoading" class="admin-report-preview-state">콘텐츠를 불러오는 중입니다.</p>
                  <p v-else-if="targetPreviewError" class="admin-report-preview-state admin-report-preview-state-error">{{ targetPreviewError }}</p>

                  <template v-else-if="targetPreviewKind === 'post' && targetPreviewPost">
                    <p v-if="targetPreviewPost.title" class="admin-report-content-title">{{ targetPreviewPost.title }}</p>
                    <div v-if="targetPreviewPost.images?.length" class="admin-report-image-grid">
                      <img
                        v-for="(image, imageIndex) in targetPreviewPost.images"
                        :key="`${targetPreviewPost.id}-${imageIndex}`"
                        :src="image"
                        alt=""
                        class="admin-report-preview-image"
                      />
                    </div>
                    <p v-if="targetPreviewPost.content" class="admin-report-content-body">{{ targetPreviewPost.content }}</p>
                    <div v-if="targetPreviewPost.hasWorkout || targetPreviewPost.hasWorkoutPreview" class="admin-report-workout-block">
                      <div class="admin-report-workout-head">
                        <strong>운동기록</strong>
                        <span v-if="Number(targetPreviewPost.streak || 0) > 0" class="admin-report-workout-streak">
                          {{ targetPreviewPost.streak }}일 연속
                        </span>
                      </div>
                      <div
                        v-for="exercise in targetPreviewPost.exercises || []"
                        :key="`${targetPreviewPost.id}-${exercise.name}-${exercise.stats}`"
                        class="admin-report-workout-item"
                      >
                        <span class="admin-report-workout-name">{{ exercise.name }}</span>
                        <span class="admin-report-workout-stats">{{ exercise.stats }}</span>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="targetPreviewKind === 'review' && targetPreviewReview">
                    <div class="admin-report-review-meta">
                      <span class="admin-report-review-rating">평점 {{ targetPreviewReview.rating }}/5</span>
                    </div>
                    <p class="admin-report-content-body">{{ targetPreviewReview.comment || '리뷰 내용이 없습니다.' }}</p>
                    <div v-if="targetPreviewReview.images?.length" class="admin-report-image-grid">
                      <img
                        v-for="(image, imageIndex) in targetPreviewReview.images"
                        :key="`${targetPreviewReview.reviewId}-${imageIndex}`"
                        :src="image"
                        alt=""
                        class="admin-report-preview-image"
                      />
                    </div>
                  </template>

                  <template v-else-if="targetPreviewKind === 'chat'">
                    <div class="admin-report-chat-card">
                      <span class="admin-report-chat-author">{{ getTargetLabel(selectedReportDetail) }}</span>
                      <div class="admin-report-chat-bubble">{{ getReportContentText(selectedReportDetail) }}</div>
                    </div>
                  </template>

                  <template v-else-if="targetPreviewKind === 'comment'">
                    <p class="admin-report-content-body">{{ getReportContentText(selectedReportDetail) }}</p>
                  </template>

                  <template v-else>
                    <p v-if="selectedReportDetail.targetTitle" class="admin-report-content-title">{{ selectedReportDetail.targetTitle }}</p>
                    <p class="admin-report-content-body">{{ getReportContentText(selectedReportDetail) }}</p>
                  </template>
                </div>
              </div>

              <div v-if="isPending(selectedReportDetail)" class="admin-report-modal-actions">
                  <button
                    type="button"
                    class="admin-btn admin-report-modal-action-btn"
                    :disabled="isActionUpdating"
                    @click="resolve(selectedReportDetail.reportId, false, { closeDetail: true })"
                  >
                    해결
                  </button>
                  <button
                    type="button"
                    class="admin-btn admin-btn-warn admin-report-modal-action-btn"
                    :disabled="isActionUpdating"
                    @click="openResolveDeleteSuspendModal"
                  >
                    해결+대상삭제
                  </button>
                  <button
                    type="button"
                    class="admin-btn admin-btn-muted admin-report-modal-action-btn"
                    :disabled="isActionUpdating"
                    @click="reject(selectedReportDetail.reportId, { closeDetail: true })"
                  >
                    기각
                  </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="isSuspendDaysModalOpen"
          class="view-modal-backdrop admin-report-feedback-backdrop"
          @click.self="closeSuspendDaysModal"
        >
          <div
            class="view-modal-panel admin-report-suspend-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-report-suspend-days-title"
          >
            <div class="admin-report-suspend-body">
              <h2 id="admin-report-suspend-days-title" class="v-modal-title">피신고자 정지</h2>
              <p class="admin-report-suspend-copy">
                <strong>{{ resolveDeleteSuspendContext.targetLabel || '피신고자' }}</strong> 계정의 정지 기간(일)을 입력해주세요.
              </p>
              <input
                v-model="suspendDaysInput"
                type="number"
                min="1"
                class="v-modal-line-input"
                placeholder="예: 7"
                @keydown.enter.prevent="proceedToSuspendReasonModal"
              />
              <p v-if="suspendDaysError" class="admin-report-suspend-error">{{ suspendDaysError }}</p>
            </div>
            <div class="admin-report-feedback-actions">
              <button
                type="button"
                class="v-modal-cancel-btn"
                :disabled="isActionUpdating"
                @click="closeSuspendDaysModal"
              >
                취소
              </button>
              <button
                type="button"
                class="v-modal-save-btn"
                :disabled="isActionUpdating"
                @click="proceedToSuspendReasonModal"
              >
                다음
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="isSuspendReasonModalOpen"
          class="view-modal-backdrop admin-report-feedback-backdrop"
          @click.self="closeSuspendReasonModal"
        >
          <div
            class="view-modal-panel admin-report-suspend-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-report-suspend-reason-title"
          >
            <div class="admin-report-suspend-body">
              <h2 id="admin-report-suspend-reason-title" class="v-modal-title">정지 사유</h2>
              <p class="admin-report-suspend-copy">피신고자 정지 사유를 입력해주세요.</p>
              <textarea
                v-model="suspendReasonInput"
                rows="4"
                class="v-modal-line-input admin-report-suspend-textarea"
                placeholder="정지 사유를 입력하세요"
              />
              <p v-if="suspendReasonError" class="admin-report-suspend-error">{{ suspendReasonError }}</p>
            </div>
            <div class="admin-report-feedback-actions">
              <button
                type="button"
                class="v-modal-cancel-btn"
                :disabled="isActionUpdating"
                @click="closeSuspendReasonModal"
              >
                취소
              </button>
              <button
                type="button"
                class="v-modal-save-btn admin-report-feedback-confirm-warn"
                :disabled="isActionUpdating"
                @click="submitResolveDeleteAndSuspend"
              >
                {{ isActionUpdating ? '처리 중...' : '해결+대상삭제' }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="feedbackModal.open"
          class="view-modal-backdrop admin-report-feedback-backdrop"
          @click.self="closeFeedbackModal"
        >
          <div
            class="view-modal-panel admin-report-feedback-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-report-feedback-title"
          >
            <div class="admin-report-feedback-body">
              <h2 id="admin-report-feedback-title" class="v-modal-title">{{ feedbackModal.title }}</h2>
              <p
                class="admin-report-feedback-copy"
                :class="feedbackModal.tone === 'error' ? 'admin-report-feedback-copy-error' : ''"
              >
                {{ feedbackModal.message }}
              </p>
            </div>
            <div class="admin-report-feedback-actions admin-report-feedback-actions-single">
              <button
                type="button"
                class="v-modal-save-btn"
                :class="feedbackModal.tone === 'error' ? 'admin-report-feedback-confirm-warn' : ''"
                @click="closeFeedbackModal"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { adminApi, communityPostApi, reviewApi } from '@/services/apis';
import { extractPayload } from '@/utils/api';
import { normalizeCommunityPost } from '@/utils/postNormalizer';

const router = useRouter();
const reports = ref([]);
const statusFilter = ref('PENDING');
const page = ref(0);
const size = ref(20);
const totalPages = ref(1);
const pageErrorMessage = ref('');
const isDetailModalOpen = ref(false);
const isDetailLoading = ref(false);
const detailErrorMessage = ref('');
const selectedReportDetail = ref(null);
const isTargetPreviewLoading = ref(false);
const targetPreviewError = ref('');
const targetPreviewKind = ref('raw');
const targetPreviewPost = ref(null);
const targetPreviewReview = ref(null);
const isActionUpdating = ref(false);
const isSuspendDaysModalOpen = ref(false);
const isSuspendReasonModalOpen = ref(false);
const suspendDaysInput = ref('7');
const suspendReasonInput = ref('신고 처리에 따른 정지 조치');
const suspendDaysError = ref('');
const suspendReasonError = ref('');
const resolveDeleteSuspendContext = ref({
  reportId: null,
  targetLabel: '',
});
const feedbackModal = ref({
  open: false,
  title: '',
  message: '',
  tone: 'success',
});

const parseList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const goBackToAdmin = () => {
  router.push('/admin');
};

const openFeedbackModal = (title, message, tone = 'success') => {
  feedbackModal.value = {
    open: true,
    title,
    message,
    tone,
  };
};

const closeFeedbackModal = () => {
  feedbackModal.value = {
    ...feedbackModal.value,
    open: false,
  };
};

const toActionErrorMessage = (error, fallback) => (
  error?.response?.data?.message
  || error?.response?.data?.error
  || fallback
);

const isPending = (item) => String(item?.status || '').toUpperCase() === 'PENDING';

const getStatusLabel = (item) => {
  const status = String(item?.status || '').toUpperCase();
  if (status === 'PENDING') return '대기';
  if (status === 'REJECTED') return '기각';
  if (status === 'RESOLVED') {
    return item?.targetDeleted ? '해결+대상삭제' : '해결';
  }
  return item?.status || '-';
};

const getReporterLabel = (item) => item?.reporterNickname || (item?.reporterId ? `#${item.reporterId}` : '-');

const getTargetLabel = (item) => item?.targetAuthor || '-';

const formatReportDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getReportContentText = (item) => {
  const content = String(item?.targetContent || '').trim();
  return content || '표시할 콘텐츠가 없습니다.';
};

const canNavigateToTarget = (item) => Boolean(item?.targetPath);

const getApiBaseUrl = () => {
  const envVite = import.meta.env.VITE_API_BASE_URL;
  const envVue = import.meta.env.VUE_APP_API_BASE_URL;
  if (envVite && envVite.startsWith('http')) return envVite;
  if (envVue && envVue.startsWith('http')) return envVue;
  return 'http://localhost:8080';
};

const normalizedApiBaseUrl = String(getApiBaseUrl()).replace(/\/+$/, '');

const normalizeMediaUrl = (value) => {
  const url = String(value || '').trim();
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/')) return `${normalizedApiBaseUrl}${url}`;
  return `${normalizedApiBaseUrl}/${url}`;
};

const extractCommunityPostId = (detail) => {
  const refType = String(detail?.refType || '').toUpperCase();
  if (refType === 'POST') return Number(detail?.refId || 0);
  if (refType === 'COMMENT') {
    const match = String(detail?.targetPath || '').match(/\/community\/(\d+)$/);
    return Number(match?.[1] || 0);
  }
  return 0;
};

const resetTargetPreview = () => {
  isTargetPreviewLoading.value = false;
  targetPreviewError.value = '';
  targetPreviewKind.value = 'raw';
  targetPreviewPost.value = null;
  targetPreviewReview.value = null;
};

const loadTargetPreview = async (detail) => {
  resetTargetPreview();
  if (!detail) return;

  const refType = String(detail?.refType || '').toUpperCase();

  if (refType === 'POST') {
    const postId = extractCommunityPostId(detail);
    if (!postId) return;
    isTargetPreviewLoading.value = true;
    try {
      const response = await communityPostApi.detail(postId, { countView: false });
      const payload = extractPayload(response);
      targetPreviewPost.value = normalizeCommunityPost(payload);
      targetPreviewKind.value = 'post';
    } catch (error) {
      targetPreviewError.value = '게시글 원문을 불러오지 못했습니다.';
    } finally {
      isTargetPreviewLoading.value = false;
    }
    return;
  }

  if (refType === 'REVIEW') {
    isTargetPreviewLoading.value = true;
    try {
      const response = await reviewApi.detail(detail.refId);
      const payload = extractPayload(response);
      const images = Array.isArray(payload?.images)
        ? payload.images
          .map((image) => normalizeMediaUrl(image?.originalUrl || image?.url || image?.thumbnailUrl))
          .filter(Boolean)
        : [];
      targetPreviewReview.value = {
        reviewId: payload?.reviewId ?? detail?.refId,
        rating: Number(payload?.rating || 0),
        comment: String(payload?.comment || '').trim(),
        images,
      };
      targetPreviewKind.value = 'review';
    } catch (error) {
      targetPreviewError.value = '리뷰 원문을 불러오지 못했습니다.';
    } finally {
      isTargetPreviewLoading.value = false;
    }
    return;
  }

  if (refType === 'CHAT_MESSAGE') {
    targetPreviewKind.value = 'chat';
    return;
  }

  if (refType === 'COMMENT') {
    targetPreviewKind.value = 'comment';
  }
};

const closeReportDetail = () => {
  isDetailModalOpen.value = false;
  isDetailLoading.value = false;
  detailErrorMessage.value = '';
  selectedReportDetail.value = null;
  resetTargetPreview();
};

const resetResolveDeleteSuspendFlow = () => {
  isSuspendDaysModalOpen.value = false;
  isSuspendReasonModalOpen.value = false;
  suspendDaysError.value = '';
  suspendReasonError.value = '';
  resolveDeleteSuspendContext.value = {
    reportId: null,
    targetLabel: '',
  };
};

const openResolveDeleteSuspendModal = () => {
  if (!selectedReportDetail.value?.reportId) return;
  resolveDeleteSuspendContext.value = {
    reportId: selectedReportDetail.value.reportId,
    targetLabel: getTargetLabel(selectedReportDetail.value),
  };
  suspendDaysInput.value = '7';
  suspendReasonInput.value = '신고 처리에 따른 정지 조치';
  suspendDaysError.value = '';
  suspendReasonError.value = '';
  closeReportDetail();
  isSuspendDaysModalOpen.value = true;
};

const closeSuspendDaysModal = () => {
  if (isActionUpdating.value) return;
  resetResolveDeleteSuspendFlow();
};

const proceedToSuspendReasonModal = () => {
  const days = Number(suspendDaysInput.value || 0);
  if (!Number.isFinite(days) || days < 1) {
    suspendDaysError.value = '정지 기간은 1일 이상이어야 합니다.';
    return;
  }
  suspendDaysError.value = '';
  isSuspendDaysModalOpen.value = false;
  isSuspendReasonModalOpen.value = true;
};

const closeSuspendReasonModal = () => {
  if (isActionUpdating.value) return;
  resetResolveDeleteSuspendFlow();
};

const openReportDetail = async (reportId) => {
  isDetailModalOpen.value = true;
  isDetailLoading.value = true;
  detailErrorMessage.value = '';
  selectedReportDetail.value = null;

  try {
    const response = await adminApi.reportDetail(reportId);
    selectedReportDetail.value = extractPayload(response);
    await loadTargetPreview(selectedReportDetail.value);
  } catch (error) {
    detailErrorMessage.value = '신고 상세를 불러오지 못했습니다.';
  } finally {
    isDetailLoading.value = false;
  }
};

const goToReportTarget = () => {
  if (!selectedReportDetail.value?.targetPath) return;
  const targetPath = selectedReportDetail.value.targetPath;
  closeReportDetail();
  router.push(targetPath);
};

const loadReports = async (nextPage = 0) => {
  page.value = Math.max(0, nextPage);
  pageErrorMessage.value = '';

  try {
    const response = await adminApi.listReports({
      page: page.value,
      size: size.value,
      status: statusFilter.value || undefined,
      sort: 'createdTime,desc',
    });

    const payload = extractPayload(response);
    reports.value = parseList(payload);
    totalPages.value = Number(payload.totalPages || 1);
  } catch (error) {
    reports.value = [];
    totalPages.value = 1;
    pageErrorMessage.value = '신고 목록을 불러오지 못했습니다.';
  }
};

const resolve = async (id, deleteTarget, options = {}) => {
  if (isActionUpdating.value) return;
  isActionUpdating.value = true;
  try {
    await adminApi.updateReportStatus(id, {
      status: 'RESOLVED',
      deleteTarget,
    });
    await loadReports(page.value);
    if (options.closeDetail) closeReportDetail();
    openFeedbackModal(
      deleteTarget ? '삭제 완료' : '처리 완료',
      deleteTarget ? '해결 처리와 대상 삭제가 완료되었습니다.' : '완료처리 되었습니다.',
    );
  } catch (error) {
    openFeedbackModal(
      deleteTarget ? '삭제 실패' : '처리 실패',
      toActionErrorMessage(error, deleteTarget ? '신고 해결 처리와 대상 삭제에 실패했습니다.' : '신고 해결 처리에 실패했습니다.'),
      'error',
    );
  } finally {
    isActionUpdating.value = false;
  }
};

const reject = async (id, options = {}) => {
  if (isActionUpdating.value) return;
  isActionUpdating.value = true;
  try {
    await adminApi.updateReportStatus(id, {
      status: 'REJECTED',
      deleteTarget: false,
    });
    await loadReports(page.value);
    if (options.closeDetail) closeReportDetail();
    openFeedbackModal('기각 완료', '기각처리되었습니다.');
  } catch (error) {
    openFeedbackModal('기각 실패', toActionErrorMessage(error, '신고 기각 처리에 실패했습니다.'), 'error');
  } finally {
    isActionUpdating.value = false;
  }
};

const submitResolveDeleteAndSuspend = async () => {
  const reportId = resolveDeleteSuspendContext.value.reportId;
  const targetLabel = resolveDeleteSuspendContext.value.targetLabel || '피신고자';
  const days = Number(suspendDaysInput.value || 0);
  const reason = String(suspendReasonInput.value || '').trim();

  if (!reportId) {
    resetResolveDeleteSuspendFlow();
    openFeedbackModal('처리 실패', '신고 정보를 확인할 수 없습니다.', 'error');
    return;
  }
  if (!Number.isFinite(days) || days < 1) {
    isSuspendReasonModalOpen.value = false;
    isSuspendDaysModalOpen.value = true;
    suspendDaysError.value = '정지 기간은 1일 이상이어야 합니다.';
    return;
  }
  if (!reason) {
    suspendReasonError.value = '정지 사유를 입력해주세요.';
    return;
  }

  isActionUpdating.value = true;
  isSuspendReasonModalOpen.value = false;
  try {
    await adminApi.resolveReportWithDeleteAndSuspend(reportId, { days, reason });
    await loadReports(page.value);
    resetResolveDeleteSuspendFlow();
    openFeedbackModal('처리 완료', `${targetLabel} 정지와 해결 처리, 대상 삭제가 완료되었습니다.`);
  } catch (error) {
    resetResolveDeleteSuspendFlow();
    openFeedbackModal(
      '처리 실패',
      toActionErrorMessage(error, '피신고자 정지와 해결 처리, 대상 삭제에 실패했습니다.'),
      'error',
    );
  } finally {
    isActionUpdating.value = false;
  }
};

onMounted(() => {
  loadReports(0);
});
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 14px;
}

.admin-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.admin-back-btn {
  min-height: 44px;
  width: fit-content;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  padding: 0 14px;
}

.admin-head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.admin-filter-row select {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  padding: 8px 10px;
  font-size: 13px;
}

.admin-table-wrap {
  overflow: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  padding: 10px 8px;
  font-size: 13px;
  vertical-align: middle;
}

.admin-detail-btn,
.admin-status-label,
.admin-status-text {
  display: inline-block;
  font-size: 13px;
  line-height: 1.4;
}

.admin-detail-btn {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-weight: 700;
  padding: 0 10px;
}

.admin-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.admin-btn {
  min-height: 34px;
  border-radius: 8px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 0 10px;
}

.admin-btn-warn {
  border-color: #ea580c;
  background: #ea580c;
}

.admin-btn-muted {
  border-color: #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.admin-empty {
  text-align: center;
  color: #94a3b8;
}

.admin-status-label {
  color: #334155;
  font-weight: 500;
}

.admin-status-text {
  color: #475569;
  font-weight: 700;
}

.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.admin-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

.admin-report-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.45);
}

.admin-report-modal {
  width: min(760px, 100%);
  max-height: min(85vh, 900px);
  overflow: auto;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.admin-report-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px 12px;
}

.admin-report-modal-head h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
}

.admin-report-modal-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.admin-report-modal-close {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  font-size: 22px;
  line-height: 1;
}

.admin-report-modal-loading,
.admin-report-modal-error {
  padding: 0 24px 24px;
  font-size: 14px;
}

.admin-report-modal-loading {
  color: #64748b;
}

.admin-report-modal-error {
  color: #dc2626;
}

.admin-report-modal-body {
  display: grid;
  gap: 18px;
  padding: 0 24px 24px;
}

.admin-report-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.admin-report-detail-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.admin-report-detail-item span,
.admin-report-detail-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.admin-report-detail-item strong {
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
}

.admin-report-detail-section {
  display: grid;
  gap: 8px;
}

.admin-report-detail-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.admin-report-detail-box {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.admin-report-content-box {
  background: #f8fafc;
}

.admin-report-content-title {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.admin-report-content-body {
  margin: 0;
}

.admin-report-preview-state {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.admin-report-preview-state-error {
  color: #dc2626;
}

.admin-report-deleted-note {
  margin: 0 0 10px;
  color: #ea580c;
  font-size: 13px;
  font-weight: 700;
}

.admin-report-image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.admin-report-preview-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #dbeafe;
  background: #e2e8f0;
}

.admin-report-workout-block {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.admin-report-workout-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.admin-report-workout-head strong {
  color: #0f172a;
  font-size: 15px;
}

.admin-report-workout-streak {
  color: #ea580c;
  font-size: 13px;
  font-weight: 700;
}

.admin-report-workout-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
}

.admin-report-workout-name {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
}

.admin-report-workout-stats {
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
}

.admin-report-review-meta {
  margin-bottom: 10px;
}

.admin-report-review-rating {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}

.admin-report-chat-card {
  display: grid;
  gap: 8px;
}

.admin-report-chat-author {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.admin-report-chat-bubble {
  width: fit-content;
  max-width: min(100%, 420px);
  padding: 12px 14px;
  border-radius: 18px;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.admin-report-link-btn {
  min-height: 34px;
  border: 1px solid #2563eb;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  padding: 0 12px;
}

.admin-report-modal-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-report-modal-action-btn {
  min-height: 40px;
}

.admin-report-modal-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-report-feedback-backdrop {
  z-index: 90;
}

.admin-report-feedback-panel {
  width: min(420px, calc(100% - 32px));
}

.admin-report-suspend-panel {
  width: min(460px, calc(100% - 32px));
}

.admin-report-feedback-body {
  display: grid;
  gap: 12px;
  padding: 24px;
}

.admin-report-suspend-body {
  display: grid;
  gap: 12px;
  padding: 24px;
}

.admin-report-suspend-copy {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.admin-report-suspend-error {
  margin: 0;
  color: #dc2626;
  font-size: 13px;
}

.admin-report-suspend-textarea {
  min-height: 112px;
  resize: vertical;
}

.admin-report-feedback-copy {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.admin-report-feedback-copy-error {
  color: #b91c1c;
}

.admin-report-feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 24px 24px;
}

.admin-report-feedback-actions-single {
  justify-content: center;
}

.admin-report-feedback-confirm-warn {
  border-color: #ea580c;
  background: #ea580c;
}

@media (max-width: 767px) {
  .admin-report-modal-backdrop {
    padding: 14px;
  }

  .admin-report-modal-head,
  .admin-report-modal-loading,
  .admin-report-modal-error,
  .admin-report-modal-body {
    padding-left: 16px;
    padding-right: 16px;
  }

  .admin-report-detail-grid {
    grid-template-columns: 1fr;
  }

  .admin-report-detail-section-head {
    align-items: stretch;
    flex-direction: column;
  }

  .admin-report-link-btn {
    width: 100%;
    justify-content: center;
  }

  .admin-report-workout-head,
  .admin-report-workout-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-report-modal-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .admin-report-modal-action-btn {
    min-width: 0;
    padding: 0 6px;
    font-size: 11px;
    justify-content: center;
  }
}
</style>
