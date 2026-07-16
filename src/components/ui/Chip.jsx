import React from 'react';
import './Chip.css';

/**
 * Chip — compact pill-shaped tag / badge.
 *
 * @param {string}  props.label
 * @param {Function} [props.onRemove]
 * @param {'default'|'primary'|'success'|'warning'|'error'} [props.variant='default']
 * @param {'sm'|'md'} [props.size='md']
 * @param {string} [props.className]
 */
export default function Chip({
  label,
  onRemove,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  return (
    <span className={`chip chip--${variant} chip--${size} ${className}`}>
      <span>{label}</span>
      {onRemove && (
        <button
          className="chip__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label}`}
          type="button"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </button>
      )}
    </span>
  );
}
