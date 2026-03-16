const USER_AVATAR_PLACEHOLDER_SVG = [
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96' fill='none'>",
  "<rect width='96' height='96' rx='48' fill='#F1F5F9'/>",
  "<circle cx='48' cy='33' r='16' fill='#94A3B8'/>",
  "<path d='M20 78c4.5-14 16.9-22 28-22s23.5 8 28 22' fill='#94A3B8'/>",
  "</svg>",
].join('');

export const USER_AVATAR_PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(USER_AVATAR_PLACEHOLDER_SVG)}`;

const normalizeAvatarSource = (value) => (typeof value === 'string' ? value.trim() : '');

export const resolveUserAvatar = (value) => normalizeAvatarSource(value) || USER_AVATAR_PLACEHOLDER;

export const handleUserAvatarError = (event) => {
  const target = event?.target;
  if (!target || typeof target !== 'object' || !('src' in target)) return;
  target.onerror = null;
  target.src = USER_AVATAR_PLACEHOLDER;
};
