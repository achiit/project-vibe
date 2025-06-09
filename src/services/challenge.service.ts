import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseChallenge } from '../types/firebase';

class ChallengeService {
  private challengesCollection = collection(db, 'challenges');

  // Create a new challenge
  async createChallenge(challengeData: Omit<FirebaseChallenge, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const challenge: Omit<FirebaseChallenge, 'id'> = {
        ...challengeData,
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(this.challengesCollection, challenge);
      return docRef.id;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  // Get challenge by ID
  async getChallengeById(challengeId: string): Promise<FirebaseChallenge | null> {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeRef);

      if (challengeDoc.exists()) {
        return {
          id: challengeDoc.id,
          ...challengeDoc.data(),
        } as FirebaseChallenge;
      }

      return null;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  }

  // Get challenges with filters and pagination
  async getChallenges(filters: {
    type?: 'vibe_coding' | 'hackathon' | 'bounty';
    difficulty?: 'easy' | 'medium' | 'hard';
    status?: 'pending' | 'active' | 'submission_phase' | 'judging' | 'completed' | 'cancelled';
    creator_uid?: string;
    limit?: number;
    lastDoc?: any;
  } = {}): Promise<{ challenges: FirebaseChallenge[]; lastDoc: any }> {
    try {
      let q = query(this.challengesCollection, orderBy('created_at', 'desc'));

      // Apply filters
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.creator_uid) {
        q = query(q, where('creator_uid', '==', filters.creator_uid));
      }

      // Apply pagination
      if (filters.lastDoc) {
        q = query(q, startAfter(filters.lastDoc));
      }
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const challenges: FirebaseChallenge[] = [];
      let lastDoc = null;

      querySnapshot.forEach((doc) => {
        challenges.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseChallenge);
        lastDoc = doc;
      });

      return { challenges, lastDoc };
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  // Update challenge
  async updateChallenge(challengeId: string, updates: Partial<FirebaseChallenge>): Promise<void> {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        ...updates,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  // Delete challenge
  async deleteChallenge(challengeId: string): Promise<void> {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await deleteDoc(challengeRef);
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  // Join challenge
  async joinChallenge(challengeId: string, userId: string, teamId?: string): Promise<void> {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const participant = {
        user_uid: userId,
        team_id: teamId,
        joined_at: Timestamp.now(),
        status: 'active' as const,
      };

      await updateDoc(challengeRef, {
        participants: arrayUnion(participant),
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  // Leave challenge
  async leaveChallenge(challengeId: string, userId: string): Promise<void> {
    try {
      const challenge = await this.getChallengeById(challengeId);
      if (!challenge) throw new Error('Challenge not found');

      const participant = challenge.participants.find(p => p.user_uid === userId);
      if (!participant) throw new Error('User not found in challenge');

      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        participants: arrayRemove(participant),
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error leaving challenge:', error);
      throw error;
    }
  }

  // Submit solution
  async submitSolution(
    challengeId: string,
    userId: string,
    submission: {
      submission_url: string;
      github_repo?: string;
      description: string;
    },
    teamId?: string
  ): Promise<void> {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const submissionData = {
        user_uid: userId,
        team_id: teamId,
        ...submission,
        submitted_at: Timestamp.now(),
      };

      await updateDoc(challengeRef, {
        submissions: arrayUnion(submissionData),
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error submitting solution:', error);
      throw error;
    }
  }

  // Get user's challenges
  async getUserChallenges(userId: string): Promise<{
    created: FirebaseChallenge[];
    participating: FirebaseChallenge[];
  }> {
    try {
      const [createdQuery, participatingQuery] = await Promise.all([
        getDocs(query(
          this.challengesCollection,
          where('creator_uid', '==', userId),
          orderBy('created_at', 'desc')
        )),
        getDocs(query(
          this.challengesCollection,
          where('participants', 'array-contains-any', [{ user_uid: userId }]),
          orderBy('created_at', 'desc')
        )),
      ]);

      const created: FirebaseChallenge[] = [];
      const participating: FirebaseChallenge[] = [];

      createdQuery.forEach((doc) => {
        created.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseChallenge);
      });

      participatingQuery.forEach((doc) => {
        const challenge = {
          id: doc.id,
          ...doc.data(),
        } as FirebaseChallenge;
        
        // Only include if user is actually participating (not creator)
        if (challenge.creator_uid !== userId) {
          participating.push(challenge);
        }
      });

      return { created, participating };
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      throw error;
    }
  }
}

export const challengeService = new ChallengeService();