import { create } from 'zustand';

const LOCAL_STORAGE_KEY = 'maha_interop_auth';

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        refreshToken: parsed.refreshToken || null,
        isAuthenticated: !!parsed.token,
      };
    }
  } catch (e) {
    console.error('Failed to parse stored auth:', e);
  }
  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  };
};

export const useAuthStore = create((set, get) => ({
  ...getInitialState(),

  setAuth: ({ user, accessToken, refreshToken }) => {
    const newState = {
      user,
      token: accessToken,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to persist auth:', e);
    }
    set(newState);
  },

  updateUser: (user) => {
    const current = get();
    const newState = { ...current, user };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
