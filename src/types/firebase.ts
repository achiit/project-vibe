import { Timestamp } from 'firebase/firestore';

// User types for Firebase
export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  github: {
    username: string;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    languages: string[];
    created_at: string;
    html_url: string;
    followers: number;
    following: number;
  };
  platform: {
    rating: number;
    challenges_created: number;
    challenges_won: number;
    challenges_participated: number;
    profile_image_url?: string;
    joined_at: Timestamp;
    last_active: Timestamp;
    preferences: {
      email_notifications: boolean;
      public_profile: boolean;
      preferred_languages: string[];
    };
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Challenge types for Firebase
export interface FirebaseChallenge {
  id: string;
  creator_uid: string;
  type: 'vibe_coding' | 'hackathon' | 'bounty';
  title: string;
  description: string;
  banner_image_url?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_hours: number;
  languages_allowed: string[];
  privacy: 'public' | 'private';
  status: 'pending' | 'active' | 'submission_phase' | 'judging' | 'completed' | 'cancelled';
  max_participants: number;
  max_team_size?: number;
  prize_amount?: number;
  participants: Array<{
    user_uid: string;
    team_id?: string;
    joined_at: Timestamp;
    status: 'active' | 'submitted' | 'disqualified';
  }>;
  problem: {
    statement: string;
    requirements: string[];
    submission_format: string;
    judging_criteria: string[];
    test_cases?: Array<{
      input: string;
      expected_output: string;
      is_public: boolean;
    }>;
  };
  submissions?: Array<{
    user_uid: string;
    team_id?: string;
    submission_url: string;
    github_repo?: string;
    description: string;
    submitted_at: Timestamp;
    score?: number;
    feedback?: string;
  }>;
  created_at: Timestamp;
  started_at?: Timestamp;
  submission_deadline?: Timestamp;
  ended_at?: Timestamp;
  updated_at: Timestamp;
}

// Team types for Firebase
export interface FirebaseTeam {
  id: string;
  challenge_id: string;
  name: string;
  description?: string;
  leader_uid: string;
  members: Array<{
    user_uid: string;
    role: 'leader' | 'member';
    joined_at: Timestamp;
    status: 'active' | 'left' | 'removed';
  }>;
  max_size: number;
  is_open: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Application types for Firebase
export interface FirebaseApplication {
  id: string;
  challenge_id: string;
  applicant_uid: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Notification types for Firebase
export interface FirebaseNotification {
  id: string;
  user_uid: string;
  type: 'challenge_invite' | 'challenge_start' | 'challenge_end' | 'team_invite' | 'submission_feedback' | 'rating_change' | 'application_status';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: Timestamp;
}

// Leaderboard types for Firebase
export interface FirebaseLeaderboardEntry {
  user_uid: string;
  username: string;
  avatar_url: string;
  rating: number;
  challenges_won: number;
  challenges_participated: number;
  rank: number;
  updated_at: Timestamp;
}

// Rating history for tracking user progress
export interface FirebaseRatingHistory {
  id: string;
  user_uid: string;
  challenge_id: string;
  old_rating: number;
  new_rating: number;
  rating_change: number;
  reason: 'challenge_win' | 'challenge_loss' | 'challenge_participation';
  created_at: Timestamp;
}

// Challenge invitation system
export interface FirebaseChallengeInvite {
  id: string;
  challenge_id: string;
  inviter_uid: string;
  invitee_uid: string;
  team_id?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: Timestamp;
  updated_at: Timestamp;
}