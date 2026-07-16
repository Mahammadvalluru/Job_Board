import React, { useMemo } from 'react';
import './Pagination.css';

/**
 * Pagination — page navigation with ellipsis, mobile compact mode.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) {
  /* Build the visible page range with ellipsis */
  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items = [];
    items.push(1);

    if (currentPage > 3) items.push('ellipsis-start');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) items.push(i);

    if (currentPage < totalPages - 2) items.push('ellipsis-end');

    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className={`pagination ${className}`} aria-label="Pagination">
      {/* ── Full view (desktop) ──────────────────────────────── */}
      <div className="pagination__full">
        <button
          className="pagination__btn pagination__btn--arrow"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 4l-4 4 4 4" />
          </svg>
          Prev
        </button>

        {pages.map((page, idx) =>
          typeof page === 'string' ? (
            <span key={page} className="pagination__ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={page}
              className={`pagination__btn ${page === currentPage ? 'pagination__btn--active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
              type="button"
            >
              {page}
            </button>
          )
        )}

        <button
          className="pagination__btn pagination__btn--arrow"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          type="button"
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* ── Compact view (mobile) ────────────────────────────── */}
      <div className="pagination__compact">
        <button
          className="pagination__btn pagination__btn--arrow"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 4l-4 4 4 4" />
          </svg>
        </button>

        <span>
          <span>{currentPage}</span> / {totalPages}
        </span>

        <button
          className="pagination__btn pagination__btn--arrow"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
