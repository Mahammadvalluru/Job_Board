// ─── Formatters ──────────────────────────────────────────────────────────────
// Pure utility functions for display formatting.

/**
 * Format a salary range.
 * Supports both annual salaries (≥ 1000) and hourly rates (< 1000).
 *
 * @param {number} min
 * @param {number} max
 * @param {'compact'|'full'} style — 'compact' → $140k, 'full' → $140,000
 * @returns {string}
 */
export function formatSalary(min, max, style = 'compact') {
  if (min == null && max == null) return 'Salary not specified';

  const isHourly = (min != null && min < 1000) || (max != null && max < 1000);

  const fmt = (n) => {
    if (n == null) return '';
    if (isHourly) return `$${n}`;
    if (style === 'compact') return `$${Math.round(n / 1000)}k`;
    return `$${n.toLocaleString('en-US')}`;
  };

  const suffix = isHourly ? '/hr' : '/yr';

  if (min != null && max != null) {
    return `${fmt(min)} – ${fmt(max)}${suffix}`;
  }
  if (min != null) return `From ${fmt(min)}${suffix}`;
  return `Up to ${fmt(max)}${suffix}`;
}

/**
 * Format a date string to a human-readable format.
 * @param {string} dateString — ISO 8601 date string
 * @returns {string} e.g. 'Jul 10, 2025'
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Calculate a human-readable relative time string.
 * @param {string} dateString — ISO 8601 date string
 * @returns {string} e.g. '2 days ago', '1 week ago', 'Just now'
 */
export function timeAgo(dateString) {
  if (!dateString) return '';
  const now = Date.now();
  const then = new Date(dateString).getTime();
  if (isNaN(then)) return '';

  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWeek < 5) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;

  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
}

/**
 * Format a location string for display.
 * Handles 'Remote' as a special case with a different label.
 * @param {string} location
 * @returns {string}
 */
export function formatLocation(location) {
  if (!location) return '';
  if (location.toLowerCase() === 'remote') return '🌐 Remote';
  return `📍 ${location}`;
}

/**
 * Truncate text to a maximum length, appending '…' if truncated.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  // Truncate at the last space before maxLength to avoid cutting words
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}
