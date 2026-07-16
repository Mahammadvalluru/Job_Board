import React from 'react';
import './StatusBadge.css';

const LABELS = {
  'applied': 'Applied',
  'under-review': 'Under Review',
  'interview': 'Interview',
  'offer': 'Offer',
  'rejected': 'Rejected',
  'active': 'Active',
  'closed': 'Closed',
  'draft': 'Draft',
};

/**
 * StatusBadge — dot + label indicating application / listing status.
 *
 * @param {string} props.status  — one of the LABELS keys
 * @param {'sm'|'md'} [props.size='md']
 * @param {string} [props.className]
 */
export default function StatusBadge({
  status,
  size = 'md',
  className = '',
}) {
  const label = LABELS[status] || status;

  return (
    <span className={`status-badge status-badge--${status} status-badge--${size} ${className}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
