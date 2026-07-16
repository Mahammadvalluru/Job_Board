// ─── useLocalStorage Hook ─────────────────────────────────────────────────────
// Works like useState but persists the value in localStorage.
// Supports objects, arrays, and primitives via JSON serialization.

import { useState, useCallback } from 'react';

/**
 * @param {string} key — localStorage key
 * @param {any} initialValue — default value if key doesn't exist yet
 * @returns {[any, Function]} [storedValue, setValue]
 */
export function useLocalStorage(key, initialValue) {
  // Lazy initializer — read from localStorage only once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      console.warn(`useLocalStorage: failed to read key "${key}", using initial value.`);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        // Allow functional updates like useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.warn(`useLocalStorage: failed to write key "${key}"`, err);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
