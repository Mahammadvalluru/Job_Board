import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

/* ── Toast Context ─────────────────────────────────────────── */
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

/* ── Single Toast Item ─────────────────────────────────────── */
function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 250);
  }, [toast.id, onRemove]);

  useEffect(() => {
    if (toast.duration !== Infinity) {
      timerRef.current = setTimeout(dismiss, toast.duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [toast.duration, dismiss]);

  return (
    <div
      className={`toast toast--${toast.type} ${exiting ? 'toast--exiting' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="toast__icon" aria-hidden="true">{ICONS[toast.type]}</span>
      <div className="toast__content">
        <p className="toast__message">{toast.message}</p>
      </div>
      <button
        className="toast__close"
        onClick={dismiss}
        aria-label="Dismiss notification"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
      {toast.duration !== Infinity && (
        <div
          className="toast__progress"
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      )}
    </div>
  );
}

/* ── Toast Provider ────────────────────────────────────────── */
let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, opts = {}) => addToast({ message, ...opts }),
    [addToast]
  );

  toast.success = (message, opts) => addToast({ type: 'success', message, ...opts });
  toast.error = (message, opts) => addToast({ type: 'error', message, ...opts });
  toast.warning = (message, opts) => addToast({ type: 'warning', message, ...opts });
  toast.info = (message, opts) => addToast({ type: 'info', message, ...opts });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="toast-container" aria-label="Notifications">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
