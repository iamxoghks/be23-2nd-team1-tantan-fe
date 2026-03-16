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
  for (let index = 0; index < values.length; index += 1) {
    const normalized = asTrimmedString(values[index]);
    if (normalized) return normalized;
  }
  return '';
};

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

export const normalizeImageVariant = (item) => {
  if (!item) return null;
  if (typeof item === 'string') {
    const resolved = resolveMediaUrl(item);
    if (!resolved) return null;
    return {
      id: null,
      sortOrder: null,
      url: resolved,
      originalUrl: resolved,
      thumbnailUrl: resolved,
    };
  }
  if (typeof item !== 'object' || Array.isArray(item)) return null;

  const originalUrl = resolveMediaUrl(firstNonEmptyString(
    item.originalUrl,
    item.imageUrl,
    item.url,
    item.path,
    item.src,
  ));
  const thumbnailUrl = resolveMediaUrl(firstNonEmptyString(
    item.thumbnailUrl,
    item.thumbUrl,
    item.previewUrl,
    originalUrl,
  ));

  if (!originalUrl && !thumbnailUrl) return null;

  return {
    ...item,
    id: item.id ?? item.imgId ?? null,
    sortOrder: item.sortOrder ?? null,
    url: originalUrl || thumbnailUrl,
    originalUrl: originalUrl || thumbnailUrl,
    thumbnailUrl: thumbnailUrl || originalUrl,
  };
};

export const toImageVariantItems = (rawImages) => {
  if (!rawImages) return [];
  const source = Array.isArray(rawImages) ? rawImages : [rawImages];
  const result = [];
  const seen = new Set();

  source.forEach((item) => {
    const normalized = normalizeImageVariant(item);
    if (!normalized) return;
    const key = `${normalized.originalUrl}|${normalized.thumbnailUrl}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(normalized);
  });

  return result;
};

export const toOriginalImageUrls = (rawImages) =>
  toImageVariantItems(rawImages)
    .map((item) => item.originalUrl)
    .filter(Boolean);

export const toThumbnailImageUrls = (rawImages) =>
  toImageVariantItems(rawImages)
    .map((item) => item.thumbnailUrl || item.originalUrl)
    .filter(Boolean);

export const getPrimaryOriginalImageUrl = (rawImages) =>
  toImageVariantItems(rawImages)[0]?.originalUrl || '';

export const getPrimaryThumbnailImageUrl = (rawImages) =>
  toImageVariantItems(rawImages)[0]?.thumbnailUrl
  || toImageVariantItems(rawImages)[0]?.originalUrl
  || '';
