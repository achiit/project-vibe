import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseApplication } from '../types/firebase';

class ApplicationService {
  private applicationsCollection = collection(db, 'applications');

  // Submit application
  async submitApplication(applicationData: Omit<FirebaseApplication, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const application: Omit<FirebaseApplication, 'id'> = {
        ...applicationData,
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(this.applicationsCollection, application);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  // Get application by ID
  async getApplicationById(applicationId: string): Promise<FirebaseApplication | null> {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      const applicationDoc = await getDoc(applicationRef);

      if (applicationDoc.exists()) {
        return {
          id: applicationDoc.id,
          ...applicationDoc.data(),
        } as FirebaseApplication;
      }

      return null;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }

  // Get applications by challenge
  async getApplicationsByChallenge(challengeId: string): Promise<FirebaseApplication[]> {
    try {
      const q = query(
        this.applicationsCollection,
        where('challenge_id', '==', challengeId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applications: FirebaseApplication[] = [];

      querySnapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseApplication);
      });

      return applications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  // Get user's application for a specific challenge
  async getUserApplication(challengeId: string, userId: string): Promise<FirebaseApplication | null> {
    try {
      const q = query(
        this.applicationsCollection,
        where('challenge_id', '==', challengeId),
        where('applicant_uid', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        } as FirebaseApplication;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user application:', error);
      throw error;
    }
  }

  // Get user's applications
  async getUserApplications(userId: string): Promise<FirebaseApplication[]> {
    try {
      const q = query(
        this.applicationsCollection,
        where('applicant_uid', '==', userId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applications: FirebaseApplication[] = [];

      querySnapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseApplication);
      });

      return applications;
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  }

  // Update application status
  async updateApplicationStatus(applicationId: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Update application
  async updateApplication(applicationId: string, updates: Partial<FirebaseApplication>): Promise<void> {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        ...updates,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }
}

export const applicationService = new ApplicationService();