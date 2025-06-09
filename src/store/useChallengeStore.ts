import { create } from 'zustand';
import { FirebaseChallenge } from '../types/firebase';

interface ChallengeState {
  challenges: FirebaseChallenge[];
  currentChallenge: FirebaseChallenge | null;
  isLoading: boolean;
  setChallenges: (challenges: FirebaseChallenge[]) => void;
  addChallenge: (challenge: FirebaseChallenge) => void;
  updateChallenge: (id: string, updates: Partial<FirebaseChallenge>) => void;
  removeChallenge: (id: string) => void;
  setCurrentChallenge: (challenge: FirebaseChallenge | null) => void;
  setLoading: (loading: boolean) => void;
  clearChallenges: () => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  currentChallenge: null,
  isLoading: false,
  
  setChallenges: (challenges) => set({ challenges }),
  
  addChallenge: (challenge) =>
    set((state) => ({ 
      challenges: [challenge, ...state.challenges] 
    })),
  
  updateChallenge: (id, updates) =>
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      currentChallenge: 
        state.currentChallenge?.id === id 
          ? { ...state.currentChallenge, ...updates }
          : state.currentChallenge,
    })),
  
  removeChallenge: (id) =>
    set((state) => ({
      challenges: state.challenges.filter((c) => c.id !== id),
      currentChallenge: 
        state.currentChallenge?.id === id 
          ? null 
          : state.currentChallenge,
    })),
  
  setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearChallenges: () => set({ 
    challenges: [], 
    currentChallenge: null, 
    isLoading: false 
  }),
}));