import { API_BASE_URL } from '../api/client';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

export const resolveMediaUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;

  const url = value.trim();

  if (ABSOLUTE_URL_PATTERN.test(url)) return url;

  if (url.startsWith('//')) {
    const protocol = new URL(API_BASE_URL).protocol || 'https:';
    return `${protocol}${url}`;
  }

  try {
    return new URL(url, `${API_BASE_URL}/`).toString();
  } catch {
    return null;
  }
};
