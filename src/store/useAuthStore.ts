import { create } from 'zustand';
import { FirebaseUser } from '../types/firebase';

interface AuthState {
  user: FirebaseUser | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<FirebaseUser>) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  clearUser: () => set({ user: null, isLoading: false }),
}));