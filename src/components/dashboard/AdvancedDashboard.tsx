import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Code, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award,
  Target,
  Clock,
  Star,
  GitBranch,
  Activity,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { challengeService } from '../../services/challenge.service';
import { FirebaseChallenge } from '../../types/firebase';

interface DashboardStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  winRate: number;
  averageRating: number;
  totalEarnings: number;
  currentStreak: number;
  bestRank: number;
}

export const AdvancedDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [userChallenges, setUserChallenges] = useState<{
    created: FirebaseChallenge[];
    participating: FirebaseChallenge[];
  }>({ created: [], participating: [] });
  const [stats, setStats] = useState<DashboardStats>({
    totalChallenges: 0,
    activeChallenges: 0,
    completedChallenges: 0,
    winRate: 0,
    averageRating: 0,
    totalEarnings: 0,
    currentStreak: 0,
    bestRank: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, selectedTimeframe]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const challenges = await challengeService.getUserChallenges(user.uid);
      setUserChallenges(challenges);
      
      // Calculate advanced stats
      const totalParticipated = challenges.participating.length;
      const completedChallenges = challenges.participating.filter(c => c.status === 'completed').length;
      const activeChallenges = challenges.participating.filter(c => 
        c.status === 'active' || c.status === 'submission_phase'
      ).length;
      
      const winRate = totalParticipated > 0 ? (user.platform.challenges_won / totalParticipated) * 100 : 0;
      
      // Calculate total earnings from bounty challenges
      const totalEarnings = challenges.participating
        .filter(c => c.type === 'bounty' && c.status === 'completed')
        .reduce((sum, c) => sum + (c.prize_amount || 0), 0);

      setStats({
        totalChallenges: totalParticipated,
        activeChallenges,
        completedChallenges,
        winRate,
        averageRating: user.platform.rating,
        totalEarnings,
        currentStreak: calculateStreak(challenges.participating),
        bestRank: calculateBestRank(challenges.participating),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (challenges: FirebaseChallenge[]): number => {
    // Simple streak calculation - consecutive wins
    const sortedChallenges = challenges
      .filter(c => c.status === 'completed')
      .sort((a, b) => b.created_at.toMillis() - a.created_at.toMillis());
    
    let streak = 0;
    for (const challenge of sortedChallenges) {
      // This would need actual win/loss data
      // For now, return a mock value
      streak++;
      if (streak >= 3) break; // Mock logic
    }
    return streak;
  };

  const calculateBestRank = (challenges: FirebaseChallenge[]): number => {
    // Mock calculation - would need actual ranking data
    return Math.floor(Math.random() * 100) + 1;
  };

  const getRecentActivity = () => {
    const activities = [
      ...userChallenges.created.slice(0, 3).map(challenge => ({
        type: 'created' as const,
        challenge: challenge.title,
        date: challenge.created_at.toDate(),
        points: 'Challenge created',
        icon: Users,
        color: 'text-green-600',
      })),
      ...userChallenges.participating.slice(0, 3).map(challenge => ({
        type: 'joined' as const,
        challenge: challenge.title,
        date: challenge.participants.find(p => p.user_uid === user?.uid)?.joined_at.toDate() || new Date(),
        points: challenge.status === 'completed' ? '+25 rating' : 'In progress',
        icon: Code,
        color: 'text-blue-600',
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    return activities;
  };

  const getSkillDistribution = () => {
    if (!user) return [];
    
    const languages = user.github.languages.slice(0, 5);
    return languages.map((lang, index) => ({
      name: lang,
      value: Math.floor(Math.random() * 100) + 1, // Mock data
      color: `hsl(${index * 60}, 70%, 50%)`,
    }));
  };

  if (!user) {
    return (
      <Card padding="lg\" className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your dashboard</h1>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with timeframe selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.github.username}!
          </h1>
          <p className="text-gray-600">Here's your coding performance overview</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="input-field py-2"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="lg" className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalChallenges}</div>
          <div className="text-sm text-gray-600">Total Challenges</div>
          <div className="text-xs text-green-600 mt-1">
            +{stats.activeChallenges} active
          </div>
        </Card>

        <Card padding="lg" className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
            <Trophy className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.winRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
          <div className="text-xs text-blue-600 mt-1">
            {user.platform.challenges_won} wins
          </div>
        </Card>

        <Card padding="lg" className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{user.platform.rating}</div>
          <div className="text-sm text-gray-600">Current Rating</div>
          <div className="text-xs text-green-600 mt-1">
            Rank #{stats.bestRank}
          </div>
        </Card>

        <Card padding="lg" className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <Award className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">${stats.totalEarnings}</div>
          <div className="text-sm text-gray-600">Total Earnings</div>
          <div className="text-xs text-orange-600 mt-1">
            {stats.currentStreak} win streak
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Performance Overview
            </h2>
            
            {/* Mock performance chart */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rating Progress</span>
                <span className="text-sm font-medium text-green-600">+150 this month</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Challenge Completion</span>
                <span className="text-sm font-medium text-blue-600">{stats.completedChallenges}/{stats.totalChallenges}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ 
                  width: `${stats.totalChallenges > 0 ? (stats.completedChallenges / stats.totalChallenges) * 100 : 0}%` 
                }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Skill Level</span>
                <span className="text-sm font-medium text-purple-600">Advanced</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            {/* Recent achievements */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">First Win</p>
                    <p className="text-xs text-gray-600">Completed first challenge</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <GitBranch className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Player</p>
                    <p className="text-xs text-gray-600">Joined 3 teams</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Skills & Activity */}
        <div className="space-y-6">
          {/* Skills Distribution */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Skills Distribution
            </h3>
            
            <div className="space-y-3">
              {getSkillDistribution().map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">{skill.name}</span>
                    <span className="text-sm font-medium text-gray-900">{skill.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${skill.value}%`,
                        backgroundColor: skill.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getRecentActivity().map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.type === 'created' ? 'Created' : 'Joined'} {activity.challenge}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.date.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Badge variant="primary" size="sm">
                      {activity.points}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="secondary">
                <Target className="h-4 w-4 mr-2" />
                Find New Challenges
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <Users className="h-4 w-4 mr-2" />
                Join a Team
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <Clock className="h-4 w-4 mr-2" />
                View Active Challenges
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};