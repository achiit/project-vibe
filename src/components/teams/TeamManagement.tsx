import React, { useState, useEffect } from 'react';
import { Users, Plus, Crown, UserMinus, Mail, Check, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { teamService } from '../../services/team.service';
import { FirebaseTeam } from '../../types/firebase';

interface TeamManagementProps {
  challengeId: string;
  maxTeamSize?: number;
  onTeamUpdate?: () => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  challengeId,
  maxTeamSize = 4,
  onTeamUpdate,
}) => {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<FirebaseTeam[]>([]);
  const [userTeam, setUserTeam] = useState<FirebaseTeam | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [challengeId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const challengeTeams = await teamService.getTeamsByChallenge(challengeId);
      setTeams(challengeTeams);
      
      if (user) {
        const myTeam = challengeTeams.find(team => 
          team.members.some(member => member.user_uid === user.uid && member.status === 'active')
        );
        setUserTeam(myTeam || null);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      await teamService.createTeam({
        challenge_id: challengeId,
        name: teamName,
        description: teamDescription,
        leader_uid: user.uid,
        max_size: maxTeamSize,
        is_open: true,
      });
      
      setTeamName('');
      setTeamDescription('');
      setShowCreateForm(false);
      await fetchTeams();
      onTeamUpdate?.();
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!user) return;

    try {
      await teamService.joinTeam(teamId, user.uid);
      await fetchTeams();
      onTeamUpdate?.();
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;

    if (confirm('Are you sure you want to leave this team?')) {
      try {
        await teamService.leaveTeam(teamId, user.uid);
        await fetchTeams();
        onTeamUpdate?.();
      } catch (error) {
        console.error('Error leaving team:', error);
      }
    }
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User's Team */}
      {userTeam && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-500" />
            Your Team: {userTeam.name}
          </h3>
          
          {userTeam.description && (
            <p className="text-gray-600 mb-4">{userTeam.description}</p>
          )}
          
          <div className="space-y-3">
            {userTeam.members
              .filter(member => member.status === 'active')
              .map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Member {index + 1}</p>
                    <div className="flex items-center space-x-2">
                      {member.role === 'leader' && (
                        <Badge variant="warning\" size="sm">Leader</Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        Joined {member.joined_at.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {user?.uid === userTeam.leader_uid && member.user_uid !== user.uid && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {/* Remove member logic */}}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {userTeam.members.filter(m => m.status === 'active').length}/{userTeam.max_size} members
            </span>
            
            {user?.uid !== userTeam.leader_uid && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleLeaveTeam(userTeam.id)}
              >
                Leave Team
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Available Teams */}
      {!userTeam && (
        <Card padding="lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Available Teams</h3>
            <Button
              size="sm"
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Team</span>
            </Button>
          </div>

          {teams.filter(team => team.is_open && 
            team.members.filter(m => m.status === 'active').length < team.max_size
          ).length > 0 ? (
            <div className="space-y-4">
              {teams
                .filter(team => team.is_open && 
                  team.members.filter(m => m.status === 'active').length < team.max_size
                )
                .map((team) => (
                <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{team.name}</h4>
                      {team.description && (
                        <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                      )}
                    </div>
                    <Badge variant="primary" size="sm">
                      {team.members.filter(m => m.status === 'active').length}/{team.max_size}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Created {team.created_at.toDate().toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleJoinTeam(team.id)}
                    >
                      Join Team
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No available teams</p>
              <p className="text-sm text-gray-500">Create a team to get started</p>
            </div>
          )}
        </Card>
      )}

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>
            
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Describe your team's goals and approach"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={creating}
                  disabled={creating}
                >
                  Create Team
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};