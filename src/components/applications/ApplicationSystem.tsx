import React, { useState, useEffect } from 'react';
import { Mail, Check, X, Clock, User, MessageSquare } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { applicationService } from '../../services/application.service';
import { FirebaseApplication } from '../../types/firebase';

interface ApplicationSystemProps {
  challengeId: string;
  isCreator: boolean;
  onApplicationUpdate?: () => void;
}

export const ApplicationSystem: React.FC<ApplicationSystemProps> = ({
  challengeId,
  isCreator,
  onApplicationUpdate,
}) => {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<FirebaseApplication[]>([]);
  const [userApplication, setUserApplication] = useState<FirebaseApplication | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [challengeId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      if (isCreator) {
        // Fetch all applications for this challenge
        const challengeApplications = await applicationService.getApplicationsByChallenge(challengeId);
        setApplications(challengeApplications);
      } else if (user) {
        // Fetch user's application for this challenge
        const myApplication = await applicationService.getUserApplication(challengeId, user.uid);
        setUserApplication(myApplication);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await applicationService.submitApplication({
        challenge_id: challengeId,
        applicant_uid: user.uid,
        message: applicationMessage,
        status: 'pending',
      });
      
      setApplicationMessage('');
      setShowApplicationForm(false);
      await fetchApplications();
      onApplicationUpdate?.();
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      await applicationService.updateApplicationStatus(applicationId, action === 'approve' ? 'approved' : 'rejected');
      await fetchApplications();
      onApplicationUpdate?.();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return Check;
      case 'rejected': return X;
      default: return Mail;
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

  // Creator view - manage applications
  if (isCreator) {
    return (
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Applications ({applications.length})
        </h3>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => {
              const StatusIcon = getStatusIcon(application.status);
              
              return (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Applicant</p>
                        <p className="text-sm text-gray-500">
                          Applied {application.created_at.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(application.status)} size="sm">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {application.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {application.message && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{application.message}</p>
                    </div>
                  )}

                  {application.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApplicationAction(application.id, 'approve')}
                        className="flex items-center space-x-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleApplicationAction(application.id, 'reject')}
                        className="flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No applications yet</p>
            <p className="text-sm text-gray-500">Applications will appear here when users apply</p>
          </div>
        )}
      </Card>
    );
  }

  // User view - apply or view application status
  return (
    <Card padding="lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Mail className="h-5 w-5 mr-2" />
        Application Status
      </h3>

      {userApplication ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Your Application</p>
              <p className="text-sm text-gray-500">
                Submitted {userApplication.created_at.toDate().toLocaleDateString()}
              </p>
            </div>
            <Badge variant={getStatusColor(userApplication.status)} size="sm">
              {userApplication.status.toUpperCase()}
            </Badge>
          </div>

          {userApplication.message && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Your Message:</p>
              <p className="text-sm text-gray-600">{userApplication.message}</p>
            </div>
          )}

          {userApplication.status === 'pending' && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Your application is being reviewed</span>
            </div>
          )}

          {userApplication.status === 'approved' && (
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">Your application has been approved!</span>
            </div>
          )}

          {userApplication.status === 'rejected' && (
            <div className="flex items-center space-x-2 text-red-600">
              <X className="h-4 w-4" />
              <span className="text-sm">Your application was not accepted</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!showApplicationForm ? (
            <div className="text-center py-6">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Apply to join this challenge</p>
              <Button
                onClick={() => setShowApplicationForm(true)}
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Submit Application</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Message
                </label>
                <textarea
                  rows={4}
                  className="input-field"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the challenge creator why you want to participate and what you can bring to this challenge..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowApplicationForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Card>
  );
};