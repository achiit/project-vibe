import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Trophy, 
  Code, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle,
  Play,
  Upload,
  ExternalLink,
  Github,
  Award,
  Target,
  FileText,
  Gavel,
  UserPlus,
  Mail
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TeamManagement } from '../components/teams/TeamManagement';
import { ApplicationSystem } from '../components/applications/ApplicationSystem';
import { useChallenge } from '../hooks/useChallenges';
import { useAuthStore } from '../store/useAuthStore';
import { FirebaseChallenge } from '../types/firebase';

export const ChallengeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { challenge, loading, error, fetchChallenge, joinChallenge, leaveChallenge, submitSolution } = useChallenge(id!);
  
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    submission_url: '',
    github_repo: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChallenge();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card padding="lg" className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Challenge Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The challenge you\'re looking for doesn\'t exist.'}</p>
            <Button onClick={() => navigate('/challenges')}>
              Back to Challenges
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isParticipant = user && challenge.participants.some(p => p.user_uid === user.uid);
  const isCreator = user && challenge.creator_uid === user.uid;
  const hasSubmitted = user && challenge.submissions?.some(s => s.user_uid === user.uid);
  const canJoin = user && !isParticipant && !isCreator && challenge.status === 'pending' && 
                  challenge.participants.length < challenge.max_participants;
  const canSubmit = user && isParticipant && (challenge.status === 'active' || challenge.status === 'submission_phase') && !hasSubmitted;
  const requiresApplication = challenge.privacy === 'private' && !isParticipant && !isCreator;
  const isTeamChallenge = challenge.type === 'hackathon' && challenge.max_team_size && challenge.max_team_size > 1;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'active': return 'success';
      case 'submission_phase': return 'primary';
      case 'judging': return 'warning';
      case 'completed': return 'gray';
      case 'cancelled': return 'error';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vibe_coding': return Code;
      case 'hackathon': return Users;
      case 'bounty': return Trophy;
      default: return Code;
    }
  };

  const handleJoinChallenge = async () => {
    if (!user) return;
    
    setJoining(true);
    try {
      await joinChallenge(user.uid);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveChallenge = async () => {
    if (!user) return;
    
    if (confirm('Are you sure you want to leave this challenge?')) {
      try {
        await leaveChallenge(user.uid);
      } catch (error) {
        console.error('Failed to leave challenge:', error);
      }
    }
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await submitSolution(user.uid, submissionData);
      setShowSubmissionForm(false);
      setSubmissionData({ submission_url: '', github_repo: '', description: '' });
    } catch (error) {
      console.error('Failed to submit solution:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const TypeIcon = getTypeIcon(challenge.type);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button 
              onClick={() => navigate('/challenges')}
              className="hover:text-primary-600 transition-colors"
            >
              Challenges
            </button>
            <span>/</span>
            <span className="text-gray-900">{challenge.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <TypeIcon className="h-6 w-6 text-primary-600" />
                <Badge variant="primary" size="sm">
                  {challenge.type.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant={getDifficultyColor(challenge.difficulty)} size="sm">
                  {challenge.difficulty.toUpperCase()}
                </Badge>
                <Badge variant={getStatusColor(challenge.status)} size="sm">
                  {challenge.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {challenge.title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                {challenge.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{challenge.duration_hours}h duration</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{challenge.participants.length}/{challenge.max_participants} participants</span>
                </div>
                
                {challenge.prize_amount && (
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4" />
                    <span>${challenge.prize_amount} prize</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {challenge.created_at.toDate().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {requiresApplication && (
                <Button 
                  onClick={() => setShowApplications(true)}
                  className="flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Apply to Join</span>
                </Button>
              )}

              {canJoin && !requiresApplication && (
                <Button 
                  onClick={handleJoinChallenge}
                  loading={joining}
                  className="flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Join Challenge</span>
                </Button>
              )}

              {isTeamChallenge && isParticipant && (
                <Button 
                  variant="secondary"
                  onClick={() => setShowTeamManagement(true)}
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Manage Team</span>
                </Button>
              )}

              {isParticipant && !hasSubmitted && (
                <Button 
                  variant="secondary"
                  onClick={() => setShowSubmissionForm(true)}
                  disabled={!canSubmit}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Submit Solution</span>
                </Button>
              )}

              {isParticipant && hasSubmitted && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Solution Submitted</span>
                </div>
              )}

              {isParticipant && !isCreator && (
                <Button 
                  variant="danger"
                  size="sm"
                  onClick={handleLeaveChallenge}
                >
                  Leave Challenge
                </Button>
              )}

              {isCreator && (
                <div className="space-y-2">
                  <Badge variant="success" size="sm" className="text-center w-full">
                    Your Challenge
                  </Badge>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowApplications(true)}
                    className="w-full"
                  >
                    Manage Applications
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Problem Statement */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Problem Statement
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {challenge.problem.statement}
                </p>
              </div>
            </Card>

            {/* Requirements */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Requirements
              </h2>
              <ul className="space-y-2">
                {challenge.problem.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Team Management for Hackathons */}
            {isTeamChallenge && isParticipant && (
              <TeamManagement 
                challengeId={challenge.id}
                maxTeamSize={challenge.max_team_size}
                onTeamUpdate={fetchChallenge}
              />
            )}

            {/* Submission Format */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Submission Format
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {challenge.problem.submission_format}
              </p>
            </Card>

            {/* Judging Criteria */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Gavel className="h-5 w-5 mr-2" />
                Judging Criteria
              </h2>
              <ul className="space-y-2">
                {challenge.problem.judging_criteria.map((criteria, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Award className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{criteria}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Submissions */}
            {challenge.submissions && challenge.submissions.length > 0 && (
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Submissions ({challenge.submissions.length})
                </h2>
                <div className="space-y-4">
                  {challenge.submissions.map((submission, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            Participant {index + 1}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {submission.submitted_at.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{submission.description}</p>
                      
                      <div className="flex space-x-3">
                        {submission.submission_url && (
                          <a
                            href={submission.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>View Solution</span>
                          </a>
                        )}
                        
                        {submission.github_repo && (
                          <a
                            href={submission.github_repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-700"
                          >
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Challenge Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Languages Allowed</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {challenge.languages_allowed.map((lang) => (
                      <Badge key={lang} variant="gray" size="sm">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Privacy</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{challenge.privacy}</p>
                </div>

                {challenge.max_team_size && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Max Team Size</label>
                    <p className="mt-1 text-sm text-gray-900">{challenge.max_team_size} members</p>
                  </div>
                )}

                {challenge.started_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Started</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {challenge.started_at.toDate().toLocaleString()}
                    </p>
                  </div>
                )}

                {challenge.submission_deadline && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Submission Deadline</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {challenge.submission_deadline.toDate().toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Participants */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participants ({challenge.participants.length})
              </h3>
              
              {challenge.participants.length > 0 ? (
                <div className="space-y-3">
                  {challenge.participants.slice(0, 10).map((participant, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        Participant {index + 1}
                      </span>
                      {participant.team_id && (
                        <Badge variant="primary" size="sm">
                          Team {participant.team_id}
                        </Badge>
                      )}
                    </div>
                  ))}
                  
                  {challenge.participants.length > 10 && (
                    <p className="text-sm text-gray-500">
                      +{challenge.participants.length - 10} more participants
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No participants yet</p>
              )}
            </Card>
          </div>
        </div>

        {/* Modals */}
        
        {/* Team Management Modal */}
        {showTeamManagement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowTeamManagement(false)}
                  >
                    ×
                  </Button>
                </div>
                <TeamManagement 
                  challengeId={challenge.id}
                  maxTeamSize={challenge.max_team_size}
                  onTeamUpdate={() => {
                    fetchChallenge();
                    setShowTeamManagement(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Applications Modal */}
        {showApplications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isCreator ? 'Manage Applications' : 'Apply to Challenge'}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowApplications(false)}
                  >
                    ×
                  </Button>
                </div>
                <ApplicationSystem 
                  challengeId={challenge.id}
                  isCreator={isCreator}
                  onApplicationUpdate={() => {
                    fetchChallenge();
                    if (!isCreator) setShowApplications(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Submission Modal */}
        {showSubmissionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Your Solution</h2>
              
              <form onSubmit={handleSubmitSolution} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution URL *
                  </label>
                  <input
                    type="url"
                    required
                    className="input-field"
                    value={submissionData.submission_url}
                    onChange={(e) => setSubmissionData({ ...submissionData, submission_url: e.target.value })}
                    placeholder="https://your-solution-url.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository (optional)
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={submissionData.github_repo}
                    onChange={(e) => setSubmissionData({ ...submissionData, github_repo: e.target.value })}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="input-field"
                    value={submissionData.description}
                    onChange={(e) => setSubmissionData({ ...submissionData, description: e.target.value })}
                    placeholder="Describe your solution, approach, and any special features..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowSubmissionForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={submitting}
                  >
                    Submit Solution
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};