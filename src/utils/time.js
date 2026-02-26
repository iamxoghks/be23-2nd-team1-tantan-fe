/**
 * Returns a human-readable relative time string in Korean.
 * e.g. "방금 전", "5분 전", "2시간 전", "3일 전"
 *
 * @param {string|number|Date} value - ISO string or timestamp
 */
export const formatTimeAgo = (value) => {
  if (!value) return '방금 전';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '방금 전';
  const diff = Date.now() - date.getTime();
  const minute = Math.floor(diff / 60000);
  if (minute < 1) return '방금 전';
  if (minute < 60) return `${minute}분 전`;
  const hour = Math.floor(minute / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  return `${day}일 전`;
};
