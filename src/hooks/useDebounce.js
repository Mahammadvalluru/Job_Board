// ─── useDebounce Hook ─────────────────────────────────────────────────────────
// Returns a debounced version of a value that only updates after `delay` ms of
// inactivity. Useful for search inputs, filter fields, etc.

import { useState, useEffect } from 'react';

/**
 * @param {any} value — the raw, rapidly-changing value
 * @param {number} delay — debounce delay in ms (default 300)
 * @returns {any} the debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
