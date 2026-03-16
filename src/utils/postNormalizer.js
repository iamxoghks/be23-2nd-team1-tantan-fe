import { formatTimeAgo } from '@/utils/time';

const API_BASE_URL =
  import.meta.env.VUE_APP_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://server.nahcb572.shop';

const normalizedApiBaseUrl = String(API_BASE_URL || '').replace(/\/+$/, '');

const asTrimmedString = (value) => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
};

const firstNonEmptyString = (...values) => {
  for (let i = 0; i < values.length; i += 1) {
    const normalized = asTrimmedString(values[i]);
    if (normalized) return normalized;
  }
  return '';
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['y', 'yes', 'true', '1'].includes(normalized)) return true;
    if (['n', 'no', 'false', '0'].includes(normalized)) return false;
  }
  return fallback;
};

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const fallbackAvatar = (seed) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed || 'user')}&backgroundType=gradientLinear`;

const resolveMediaUrl = (rawUrl) => {
  const url = asTrimmedString(rawUrl);
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${normalizedApiBaseUrl}${url}`;
  return `${normalizedApiBaseUrl}/${url}`;
};

const pushImageUrl = (collector, rawUrl) => {
  const normalized = resolveMediaUrl(rawUrl);
  if (!normalized) return;
  if (collector.has(normalized)) return;
  collector.add(normalized);
};

const extractImageUrlFromItem = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (!isObject(item)) return '';

  const nestedImage = isObject(item.image)
    ? firstNonEmptyString(item.image.url, item.image.path, item.image.src, item.image.imageUrl)
    : item.image;
  const nestedFile = isObject(item.file)
    ? firstNonEmptyString(item.file.url, item.file.path, item.file.src, item.file.fileUrl)
    : item.file;

  return firstNonEmptyString(
    item.imageUrl,
    item.url,
    item.path,
    item.src,
    item.fileUrl,
    item.thumbnailUrl,
    item.previewUrl,
    nestedImage,
    nestedFile,
  );
};

const extractPostImageUrls = (post = {}) => {
  const collector = new Set();

  [
    post.image,
    post.imageUrl,
    post.thumbnail,
    post.thumbnailUrl,
    post.mainImage,
    post.mainImageUrl,
    post.coverImage,
    post.coverImageUrl,
    post.postImage,
    post.postImageUrl,
    post.firstImage,
    post.firstImageUrl,
    post.previewImage,
    post.previewImageUrl,
  ].forEach((candidate) => {
    pushImageUrl(collector, candidate);
  });

  [
    post.images,
    post.imageUrls,
    post.imageList,
    post.imageDtoList,
    post.postImageDtoList,
    post.postImages,
    post.postImageUrls,
    post.postImageList,
    post.attachments,
    post.files,
    post.media,
    post.photos,
    post.photoUrls,
    post.uploadFiles,
  ].forEach((group) => {
    if (!Array.isArray(group)) return;
    group.forEach((item) => {
      pushImageUrl(collector, extractImageUrlFromItem(item));
    });
  });

  return Array.from(collector);
};

