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
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseTeam } from '../types/firebase';

class TeamService {
  private teamsCollection = collection(db, 'teams');

  // Create a new team
  async createTeam(teamData: Omit<FirebaseTeam, 'id' | 'created_at' | 'updated_at' | 'members'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const team: Omit<FirebaseTeam, 'id'> = {
        ...teamData,
        members: [{
          user_uid: teamData.leader_uid,
          role: 'leader',
          joined_at: now,
          status: 'active',
        }],
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(this.teamsCollection, team);
      return docRef.id;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  // Get team by ID
  async getTeamById(teamId: string): Promise<FirebaseTeam | null> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);

      if (teamDoc.exists()) {
        return {
          id: teamDoc.id,
          ...teamDoc.data(),
        } as FirebaseTeam;
      }

      return null;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  }

  // Get teams by challenge
  async getTeamsByChallenge(challengeId: string): Promise<FirebaseTeam[]> {
    try {
      const q = query(
        this.teamsCollection,
        where('challenge_id', '==', challengeId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const teams: FirebaseTeam[] = [];

      querySnapshot.forEach((doc) => {
        teams.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseTeam);
      });

      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  // Get user's teams
  async getUserTeams(userId: string): Promise<FirebaseTeam[]> {
    try {
      const q = query(
        this.teamsCollection,
        where('members', 'array-contains-any', [{ user_uid: userId }]),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const teams: FirebaseTeam[] = [];

      querySnapshot.forEach((doc) => {
        const team = {
          id: doc.id,
          ...doc.data(),
        } as FirebaseTeam;
        
        // Only include if user is an active member
        if (team.members.some(member => 
          member.user_uid === userId && member.status === 'active'
        )) {
          teams.push(team);
        }
      });

      return teams;
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw error;
    }
  }

  // Join team
  async joinTeam(teamId: string, userId: string): Promise<void> {
    try {
      const team = await this.getTeamById(teamId);
      if (!team) throw new Error('Team not found');

      // Check if team is full
      const activeMembers = team.members.filter(m => m.status === 'active');
      if (activeMembers.length >= team.max_size) {
        throw new Error('Team is full');
      }

      // Check if user is already a member
      if (team.members.some(m => m.user_uid === userId && m.status === 'active')) {
        throw new Error('User is already a member of this team');
      }

      const teamRef = doc(db, 'teams', teamId);
      const newMember = {
        user_uid: userId,
        role: 'member' as const,
        joined_at: Timestamp.now(),
        status: 'active' as const,
      };

      await updateDoc(teamRef, {
        members: arrayUnion(newMember),
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error joining team:', error);
      throw error;
    }
  }

  // Leave team
  async leaveTeam(teamId: string, userId: string): Promise<void> {
    try {
      const team = await this.getTeamById(teamId);
      if (!team) throw new Error('Team not found');

      const member = team.members.find(m => m.user_uid === userId && m.status === 'active');
      if (!member) throw new Error('User is not a member of this team');

      // If user is the leader and there are other members, transfer leadership
      if (member.role === 'leader') {
        const otherActiveMembers = team.members.filter(m => 
          m.user_uid !== userId && m.status === 'active'
        );
        
        if (otherActiveMembers.length > 0) {
          // Transfer leadership to the first other member
          const newLeader = otherActiveMembers[0];
          const updatedMembers = team.members.map(m => {
            if (m.user_uid === newLeader.user_uid) {
              return { ...m, role: 'leader' as const };
            }
            if (m.user_uid === userId) {
              return { ...m, status: 'left' as const };
            }
            return m;
          });

          const teamRef = doc(db, 'teams', teamId);
          await updateDoc(teamRef, {
            leader_uid: newLeader.user_uid,
            members: updatedMembers,
            updated_at: Timestamp.now(),
          });
        } else {
          // Delete team if leader leaves and no other members
          await this.deleteTeam(teamId);
        }
      } else {
        // Regular member leaving
        const updatedMembers = team.members.map(m => 
          m.user_uid === userId ? { ...m, status: 'left' as const } : m
        );

        const teamRef = doc(db, 'teams', teamId);
        await updateDoc(teamRef, {
          members: updatedMembers,
          updated_at: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      throw error;
    }
  }

  // Remove member (leader only)
  async removeMember(teamId: string, leaderId: string, memberToRemoveId: string): Promise<void> {
    try {
      const team = await this.getTeamById(teamId);
      if (!team) throw new Error('Team not found');

      // Check if requester is the leader
      if (team.leader_uid !== leaderId) {
        throw new Error('Only team leader can remove members');
      }

      // Can't remove the leader
      if (memberToRemoveId === leaderId) {
        throw new Error('Leader cannot remove themselves');
      }

      const updatedMembers = team.members.map(m => 
        m.user_uid === memberToRemoveId ? { ...m, status: 'removed' as const } : m
      );

      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        members: updatedMembers,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  // Update team
  async updateTeam(teamId: string, updates: Partial<FirebaseTeam>): Promise<void> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        ...updates,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }

  // Delete team
  async deleteTeam(teamId: string): Promise<void> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await deleteDoc(teamRef);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }
}

export const teamService = new TeamService();