import { useState, useEffect } from 'react';
import { challengeService } from '../services/challenge.service';
import { FirebaseChallenge } from '../types/firebase';

interface UseChallengesOptions {
  type?: 'vibe_coding' | 'hackathon' | 'bounty';
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'pending' | 'active' | 'submission_phase' | 'judging' | 'completed' | 'cancelled';
  creator_uid?: string;
  limit?: number;
  autoFetch?: boolean;
}

export const useChallenges = (options: UseChallengesOptions = {}) => {
  const [challenges, setChallenges] = useState<FirebaseChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const fetchChallenges = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const { challenges: newChallenges, lastDoc: newLastDoc } = await challengeService.getChallenges({
        ...options,
        lastDoc: reset ? null : lastDoc,
      });

      if (reset) {
        setChallenges(newChallenges);
      } else {
        setChallenges(prev => [...prev, ...newChallenges]);
      }

      setLastDoc(newLastDoc);
      setHasMore(newChallenges.length === (options.limit || 20));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchChallenges(false);
    }
  };

  const refresh = () => {
    setLastDoc(null);
    fetchChallenges(true);
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchChallenges(true);
    }
  }, [options.type, options.difficulty, options.status, options.creator_uid]);

  return {
    challenges,
    loading,
    error,
    hasMore,
    fetchChallenges: () => fetchChallenges(true),
    loadMore,
    refresh,
  };
};

export const useChallenge = (challengeId: string) => {
  const [challenge, setChallenge] = useState<FirebaseChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const challenge = await challengeService.getChallengeById(challengeId);
      setChallenge(challenge);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateChallenge = async (updates: Partial<FirebaseChallenge>) => {
    try {
      setError(null);
      await challengeService.updateChallenge(challengeId, updates);
      if (challenge) {
        setChallenge({ ...challenge, ...updates });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const joinChallenge = async (userId: string, teamId?: string) => {
    try {
      setError(null);
      await challengeService.joinChallenge(challengeId, userId, teamId);
      await fetchChallenge(); // Refresh challenge data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const leaveChallenge = async (userId: string) => {
    try {
      setError(null);
      await challengeService.leaveChallenge(challengeId, userId);
      await fetchChallenge(); // Refresh challenge data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const submitSolution = async (
    userId: string,
    submission: {
      submission_url: string;
      github_repo?: string;
      description: string;
    },
    teamId?: string
  ) => {
    try {
      setError(null);
      await challengeService.submitSolution(challengeId, userId, submission, teamId);
      await fetchChallenge(); // Refresh challenge data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  return {
    challenge,
    loading,
    error,
    fetchChallenge,
    updateChallenge,
    joinChallenge,
    leaveChallenge,
    submitSolution,
  };
};