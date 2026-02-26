/**
 * Extracts the response payload from a backend response.
 * Handles common Spring Boot response wrappers: { data: { data|result: T } }
 *
 * @param {any} response - Axios response object
 * @param {any} fallback - Value returned when no payload is found (default: null)
 */
export const extractPayload = (response, fallback = null) =>
  response?.data?.data ?? response?.data?.result ?? response?.data ?? fallback;

/**
 * Extracts a flat array from a paginated or plain-array payload.
 * Handles Spring Pageable responses (content), and common list field names.
 *
 * @param {any} payload - The payload extracted by extractPayload
 */
export const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.posts)) return payload.posts;
  return [];
};
