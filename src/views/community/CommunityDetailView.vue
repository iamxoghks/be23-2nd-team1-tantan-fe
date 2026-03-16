<template>
  <div class="screen-rail-white v-community-detail-page">
    <NavigationRail />

    <div class="app-main-column app-main-column-no-scroll">
      <main class="sx-views-community-communityview-004 v-community-detail-main">
        <div class="v-community-detail-content">
          <div v-if="isLoading" class="ux-views-community-communityview-023">게시글을 불러오는 중...</div>
          <div v-else-if="errorMessage" class="v-community-detail-error-wrap">
            <p class="ux-views-community-communityview-024">{{ errorMessage }}</p>
            <button class="v-community-detail-back" @click="goBackToList">커뮤니티 목록으로</button>
          </div>

          <div v-else-if="post" class="v-community-detail-body">
            <div class="sx-views-community-communityview-020">
              <div class="sx-views-community-communityview-021">
                <div>
                  <p class="ux-views-community-communityview-026">{{ showWorkoutPanel ? '운동 피드' : post.category }}</p>
                  <h3 class="ux-views-community-communityview-027">{{ post.title }}</h3>
                </div>
                <div class="u-row-gap-2 v-post-action-wrap" ref="postActionMenuRef">
                  <template v-if="isMyPost">
                    <button
                      class="ui-modal-icon-btn ui-modal-icon-btn-outline ux-views-community-communityview-028"
                      @click="togglePostActionMenu"
                    >
                      <MoreHorizontal :size="18" />
                    </button>
                    <div v-if="isPostActionMenuOpen" class="v-post-action-dropdown">
                      <button type="button" class="v-post-action-item" @click="editPost">수정</button>
                      <button type="button" class="v-post-action-item v-post-action-item-danger" @click="openDeleteConfirm">
                        삭제
                      </button>
                    </div>
                  </template>
                  <button
                    v-else
                    class="ui-modal-icon-btn ui-modal-icon-btn-outline ux-views-community-communityview-028"
                    @click="openReportModal({ refId: Number(post.id), refType: 'POST' })"
                  >
                    <Flag :size="18" />
                  </button>
                </div>
              </div>
            </div>

            <div class="sx-views-community-communityview-022">
              <div class="u-row-gap-3">
                <button
                  type="button"
                  class="v-user-profile-trigger"
                  :disabled="!canOpenAuthorProfile"
                  @click="openAuthorProfile"
                >
                  <img :src="post.authorImage" alt="" class="sx-views-community-communityview-023" @error="handleUserAvatarError" />
                </button>
                <div>
                  <button
                    type="button"
                    class="v-user-profile-trigger v-user-profile-trigger-text"
                    :disabled="!canOpenAuthorProfile"
                    @click="openAuthorProfile"
                  >
                    <span class="ux-views-community-communityview-030">{{ post.author }}</span>
                  </button>
                  <p class="sx-views-community-communityview-024">{{ post.time }}</p>
                </div>
              </div>

              <div v-if="post.image" class="ux-views-community-communityview-031 v-community-detail-image-wrap">
                <img :src="post.image" alt="" class="ux-views-community-communityview-032 v-community-detail-image" />
              </div>

              <div v-if="showWorkoutPanel" class="sx-views-community-communityview-025">
                <div class="sx-views-community-communityview-026">
                  <span class="sx-views-community-communityview-027"><Zap :size="14" />{{ post.author }}님이 운동을 공유했어요!</span>
                  <span class="sx-views-community-communityview-029"><Zap :size="14" />{{ post.streak || 0 }}일 연속</span>
                </div>

                <div class="u-col-gap-2">
                  <template v-if="post.exercises && post.exercises.length > 0">
                    <div
                      v-for="exercise in post.exercises"
                      :key="exercise.name"
                      class="sx-views-community-communityview-030"
                    >
                      <span class="ux-views-community-communityview-033">{{ exercise.name }}</span>
                      <span class="ux-views-community-communityview-034">{{ exercise.stats }}</span>
                    </div>
                  </template>
                  <div v-else class="sx-views-community-communityview-030">
                    <span class="ux-views-community-communityview-034">요약 정보 없음</span>
                  </div>
                </div>
              </div>

              <div class="sx-views-community-communityview-031">
                {{ getPostBodyText(post) }}
              </div>

              <div class="u-row-gap-2">
                <button class="sx-views-community-communityview-032" :class="isLiked ? 'v-community-like-active' : 'v-community-like-inactive'" @click="toggleLike">
                  <Heart :size="17" :fill="isLiked ? 'currentColor' : 'none'" />
                  좋아요
                </button>
                <span class="ux-views-community-communityview-035">총 {{ post.likes || 0 }}개</span>
                <span class="ux-views-community-communityview-035" style="display: inline-flex; align-items: center; gap: 4px;">
                  <Eye :size="15" />
                  {{ post.views || 0 }}
                </span>
              </div>

              <div class="sx-views-community-communityview-033">
                <div class="sx-views-community-communityview-034">
                  <h4 class="ux-views-community-communityview-036">댓글 {{ totalCommentCount }}</h4>
                </div>
                <div class="v-community-ig-list">
                  <article v-for="comment in comments" :key="comment.id" class="v-community-thread">
                    <div class="v-community-ig-item">
                      <img :src="comment.authorImage" :alt="comment.author" class="v-community-ig-avatar" @error="handleUserAvatarError" />
                      <div class="v-community-ig-body">
                        <p class="v-community-ig-content">
                          <span class="v-community-ig-author">{{ comment.author }}</span>
                          <span>{{ comment.content }}</span>
                        </p>
                        <div class="v-community-ig-meta">
                          <span class="v-community-ig-time">{{ comment.timeAgo }}</span>
                          <button class="v-community-ig-meta-btn" type="button" @click="toggleCommentLike(comment.id)">
                            {{ comment.liked ? '좋아요 취소' : '좋아요' }}
                          </button>
                          <span v-if="comment.likeCount > 0" class="v-community-like-count">총 {{ comment.likeCount }}개</span>
                          <button class="v-community-ig-meta-btn" type="button" @click="startReply(comment, comment)">
                            답글달기
                          </button>
                        </div>
                      </div>
                      <button class="v-community-report-btn" type="button" @click="openReportModal({ refId: comment.id, refType: 'COMMENT' })">
                        <Flag :size="14" />
                      </button>
                    </div>

                    <div v-if="comment.replies.length > 0" class="v-community-reply-list">
                      <div
                        v-for="reply in comment.replies"
                        :key="reply.id"
                        class="v-community-ig-item v-community-ig-reply"
                      >
                        <img :src="reply.authorImage" :alt="reply.author" class="v-community-ig-avatar" @error="handleUserAvatarError" />
                        <div class="v-community-ig-body">
                          <p class="v-community-ig-content">
                            <span class="v-community-ig-author">{{ reply.author }}</span>
                            <span
                              v-if="reply.replyToNickName"
                              class="v-community-ig-mention"
                            >
                              @{{ reply.replyToNickName }}
                            </span>
                            <span>{{ getReplyDisplayContent(reply) }}</span>
                          </p>
                          <div class="v-community-ig-meta">
                            <span class="v-community-ig-time">{{ reply.timeAgo }}</span>
                            <button class="v-community-ig-meta-btn" type="button" @click="toggleCommentLike(comment.id, reply.id)">
                              {{ reply.liked ? '좋아요 취소' : '좋아요' }}
                            </button>
                            <span v-if="reply.likeCount > 0" class="v-community-like-count">총 {{ reply.likeCount }}개</span>
                            <button class="v-community-ig-meta-btn" type="button" @click="startReply(comment, reply)">
                              답글달기
                            </button>
                          </div>
                        </div>
                        <button class="v-community-report-btn" type="button" @click="openReportModal({ refId: reply.id, refType: 'COMMENT' })">
                          <Flag :size="14" />
                        </button>
                      </div>
                    </div>

                    <button
                      v-if="comment.replyCount > comment.replies.length"
                      type="button"
                      class="v-community-more-replies-btn"
                      :disabled="Boolean(replyLoadingMap[comment.id])"
                      @click="loadAllReplies(comment.id)"
                    >
                      {{
                        replyLoadingMap[comment.id]
                          ? '답글 불러오는 중...'
                          : `답글 ${comment.replyCount - comment.replies.length}개 더보기`
                      }}
                    </button>
                  </article>
                </div>

                <div class="v-community-ig-input-wrap">
                  <img :src="myProfileImage" alt="내 프로필" class="v-community-ig-input-avatar" @error="handleUserAvatarError" />
                  <div class="v-community-ig-input-box">
                    <span v-if="replyTarget" class="v-community-ig-input-mention">@{{ replyTarget.nickName }}</span>
                    <input
                      ref="commentInputEl"
                      v-model="commentInput"
                      type="text"
                      placeholder="대화에 참여하세요..."
                      class="v-community-comment-input v-community-ig-input"
                      @input="handleCommentInput"
                      @keydown="handleCommentInputKeydown"
                      @keydown.enter.exact.prevent="submitComment"
                    />
                  </div>
                  <button class="v-community-ig-submit-btn" @click="submitComment">게시</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Teleport to="body">
      <div v-if="isDeleteModalOpen" class="v-post-delete-backdrop" @click.self="closeDeleteConfirm">
        <div class="v-post-delete-modal">
          <h3 class="v-post-delete-title">게시글을 삭제할까요?</h3>
          <p class="v-post-delete-desc">삭제 후에는 복구할 수 없습니다.</p>
          <div class="v-post-delete-actions">
            <button type="button" class="v-post-delete-cancel" :disabled="isDeletingPost" @click="closeDeleteConfirm">취소</button>
            <button type="button" class="v-post-delete-confirm" :disabled="isDeletingPost" @click="confirmDeletePost">
              {{ isDeletingPost ? '삭제 중...' : '확인' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="isReportModalOpen" class="v-report-modal-backdrop" @click.self="closeReportModal">
        <div class="v-report-modal">
          <h3 class="v-report-modal-title">신고하기</h3>
          <p class="v-report-modal-desc">신고 사유를 입력해주세요. 5자 이상 500자 이하로 작성 가능합니다.</p>
          <textarea
            v-model="reportReason"
            class="v-report-textarea"
            placeholder="신고 사유를 입력해주세요."
            maxlength="500"
          />
          <div class="v-report-modal-meta">
            <span v-if="reportErrorMessage" class="v-report-error">{{ reportErrorMessage }}</span>
            <span class="v-report-count">{{ reportReason.length }}/500</span>
          </div>
          <div class="v-report-actions">
            <button type="button" class="v-report-cancel" :disabled="isSubmittingReport" @click="closeReportModal">취소</button>
            <button type="button" class="v-report-submit" :disabled="isSubmittingReport" @click="submitReport">
              {{ isSubmittingReport ? '접수 중...' : '신고 접수' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="reportToastMessage" class="v-report-toast">{{ reportToastMessage }}</div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { Heart, Zap, Flag, Eye, MoreHorizontal } from 'lucide-vue-next';
import { communityCommentApi, communityLikeApi, communityPostApi, reportApi, workoutApi } from '@/services/apis';
import { useSession } from '@/composables/useSession';
import { normalizeCommunityPost } from '@/utils/postNormalizer';
import { extractList } from '@/utils/api';
import { formatTimeAgo } from '@/utils/time';
import { resolveUserAvatar, handleUserAvatarError } from '@/utils/userAvatar';

const route = useRoute();
const router = useRouter();
const { sessionProfile } = useSession();
const postId = computed(() => String(route.params.postId || '').trim());
const listQuery = computed(() => {
  const query = {};
  const category = String(route.query?.category || '').trim();
  const keyword = String(route.query?.q || '').trim();
  const sortType = String(route.query?.sortType || '').trim().toUpperCase();
  if (category) query.category = category;
  if (keyword) query.q = keyword;
  if (sortType) query.sortType = sortType;
  return query;
});

const post = ref(null);
const comments = ref([]);
const commentInput = ref('');
const commentInputEl = ref(null);
const replyTarget = ref(null);
const replyLoadingMap = ref({});
const isLoading = ref(false);
const errorMessage = ref('');
const isLiked = ref(false);
const isPostActionMenuOpen = ref(false);
const postActionMenuRef = ref(null);
const isDeleteModalOpen = ref(false);
const isDeletingPost = ref(false);
const isReportModalOpen = ref(false);
const reportReason = ref('');
const reportErrorMessage = ref('');
const isSubmittingReport = ref(false);
const reportTargetRefId = ref(null);
const reportTargetType = ref('POST');
const reportToastMessage = ref('');
let reportToastTimer = null;
const myProfileImage = computed(() => (
  resolveUserAvatar(
    sessionProfile.value?.raw?.profileThumbnailUrl
    || sessionProfile.value?.raw?.profileImageUrl
    || sessionProfile.value?.raw?.profileImage,
  )
));
const authorUserId = computed(() => {
  const parsed = Number(post.value?.userId ?? post.value?.authorId ?? post.value?.writerId ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});
const canOpenAuthorProfile = computed(() => Boolean(authorUserId.value));
const myUserId = computed(() => {
  const parsed = Number(
    sessionProfile.value?.id
      ?? sessionProfile.value?.userId
      ?? sessionProfile.value?.raw?.id
      ?? sessionProfile.value?.raw?.userId
      ?? 0,
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});
const isMyPost = computed(() => Boolean(myUserId.value) && Boolean(authorUserId.value) && myUserId.value === authorUserId.value);
const showWorkoutPanel = computed(() => Boolean(post.value?.type === 'workout' || post.value?.hasWorkout));
const totalCommentCount = computed(() => {
  const serverCount = Number(post.value?.comments ?? post.value?.commentCount);
  if (Number.isFinite(serverCount) && serverCount > 0) return serverCount;
  return comments.value.reduce((sum, comment) => sum + 1 + Math.max(comment.replyCount || 0, comment.replies.length), 0);
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCommentTimestamp = (comment) => {
  const raw = comment?.createdTime || comment?.createdAt || '';
  const parsed = new Date(raw).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortCommentsByCreatedAsc = (a, b) => getCommentTimestamp(a) - getCommentTimestamp(b);

const getReplyDisplayContent = (reply = {}) => {
  const content = String(reply?.content || '').trimStart();
  const nickName = String(reply?.replyToNickName || '').trim();
  if (!content || !nickName) return content;

  const mentionPrefixPattern = new RegExp(`^@${escapeRegExp(nickName)}(?:\\s+|$)`);
  return content.replace(mentionPrefixPattern, '').trimStart();
};

const normalizeCommentItem = (item = {}, index = 0, parentCommentId = null) => {
  const author = String(
    item?.displayName ||
      item?.author ||
      item?.writer ||
      item?.userName ||
      `user_${index + 1}`,
  ).trim();

  return {
    id: item?.id ?? `comment-${index}`,
    userId: item?.userId ?? null,
    author: author || `user_${index + 1}`,
    authorImage: resolveUserAvatar(item?.profileImageUrl || item?.authorImage || item?.profileImage),
    content: String(item?.contents || item?.content || '').trim(),
    createdTime: item?.createdTime || item?.createdAt || '',
    timeAgo: formatTimeAgo(item?.createdTime || item?.createdAt),
    parentCommentId: item?.parentCommentId ?? parentCommentId,
    replyToUserId: item?.replyToUserId ?? null,
    replyToNickName: String(item?.replyToNickName || '').trim(),
    liked: Boolean(item?.liked || item?.isLiked),
    likeCount: toNumber(item?.likeCount ?? item?.likes, 0),
  };
};

const normalizeRootComments = (payload) => {
  const rootComments = extractList(payload);
  return rootComments
    .map((item, index) => {
      const root = normalizeCommentItem(item, index, null);
      const previewReplies = extractList(item?.previewReplies || []);
      const replies = previewReplies.map((reply, replyIndex) => normalizeCommentItem(
        reply,
        replyIndex,
        root.id,
      ));
      const uniqueReplies = Array.from(
        new Map(replies.map((reply) => [String(reply.id), reply])).values(),
      ).sort(sortCommentsByCreatedAsc);
      const replyCount = Math.max(toNumber(item?.replyCount, uniqueReplies.length), uniqueReplies.length);
      return {
        ...root,
        replyCount,
        replies: uniqueReplies,
      };
    })
    .sort(sortCommentsByCreatedAsc);
};

const mergeReplies = (currentReplies = [], incomingReplies = []) => {
  const map = new Map();
  currentReplies.forEach((reply) => map.set(String(reply.id), reply));
  incomingReplies.forEach((reply) => map.set(String(reply.id), reply));
  return Array.from(map.values()).sort(sortCommentsByCreatedAsc);
};

const applyReplyLoading = (commentId, isLoading) => {
  replyLoadingMap.value = {
    ...replyLoadingMap.value,
    [commentId]: isLoading,
  };
};

const getPostBodyText = (entry) => {
  if (!entry) return '';
  if (entry.content) return entry.content;
  if (entry.excerpt) return entry.excerpt;
  if (entry.type === 'workout') return '운동 기록이 첨부된 게시글입니다.';
  return '본문 내용이 없습니다.';
};

const extractDateOnly = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toWorkoutStats = (detail = {}) => {
  const weight = Number(detail?.weight);
  const setCount = Number(detail?.setCount);
  const rep = Number(detail?.rep);

  if (Number.isFinite(weight) && Number.isFinite(setCount)) {
    return `${weight}kg x ${setCount} sets`;
  }
  if (Number.isFinite(weight) && Number.isFinite(rep)) {
    return `${weight}kg x ${rep} reps`;
  }
  if (Number.isFinite(setCount) && Number.isFinite(rep)) {
    return `${setCount} sets x ${rep} reps`;
  }
  if (Number.isFinite(weight)) return `${weight}kg`;
  if (Number.isFinite(setCount)) return `${setCount} sets`;
  if (Number.isFinite(rep)) return `${rep} reps`;
  return '-';
};

const normalizeWorkoutExercises = (workoutItem = {}) => {
  const details = Array.isArray(workoutItem?.workoutDetails)
    ? workoutItem.workoutDetails
    : Array.isArray(workoutItem?.workoutDetailList)
      ? workoutItem.workoutDetailList
      : [];

  return details
    .map((detail, index) => {
      const name = String(
        detail?.workoutName ??
          detail?.exerciseName ??
          detail?.name ??
          `운동 ${index + 1}`,
      ).trim();
      if (!name) return null;
      return {
        name,
        stats: toWorkoutStats(detail),
      };
    })
    .filter(Boolean);
};

const extractPageContent = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const hydrateWorkoutPreview = async (normalizedPost, detailSource = {}) => {
  if (!normalizedPost || normalizedPost.hasWorkoutPreview || normalizedPost.type !== 'workout') {
    return normalizedPost;
  }

  const workoutId = Number(normalizedPost.workoutId ?? detailSource?.workoutId ?? 0);
  if (!Number.isFinite(workoutId) || workoutId <= 0) return normalizedPost;

  const date = extractDateOnly(normalizedPost.createdTime || detailSource?.createdTime || detailSource?.updatedTime);
  if (!date) return normalizedPost;

  try {
    const workoutResponse = await workoutApi.day(date, {
      page: 0,
      size: 50,
      sort: 'workoutDate,desc',
    });
    const workoutPayload = workoutResponse?.data?.data || workoutResponse?.data?.result || workoutResponse?.data;
    const workouts = extractPageContent(workoutPayload);
    const matched = workouts.find((item) => Number(item?.workoutId ?? item?.id) === workoutId);
    if (!matched) return normalizedPost;

    const exercises = normalizeWorkoutExercises(matched);
    if (exercises.length === 0) return normalizedPost;

    return {
      ...normalizedPost,
      hasWorkoutPreview: true,
      exercises,
    };
  } catch (error) {
    return normalizedPost;
  }
};

const loadDetail = async () => {
  if (!postId.value) {
    errorMessage.value = '잘못된 게시글 접근입니다.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  try {
    const [detailResponse, commentResponse] = await Promise.all([
      communityPostApi.detail(postId.value),
      communityCommentApi.list({
        postId: postId.value,
        page: 0,
        size: 20,
        sort: 'createdTime,asc',
      }),
    ]);
    const detailPayload = detailResponse?.data?.data || detailResponse?.data?.result || detailResponse?.data;
    const commentPayload = commentResponse?.data?.data || commentResponse?.data?.result || commentResponse?.data;
    const detailSource = detailPayload?.post && typeof detailPayload.post === 'object'
      ? { ...detailPayload, ...detailPayload.post }
      : detailPayload;
    let normalizedPost = normalizeCommunityPost(detailSource || {}, 0);
    normalizedPost = await hydrateWorkoutPreview(normalizedPost, detailSource || {});
    post.value = normalizedPost;
    isLiked.value = Boolean(post.value?.liked);
    comments.value = normalizeRootComments(commentPayload);
    replyLoadingMap.value = {};
    replyTarget.value = null;
  } catch (error) {
    const status = Number(error?.response?.status || 0);
    if (status === 403 || status === 404) {
      errorMessage.value = '게시글이 없거나 접근할 수 없습니다.';
    } else {
      errorMessage.value = '게시글 상세를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
    }
    post.value = null;
    comments.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadComments = async () => {
  if (!postId.value) return;
  const response = await communityCommentApi.list({
    postId: postId.value,
    page: 0,
    size: 20,
    sort: 'createdTime,asc',
  });
  const payload = response?.data?.data || response?.data?.result || response?.data;
  comments.value = normalizeRootComments(payload);
  replyLoadingMap.value = {};
};

const goBackToList = () => {
  router.push({ path: '/community', query: listQuery.value });
};

const togglePostActionMenu = () => {
  if (!isMyPost.value) return;
  isPostActionMenuOpen.value = !isPostActionMenuOpen.value;
};

const closePostActionMenu = () => {
  isPostActionMenuOpen.value = false;
};

const editPost = () => {
  if (!post.value?.id) return;
  closePostActionMenu();
  router.push({
    path: '/community/write',
    query: {
      editId: String(post.value.id),
    },
  });
};

const openDeleteConfirm = () => {
  closePostActionMenu();
  isDeleteModalOpen.value = true;
};

const closeDeleteConfirm = () => {
  if (isDeletingPost.value) return;
  isDeleteModalOpen.value = false;
};

const confirmDeletePost = async () => {
  if (!post.value?.id) return;
  isDeletingPost.value = true;
  try {
    await communityPostApi.delete(post.value.id);
    isDeleteModalOpen.value = false;
    goBackToList();
  } catch (error) {
    window.alert('게시글 삭제에 실패했습니다.');
  } finally {
    isDeletingPost.value = false;
  }
};

const openAuthorProfile = () => {
  if (!authorUserId.value) return;
  router.push({ path: '/profile', query: { userId: String(authorUserId.value) } });
};

const toggleLike = async () => {
  if (!post.value?.id) return;
  try {
    await communityLikeApi.toggle(post.value.id);
    isLiked.value = !isLiked.value;
    post.value = {
      ...post.value,
      likes: Math.max(0, Number(post.value.likes || 0) + (isLiked.value ? 1 : -1)),
    };
  } catch (error) {
    // keep current state on failure
  }
};

const toggleCommentLike = (rootCommentId, replyId = null) => {
  const rootId = String(rootCommentId);
  const replyKey = replyId == null ? null : String(replyId);
  const applyLikeToggle = (entry) => {
    const nextLiked = !entry.liked;
    return {
      ...entry,
      liked: nextLiked,
      likeCount: Math.max(0, toNumber(entry.likeCount, 0) + (nextLiked ? 1 : -1)),
    };
  };

  comments.value = comments.value.map((root) => {
    if (String(root.id) !== rootId) return root;
    if (replyKey == null) return applyLikeToggle(root);
    return {
      ...root,
      replies: root.replies.map((reply) => (
        String(reply.id) === replyKey ? applyLikeToggle(reply) : reply
      )),
    };
  });
};

const startReply = async (rootComment, targetComment = rootComment) => {
  const nickName = String(targetComment?.author || '').trim();
  if (!nickName) return;
  const targetCommentId = targetComment?.id ?? rootComment.id;
  replyTarget.value = {
    rootCommentId: rootComment.id,
    parentCommentId: targetCommentId,
    replyToUserId: targetComment?.userId ?? null,
    nickName,
  };

  const currentDraft = String(commentInput.value || '').replace(/^\s+/, '');
  const withoutOldMention = currentDraft.replace(/^@\S+\s*/, '');
  commentInput.value = withoutOldMention;

  await nextTick();
  if (commentInputEl.value && typeof commentInputEl.value.focus === 'function') {
    commentInputEl.value.focus();
    const caret = commentInput.value.length;
    if (typeof commentInputEl.value.setSelectionRange === 'function') {
      commentInputEl.value.setSelectionRange(caret, caret);
    }
  }
};

const clearReplyTarget = () => {
  replyTarget.value = null;
};

const handleCommentInput = (event) => {
  if (!replyTarget.value) return;
  const nextValue = String(event?.target?.value ?? commentInput.value ?? '');
  if (nextValue.trim().length === 0) {
    clearReplyTarget();
  }
};

const handleCommentInputKeydown = (event) => {
  if (!replyTarget.value) return;
  if (event?.key !== 'Backspace') return;
  if (String(commentInput.value || '').length > 0) return;
  clearReplyTarget();
};

const loadAllReplies = async (rootCommentId) => {
  if (!rootCommentId || replyLoadingMap.value[rootCommentId]) return;
  applyReplyLoading(rootCommentId, true);
  const targetRootId = String(rootCommentId);

  try {
    const response = await communityCommentApi.replies({
      parentCommentId: rootCommentId,
      page: 0,
      size: 50,
      sort: 'createdTime,asc',
    });
    const payload = response?.data?.data || response?.data?.result || response?.data;
    const incomingReplies = extractList(payload).map((item, index) => (
      normalizeCommentItem(item, index, rootCommentId)
    ));

    comments.value = comments.value.map((root) => {
      if (String(root.id) !== targetRootId) return root;
      const mergedReplies = mergeReplies(root.replies, incomingReplies);
      return {
        ...root,
        replies: mergedReplies,
        replyCount: Math.max(root.replyCount, mergedReplies.length),
      };
    });
  } catch (error) {
    // no-op: keep preview replies
  } finally {
    applyReplyLoading(rootCommentId, false);
  }
};

const submitComment = async () => {
  const contentDraft = commentInput.value.trim();
  if (!contentDraft || !post.value?.id) return;

  let content = contentDraft;
  const targetNickName = String(replyTarget.value?.nickName || '').trim();
  if (targetNickName) {
    const mentionPrefixPattern = new RegExp(`^@${escapeRegExp(targetNickName)}\\s+`);
    content = content.replace(mentionPrefixPattern, '').trim();
  }
  if (!content) return;

  try {
    await communityCommentApi.create({
      postId: post.value.id,
      contents: content,
      parentCommentId: replyTarget.value?.parentCommentId ?? null,
    });
    commentInput.value = '';
    replyTarget.value = null;
    await loadComments();
  } catch (error) {
    // keep current state on failure
  }
};

const showReportToast = (message) => {
  if (reportToastTimer) {
    clearTimeout(reportToastTimer);
    reportToastTimer = null;
  }
  reportToastMessage.value = message;
  reportToastTimer = window.setTimeout(() => {
    reportToastMessage.value = '';
    reportToastTimer = null;
  }, 1800);
};

const openReportModal = ({ refId, refType }) => {
  const normalizedRefId = Number(refId || 0);
  if (!normalizedRefId) return;
  reportTargetRefId.value = normalizedRefId;
  reportTargetType.value = String(refType || 'POST').toUpperCase();
  reportReason.value = '';
  reportErrorMessage.value = '';
  isSubmittingReport.value = false;
  isReportModalOpen.value = true;
};

const closeReportModal = () => {
  if (isSubmittingReport.value) return;
  isReportModalOpen.value = false;
  reportReason.value = '';
  reportErrorMessage.value = '';
  reportTargetRefId.value = null;
  reportTargetType.value = 'POST';
};

const submitReport = async () => {
  const targetId = Number(reportTargetRefId.value || 0);
  if (!targetId) return;
  const reason = String(reportReason.value || '').trim();
  if (reason.length < 5 || reason.length > 500) {
    reportErrorMessage.value = '신고 사유는 5자 이상 500자 이하로 입력해주세요.';
    return;
  }
  reportErrorMessage.value = '';
  isSubmittingReport.value = true;
  try {
    await reportApi.create({ refId: targetId, refType: reportTargetType.value, reason });
    isReportModalOpen.value = false;
    reportReason.value = '';
    reportTargetRefId.value = null;
    reportTargetType.value = 'POST';
    showReportToast('신고가 접수되었습니다.');
  } catch (error) {
    reportErrorMessage.value = '신고 처리에 실패했습니다.';
  } finally {
    isSubmittingReport.value = false;
  }
};

const handleDocumentPointerDown = (event) => {
  if (!isPostActionMenuOpen.value) return;
  const root = postActionMenuRef.value;
  if (!root) return;
  if (root.contains(event.target)) return;
  closePostActionMenu();
};

onMounted(() => {
  loadDetail();
  window.addEventListener('pointerdown', handleDocumentPointerDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handleDocumentPointerDown);
  if (reportToastTimer) {
    clearTimeout(reportToastTimer);
    reportToastTimer = null;
  }
});
</script>

<style scoped>
.v-community-detail-page,
.v-community-detail-main,
.v-community-detail-content,
.v-community-detail-body,
.v-community-detail-body .sx-views-community-communityview-020,
.v-community-detail-body .sx-views-community-communityview-022,
.v-community-detail-body .sx-views-community-communityview-033,
.v-community-detail-body .v-community-ig-input-wrap,
.v-community-detail-body .v-community-ig-input-box,
.v-community-detail-body .v-community-ig-input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.v-community-detail-main {
  overflow-x: hidden;
  background: #ffffff;
}

.v-community-detail-content {
  width: 100%;
  max-width: none;
  margin: 0;
  padding-left: 24px;
  padding-right: 24px;
  padding-bottom: 112px;
  background: #ffffff;
}

.v-community-detail-body .sx-views-community-communityview-021 > div:first-child {
  flex: 1;
  min-width: 0;
}

.v-community-detail-body .sx-views-community-communityview-020,
.v-community-detail-body .sx-views-community-communityview-021 {
  overflow: visible;
}

.v-community-detail-body .ux-views-community-communityview-027 {
  margin: 0;
  white-space: normal;
  overflow: visible;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.v-community-detail-head {
  display: flex;
  margin-bottom: 12px;
}

.v-post-action-wrap {
  position: relative;
}

.v-post-action-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 20;
  min-width: 120px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  padding: 6px;
  display: grid;
  gap: 4px;
}

.v-post-action-item {
  border: none;
  background: transparent;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  border-radius: 8px;
  padding: 8px 10px;
}

.v-post-action-item:hover {
  background: #f8fafc;
}

.v-post-action-item-danger {
  color: #ef4444;
}

.v-post-delete-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.v-post-delete-modal {
  width: min(360px, 100%);
  border-radius: 16px;
  background: #ffffff;
  padding: 20px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.2);
}

.v-post-delete-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.v-post-delete-desc {
  margin: 10px 0 0;
  font-size: 14px;
  color: #64748b;
}

.v-post-delete-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.v-post-delete-cancel,
.v-post-delete-confirm {
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 14px;
}

.v-post-delete-cancel {
  background: #f1f5f9;
  color: #475569;
}

.v-post-delete-confirm {
  background: #ef4444;
  color: #ffffff;
}

.v-community-detail-back {
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  padding: 0 14px;
}

.v-community-detail-error-wrap {
  display: grid;
  gap: 12px;
  justify-items: start;
}

.v-community-detail-body {
  display: grid;
  gap: 10px;
  min-width: 0;
  background: #ffffff;
}

.v-community-detail-page {
  background: #ffffff;
}

.v-community-detail-body .sx-views-community-communityview-020,
.v-community-detail-body .sx-views-community-communityview-022,
.v-community-detail-body .sx-views-community-communityview-033 {
  background: #ffffff;
}

.v-community-detail-image-wrap {
  max-width: 100%;
}

.v-user-profile-trigger {
  border: 0;
  padding: 0;
  margin: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.v-user-profile-trigger:disabled {
  cursor: default;
}

.v-user-profile-trigger:not(:disabled) {
  cursor: pointer;
}

.v-user-profile-trigger-text {
  font: inherit;
  color: inherit;
}

.v-user-profile-trigger-text:not(:disabled):hover .ux-views-community-communityview-030 {
  color: #2563eb;
  text-decoration: underline;
}

.v-community-detail-image {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}

.v-community-comment-empty {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  color: #94a3b8;
  padding: 14px 16px;
  font-size: 13px;
}

.v-community-thread {
  display: grid;
  gap: 6px;
}

.v-community-ig-list {
  min-height: 280px;
}

.v-community-ig-list-empty {
  display: flex;
  align-items: center;
}

.v-community-reply-list {
  display: grid;
  gap: 2px;
}

.v-community-ig-item {
  min-width: 0;
}

.v-community-ig-body {
  min-width: 0;
}

.v-community-ig-content {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.v-community-ig-mention {
  margin-right: 4px;
  color: #2563eb;
  font-weight: 700;
}

.v-community-like-count {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 600;
}

.v-community-more-replies-btn {
  margin-left: 46px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
}

.v-community-detail-body .v-community-ig-input {
  width: 100%;
}

.v-community-detail-body .v-community-ig-input-wrap {
  position: fixed;
  left: 64px;
  right: 0;
  bottom: 0;
  z-index: 1200;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 6px;
  width: auto;
  min-width: 0;
  margin-top: 8px;
  padding: 10px 24px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 -4px 18px rgba(15, 23, 42, 0.06);
}

.v-community-detail-body .v-community-ig-input-box {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.v-community-detail-body .v-community-ig-submit-btn {
  min-height: 36px;
}

.v-community-detail-body .v-community-ig-input-mention {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.v-community-detail-body .v-community-ig-input {
  min-width: 0;
  flex: 1;
}

@media (max-width: 767px) {
  .v-community-detail-content {
    margin: 0;
    padding-left: 8px;
    padding-right: 8px;
    padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px) + 88px);
  }

  .v-community-detail-body .sx-views-community-communityview-020 {
    padding-left: 12px;
    padding-right: 12px;
  }

  .v-community-detail-body .sx-views-community-communityview-022 {
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 12px;
  }

  .v-community-ig-reply {
    margin-left: 30px;
  }

  .v-community-more-replies-btn {
    margin-left: 36px;
  }

  .v-community-detail-body .v-community-ig-input-wrap {
    left: 0;
    right: 0;
    bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    padding: 8px 12px;
  }
}
</style>