const toExerciseStats = (detail = {}) => {
  const statsText = asTrimmedString(detail.stats || detail.summary || detail.record);
  if (statsText) return statsText;

  const weight = toNumber(detail.weight, NaN);
  const setCount = toNumber(detail.setCount, NaN);
  const rep = toNumber(detail.rep, NaN);

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

const normalizeExercises = (rawDetails = []) => rawDetails
  .map((detail, index) => {
    if (typeof detail === 'string') {
      const name = asTrimmedString(detail);
      return name ? { name, stats: '-' } : null;
    }

    if (!isObject(detail)) return null;
    const name = firstNonEmptyString(
      detail.workoutName,
      detail.exerciseName,
      detail.name,
      detail.title,
      detail.label,
      detail.movement,
    ) || `운동 ${index + 1}`;
    return {
      name,
      stats: toExerciseStats(detail),
    };
  })
  .filter(Boolean);

const formatDurationFromMinutes = (minutes) => {
  const normalized = toNumber(minutes, 0);
  if (!normalized) return '';
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  if (hour > 0 && minute > 0) return `${hour}시간 ${minute}분`;
  if (hour > 0) return `${hour}시간`;
  return `${minute}분`;
};

const extractWorkout = (post = {}) => {
  const nestedWorkout = [
    post.workout,
    post.workoutInfo,
    post.workoutSummary,
    post.workoutDto,
    post.attachedWorkout,
    post.attachWorkout,
    post.workoutRecord,
    post.workoutData,
  ].find((candidate) => isObject(candidate)) || {};

  const rawDetails = [
    post.exercises,
    post.workoutDetails,
    post.workoutDetailList,
    post.workoutDetailDtoList,
    post.workoutDetailCreateDtoList,
    nestedWorkout.exercises,
    nestedWorkout.workoutDetails,
    nestedWorkout.workoutDetailList,
    nestedWorkout.workoutDetailDtoList,
    nestedWorkout.workoutDetailCreateDtoList,
  ].find((candidate) => Array.isArray(candidate) && candidate.length > 0) || [];

  const exercises = normalizeExercises(rawDetails);

  const duration = firstNonEmptyString(
    post.duration,
    post.totalDuration,
    nestedWorkout.duration,
    nestedWorkout.totalDuration,
    formatDurationFromMinutes(post.durationMinutes ?? post.totalMinutes ?? nestedWorkout.durationMinutes),
  );

  const gymName = firstNonEmptyString(
    post.gymName,
    post.gymTitle,
    post.gym?.name,
    nestedWorkout.gymName,
    nestedWorkout.gymTitle,
    nestedWorkout.gym?.name,
    post.placeName,
    nestedWorkout.placeName,
  );

  const streak = toNumber(
    post.streakDays ??
      post.streak ??
      nestedWorkout.streakDays ??
      nestedWorkout.streak ??
      nestedWorkout.streakCount,
    0,
  );

  const hasDuration = Boolean(duration && duration !== '-');
  const hasGymName = Boolean(gymName && gymName !== '-' && gymName !== '운동 기록');
  const hasStreak = Number.isFinite(streak) && streak > 0;
  const hasExercises = exercises.length > 0;

  const workoutId = post.workoutId ??
    post.attachWorkoutId ??
    nestedWorkout.workoutId ??
    nestedWorkout.id ??
    null;

  const hasWorkoutFlag = Boolean(
    workoutId ||
    post.hasWorkout ||
    post.isWorkoutAttached ||
    post.workoutAttached ||
    post.attachedWorkout ||
    post.attachWorkout,
  );

  const hasPreview = hasExercises || hasGymName || hasDuration || hasStreak;
  const attached = hasWorkoutFlag || hasPreview;

  return {
    attached,
    hasPreview,
    workoutId,
    gymName,
    duration,
    streak,
    exercises,
  };
};

const inferPostType = (post = {}, workout = { attached: false }) => {
  const rawType = firstNonEmptyString(post.type, post.postType, post.feedType, post.refType).toUpperCase();
  if (rawType.includes('WORKOUT')) return 'workout';
  if (workout.attached) return 'workout';
  return 'post';
};

const extractAuthorName = (post = {}, fallback = '작성자') => firstNonEmptyString(
  post.displayName,
  post.author,
  post.userName,
  post.nickName,
  post.writerName,
  post.writer,
  post.user?.displayName,
  post.user?.nickName,
) || fallback;

const extractAuthorImage = (post = {}, authorName = '') => resolveMediaUrl(firstNonEmptyString(
  post.authorImage,
  post.profileImage,
  post.profileImageUrl,
  post.userProfileImage,
  post.writerProfileImage,
  post.user?.profileImageUrl,
  post.user?.profileImage,
)) || fallbackAvatar(authorName);

export const normalizeCommunityPost = (item = {}, index = 0) => {
  const post = isObject(item?.post) ? { ...item, ...item.post } : item;
  const images = extractPostImageUrls(post);
  const workout = extractWorkout(post);
  const type = inferPostType(post, workout);
  const author = extractAuthorName(post, `user_${index + 1}`);

  return {
    ...post,
    id: post.id ?? post.postId ?? post.communityPostId ?? `post-${index + 1}`,
    postId: post.id ?? post.postId ?? post.communityPostId ?? null,
    type,
    hasWorkout: workout.attached,
    hasWorkoutPreview: workout.hasPreview,
    workoutId: workout.workoutId,
    title: firstNonEmptyString(post.title, post.postTitle, '제목 없음'),
    excerpt: firstNonEmptyString(
      post.excerpt,
      post.summary,
      post.contentPreview,
      post.content,
      post.contents,
      post.title,
      '본문은 상세보기에서 확인하세요.',
    ),
    content: firstNonEmptyString(post.content, post.contents, post.contentPreview, ''),
    time: firstNonEmptyString(post.time, formatTimeAgo(post.createdTime || post.createdAt || post.createdDate)),
    createdTime: post.createdTime || post.createdAt || post.createdDate || '',
    likes: toNumber(post.likes ?? post.likeCount ?? post.likeCnt, 0),
    comments: toNumber(post.comments ?? post.commentCount ?? post.commentCnt, 0),
    views: toNumber(post.views ?? post.viewCount ?? post.readCount ?? post.hitCount, 0),
    category: firstNonEmptyString(post.category, post.categoryName, post.boardCategory, '자유게시판'),
    author,
    authorImage: extractAuthorImage(post, author),
    image: images[0] || '',
    images,
    gymName: workout.gymName || '운동 기록',
    duration: workout.duration || '-',
    streak: workout.streak,
    exercises: workout.exercises,
    liked: toBoolean(post.liked ?? post.isLiked ?? post.likeYn, false),
    location: firstNonEmptyString(post.location, post.address, post.region),
  };
};
