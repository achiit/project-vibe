import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { challengeService } from '../../services/challenge.service';
import { FirebaseChallenge } from '../../types/firebase';
import { Timestamp } from 'firebase/firestore';

interface FormData {
  title: string;
  description: string;
  type: 'vibe_coding' | 'hackathon' | 'bounty';
  difficulty: 'easy' | 'medium' | 'hard';
  duration_hours: number;
  languages_allowed: string[];
  privacy: 'public' | 'private';
  prize_amount?: number;
  max_team_size?: number;
  problem_statement: string;
  requirements: string;
  submission_format: string;
  judging_criteria: string;
}

export const CreateChallengeForm: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'vibe_coding',
    difficulty: 'medium',
    duration_hours: 2,
    languages_allowed: [],
    privacy: 'public',
    problem_statement: '',
    requirements: '',
    submission_format: '',
    judging_criteria: '',
  });

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const availableLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a challenge');
      return;
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one programming language');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const challengeData: Omit<FirebaseChallenge, 'id' | 'created_at' | 'updated_at'> = {
        creator_uid: user.uid,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        duration_hours: formData.duration_hours,
        languages_allowed: selectedLanguages,
        privacy: formData.privacy,
        status: 'pending',
        max_participants: formData.type === 'vibe_coding' ? 2 : 999,
        max_team_size: formData.max_team_size,
        prize_amount: formData.prize_amount,
        participants: [],
        problem: {
          statement: formData.problem_statement,
          requirements: formData.requirements.split('\n').filter(r => r.trim()),
          submission_format: formData.submission_format,
          judging_criteria: formData.judging_criteria.split('\n').filter(c => c.trim()),
        },
      };

      const challengeId = await challengeService.createChallenge(challengeData);
      
      // Update user's challenge count
      await user && challengeService.updateChallenge(challengeId, {
        id: challengeId,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      navigate('/challenges');
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError(error instanceof Error ? error.message : 'Failed to create challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card padding="lg\" className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to create a challenge.</p>
          <Button onClick={() => navigate('/')}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card padding="lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Challenge</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Title
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter challenge title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Type
              </label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="vibe_coding">Vibe Coding (1v1)</option>
                <option value="hackathon">Hackathon (Team)</option>
                <option value="bounty">Bounty (Individual)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                className="input-field"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (hours)
              </label>
              <select
                className="input-field"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
              >
                <option value={0.5}>30 minutes</option>
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={6}>6 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              className="input-field"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your challenge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Programming Languages *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {availableLanguages.map((lang) => (
                <label key={lang} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedLanguages.includes(lang)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLanguages([...selectedLanguages, lang]);
                      } else {
                        setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy
              </label>
              <select
                className="input-field"
                value={formData.privacy}
                onChange={(e) => setFormData({ ...formData, privacy: e.target.value as any })}
              >
                <option value="public">Public (Anyone can join)</option>
                <option value="private">Private (Invite only)</option>
              </select>
            </div>

            {formData.type === 'bounty' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Amount ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.prize_amount || ''}
                  onChange={(e) => setFormData({ ...formData, prize_amount: Number(e.target.value) })}
                  placeholder="Enter prize amount"
                />
              </div>
            )}

            {formData.type === 'hackathon' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Team Size
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.max_team_size || ''}
                  onChange={(e) => setFormData({ ...formData, max_team_size: Number(e.target.value) })}
                  placeholder="e.g., 4"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Statement
            </label>
            <textarea
              required
              className="input-field"
              rows={4}
              value={formData.problem_statement}
              onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
              placeholder="Describe the problem participants need to solve"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements (one per line)
            </label>
            <textarea
              required
              className="input-field"
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="List specific requirements for the solution"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Format
              </label>
              <textarea
                required
                className="input-field"
                rows={2}
                value={formData.submission_format}
                onChange={(e) => setFormData({ ...formData, submission_format: e.target.value })}
                placeholder="How should participants submit their solutions?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judging Criteria (one per line)
              </label>
              <textarea
                required
                className="input-field"
                rows={2}
                value={formData.judging_criteria}
                onChange={(e) => setFormData({ ...formData, judging_criteria: e.target.value })}
                placeholder="How will submissions be evaluated?"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate('/challenges')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Challenge
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};