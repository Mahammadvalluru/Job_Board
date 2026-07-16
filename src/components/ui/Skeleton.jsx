import React from 'react';
import './Skeleton.css';

/**
 * Skeleton — loading placeholder shapes.
 *
 * @param {'text'|'circle'|'rect'|'card'} [variant='text']
 * @param {string|number} [width]
 * @param {string|number} [height]
 * @param {number} [count=1]     — for text variant, renders multiple lines
 * @param {string} [className]
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) {
  const style = {
    width: width ?? undefined,
    height: height ?? undefined,
  };

  if (variant === 'text' && count > 1) {
    return (
      <div className={`skeleton-text-stack ${className}`} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="skeleton skeleton--text"
            style={i === count - 1 ? { ...style, width: width || '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * JobCardSkeleton — preset skeleton that mimics a JobCard layout.
 */
export function JobCardSkeleton() {
  return (
    <div className="skeleton-job-card" aria-hidden="true">
      <div className="skeleton-job-card__header">
        <div className="skeleton skeleton-job-card__logo" />
        <div className="skeleton-job-card__info">
          <div className="skeleton skeleton-job-card__title" />
          <div className="skeleton skeleton-job-card__company" />
        </div>
      </div>
      <div className="skeleton-job-card__meta">
        <div className="skeleton skeleton-job-card__meta-item" />
        <div className="skeleton skeleton-job-card__meta-item" />
        <div className="skeleton skeleton-job-card__meta-item" />
      </div>
      <div className="skeleton-job-card__chips">
        <div className="skeleton skeleton-job-card__chip" />
        <div className="skeleton skeleton-job-card__chip" />
      </div>
    </div>
  );
}
