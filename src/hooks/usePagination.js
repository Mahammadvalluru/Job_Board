// ─── usePagination Hook ───────────────────────────────────────────────────────
// Manages pagination state and exposes navigation helpers.

import { useState, useMemo, useCallback } from 'react';

/**
 * @param {number} totalItems — total number of items
 * @param {number} pageSize — items per page (default 10)
 * @returns pagination state and controls
 */
export function usePagination(totalItems, pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  // Clamp current page to valid range whenever totalPages changes
  const safePage = useMemo(
    () => Math.min(Math.max(1, currentPage), totalPages),
    [currentPage, totalPages]
  );

  const setPage = useCallback(
    (page) => {
      const clamped = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(clamped);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  return {
    currentPage: safePage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    pageSize,
  };
}
