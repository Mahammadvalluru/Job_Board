// ─── Toast Context ────────────────────────────────────────────────────────────
// Global toast notification system with auto-dismissal.

import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

// ── Action types ────────────────────────────────────────
const ADD_TOAST = 'ADD_TOAST';
const REMOVE_TOAST = 'REMOVE_TOAST';

function toastReducer(state, action) {
  switch (action.type) {
    case ADD_TOAST:
      return [...state, action.payload];
    case REMOVE_TOAST:
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const counterRef = useRef(0);

  /**
   * Show a toast notification.
   * @param {string} message — the notification text
   * @param {'info'|'success'|'error'|'warning'} type — style variant
   * @param {number} duration — auto-dismiss delay in ms (0 = persistent)
   */
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast_${++counterRef.current}_${Date.now()}`;
    dispatch({ type: ADD_TOAST, payload: { id, message, type } });

    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: REMOVE_TOAST, payload: id });
      }, duration);
    }

    return id;
  }, []);

  /**
   * Manually remove a toast by id.
   */
  const removeToast = useCallback((id) => {
    dispatch({ type: REMOVE_TOAST, payload: id });
  }, []);

  const value = { toasts, showToast, removeToast };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

/**
 * Custom hook to consume toast context.
 * Throws if used outside of ToastProvider.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
