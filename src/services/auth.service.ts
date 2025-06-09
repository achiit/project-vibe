import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseAuthUser,
  GithubAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { FirebaseUser } from '../types/firebase';

class AuthService {
  private githubProvider: GithubAuthProvider;

  constructor() {
    this.githubProvider = new GithubAuthProvider();
    this.githubProvider.addScope('user:email');
    this.githubProvider.addScope('read:user');
  }

  // Sign in with GitHub
  async signInWithGitHub(): Promise<FirebaseUser | null> {
    try {
      const result = await signInWithPopup(auth, this.githubProvider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error('Failed to get GitHub access token');
      }

      // Fetch additional GitHub data
      const githubData = await this.fetchGitHubUserData(token);
      
      // Create or update user document
      const user = await this.createOrUpdateUser(result.user, githubData);
      
      return user;
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  }

  // Fetch GitHub user data using access token
  private async fetchGitHubUserData(token: string) {
    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch('https://api.github.com/user', {
          headers: { Authorization: `token ${token}` },
        }),
        fetch('https://api.github.com/user/repos?per_page=100', {
          headers: { Authorization: `token ${token}` },
        }),
      ]);

      const userData = await userResponse.json();
      const reposData = await reposResponse.json();

      // Extract languages from repositories
      const languages = [...new Set(
        reposData
          .filter((repo: any) => repo.language)
          .map((repo: any) => repo.language)
      )];

      return {
        username: userData.login,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        public_repos: userData.public_repos,
        languages,
        created_at: userData.created_at,
        html_url: userData.html_url,
        followers: userData.followers,
        following: userData.following,
      };
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      throw error;
    }
  }

  // Create or update user document in Firestore
  private async createOrUpdateUser(
    firebaseUser: FirebaseAuthUser,
    githubData: any
  ): Promise<FirebaseUser> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    const now = Timestamp.now();

    if (userDoc.exists()) {
      // Update existing user
      const existingData = userDoc.data() as FirebaseUser;
      const updatedUser: FirebaseUser = {
        ...existingData,
        email: firebaseUser.email || existingData.email,
        displayName: firebaseUser.displayName || existingData.displayName,
        photoURL: firebaseUser.photoURL || existingData.photoURL,
        github: {
          ...existingData.github,
          ...githubData,
        },
        updated_at: now,
        platform: {
          ...existingData.platform,
          last_active: now,
        },
      };

      await updateDoc(userRef, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const newUser: FirebaseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        github: githubData,
        platform: {
          rating: 1200, // Starting rating
          challenges_created: 0,
          challenges_won: 0,
          challenges_participated: 0,
          joined_at: now,
          last_active: now,
          preferences: {
            email_notifications: true,
            public_profile: true,
            preferred_languages: githubData.languages.slice(0, 3),
          },
        },
        created_at: now,
        updated_at: now,
      };

      await setDoc(userRef, newUser);
      return newUser;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        
        if (firebaseUser) {
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              resolve(userDoc.data() as FirebaseUser);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            callback(userDoc.data() as FirebaseUser);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<FirebaseUser>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();