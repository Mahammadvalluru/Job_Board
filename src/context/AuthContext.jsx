// ─── Auth Context ─────────────────────────────────────────────────────────────
// Provides authentication state and actions to the entire app.

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

// ── Action types ────────────────────────────────────────
const AUTH_LOADING = 'AUTH_LOADING';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_LOGOUT = 'AUTH_LOGOUT';
const AUTH_ERROR = 'AUTH_ERROR';
const AUTH_UPDATE_USER = 'AUTH_UPDATE_USER';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_LOADING:
      return { ...state, loading: true, error: null };
    case AUTH_SUCCESS:
      return { user: action.payload, isAuthenticated: true, loading: false, error: null };
    case AUTH_LOGOUT:
      return { user: null, isAuthenticated: false, loading: false, error: null };
    case AUTH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case AUTH_UPDATE_USER:
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── On mount: restore session from localStorage ───────
  useEffect(() => {
    const existingUser = authService.getCurrentUser();
    if (existingUser) {
      dispatch({ type: AUTH_SUCCESS, payload: existingUser });
    } else {
      dispatch({ type: AUTH_LOGOUT });
    }
  }, []);

  // ── Login ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_LOADING });
    try {
      const user = await authService.login(email, password);
      dispatch({ type: AUTH_SUCCESS, payload: user });
      return user;
    } catch (err) {
      dispatch({ type: AUTH_ERROR, payload: err.message });
      throw err;
    }
  }, []);

  // ── Register ──────────────────────────────────────────
  const register = useCallback(async (data) => {
    dispatch({ type: AUTH_LOADING });
    try {
      const user = await authService.register(data);
      dispatch({ type: AUTH_SUCCESS, payload: user });
      return user;
    } catch (err) {
      dispatch({ type: AUTH_ERROR, payload: err.message });
      throw err;
    }
  }, []);

  // ── Login Google ──────────────────────────────────────
  const loginGoogle = useCallback(async (email, name, role) => {
    dispatch({ type: AUTH_LOADING });
    try {
      const user = await authService.loginOrRegisterGoogle(email, name, role);
      dispatch({ type: AUTH_SUCCESS, payload: user });
      return user;
    } catch (err) {
      dispatch({ type: AUTH_ERROR, payload: err.message });
      throw err;
    }
  }, []);

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: AUTH_LOGOUT });
  }, []);

  // ── Update profile ────────────────────────────────────
  const updateProfile = useCallback(
    async (data) => {
      if (!state.user) throw new Error('Not authenticated');
      try {
        const updatedUser = await authService.updateProfile(state.user.id, data);
        dispatch({ type: AUTH_UPDATE_USER, payload: updatedUser });
        return updatedUser;
      } catch (err) {
        throw err;
      }
    },
    [state.user]
  );

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isEmployer: state.user?.role === 'employer',
    isSeeker: state.user?.role === 'seeker',
    loading: state.loading,
    error: state.error,
    login,
    register,
    loginGoogle,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume auth context.
 * Throws if used outside of AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
