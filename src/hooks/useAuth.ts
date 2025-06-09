import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { FirebaseUser } from '../types/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGitHub = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.signInWithGitHub();
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<FirebaseUser>) => {
    if (!user) return;

    try {
      setError(null);
      await authService.updateUserProfile(user.uid, updates);
      setUser({ ...user, ...updates });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGitHub,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
};