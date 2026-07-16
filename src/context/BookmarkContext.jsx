// ─── Bookmark Context ─────────────────────────────────────────────────────────
// Manages saved/bookmarked jobs with localStorage persistence.
// Syncs guest bookmarks with user bookmarks on login.

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getData, setData } from '../services/api';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext(null);

const STORAGE_KEY = 'bookmarks';

// ── Action types ────────────────────────────────────────
const SET_BOOKMARKS = 'SET_BOOKMARKS';
const TOGGLE_BOOKMARK = 'TOGGLE_BOOKMARK';

function bookmarkReducer(state, action) {
  switch (action.type) {
    case SET_BOOKMARKS:
      return action.payload;
    case TOGGLE_BOOKMARK: {
      const jobId = action.payload;
      if (state.includes(jobId)) {
        return state.filter((id) => id !== jobId);
      }
      return [...state, jobId];
    }
    default:
      return state;
  }
}

/**
 * Load bookmarks for a specific seeker from the data store,
 * or from a guest localStorage key if no user is logged in.
 */
function loadBookmarks(userId) {
  if (userId) {
    const allBookmarks = getData(STORAGE_KEY) || [];
    const entry = allBookmarks.find((b) => b.seekerId === userId);
    return entry ? entry.jobIds : [];
  }
  // Guest bookmarks stored under a dedicated key
  return getData('guestBookmarks') || [];
}

/**
 * Persist bookmarks for a specific seeker into the data store,
 * or into a guest localStorage key if no user is logged in.
 */
function saveBookmarks(userId, jobIds) {
  if (userId) {
    const allBookmarks = getData(STORAGE_KEY) || [];
    const idx = allBookmarks.findIndex((b) => b.seekerId === userId);
    if (idx !== -1) {
      allBookmarks[idx].jobIds = jobIds;
    } else {
      allBookmarks.push({ seekerId: userId, jobIds });
    }
    setData(STORAGE_KEY, allBookmarks);
  } else {
    setData('guestBookmarks', jobIds);
  }
}

export function BookmarkProvider({ children }) {
  const { user } = useAuth();
  const [bookmarks, dispatch] = useReducer(bookmarkReducer, []);

  // ── Load & sync bookmarks when user changes ──────────
  useEffect(() => {
    const userId = user?.id || null;
    let userBookmarks = loadBookmarks(userId);

    // If user just logged in, merge any guest bookmarks
    if (userId) {
      const guestBookmarks = getData('guestBookmarks') || [];
      if (guestBookmarks.length > 0) {
        const merged = Array.from(new Set([...userBookmarks, ...guestBookmarks]));
        userBookmarks = merged;
        saveBookmarks(userId, merged);
        // Clear guest bookmarks after merge
        localStorage.removeItem('guestBookmarks');
      }
    }

    dispatch({ type: SET_BOOKMARKS, payload: userBookmarks });
  }, [user]);

  // ── Toggle bookmark ───────────────────────────────────
  const toggleBookmark = useCallback(
    (jobId) => {
      dispatch({ type: TOGGLE_BOOKMARK, payload: jobId });

      // Compute the new list (since the reducer hasn't run yet, calculate manually)
      const userId = user?.id || null;
      const current = loadBookmarks(userId);
      let updated;
      if (current.includes(jobId)) {
        updated = current.filter((id) => id !== jobId);
      } else {
        updated = [...current, jobId];
      }
      saveBookmarks(userId, updated);
    },
    [user]
  );

  // ── Check if a job is bookmarked ──────────────────────
  const isBookmarked = useCallback(
    (jobId) => bookmarks.includes(jobId),
    [bookmarks]
  );

  const value = {
    bookmarks,
    bookmarkCount: bookmarks.length,
    toggleBookmark,
    isBookmarked,
  };

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

/**
 * Custom hook to consume bookmark context.
 * Throws if used outside of BookmarkProvider.
 */
export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
