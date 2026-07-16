// ─── Mock API Utility ─────────────────────────────────────────────────────────
// Provides localStorage-based persistence and simulated network delays.
// Designed so each function could later be swapped for a real HTTP call.

import { companies, jobs, users, applications, bookmarks } from '../data/seedData';

const SIMULATED_DELAY = 300; // ms

/**
 * Initialize localStorage with seed data on first load.
 * Does NOT overwrite if data already exists — so user changes persist.
 */
export function initializeData() {
  const keys = {
    companies,
    jobs,
    users,
    applications,
    bookmarks,
  };

  Object.entries(keys).forEach(([key, seedValue]) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, JSON.stringify(seedValue));
    }
  });
}

/**
 * Get data from localStorage by key.
 * @param {string} key
 * @returns {any} parsed value or null
 */
export function getData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    console.error(`Failed to parse localStorage key "${key}"`);
    return null;
  }
}

/**
 * Set data in localStorage.
 * @param {string} key
 * @param {any} value — will be JSON-stringified
 */
export function setData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write localStorage key "${key}"`, err);
  }
}

/**
 * Simulate a network delay.
 * Adds a small random jitter so the UI feels natural.
 * @param {number} ms base delay in milliseconds
 */
export function simulateDelay(ms = SIMULATED_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 200));
}

/**
 * Generate a simple unique ID (good enough for a mock layer).
 * @param {string} prefix e.g. 'j', 'a', 'u', 'c'
 * @returns {string}
 */
export function generateId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
