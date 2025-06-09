import React from 'react';
import { Clock, Users, Trophy, Code, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Challenge } from '../../store/useChallengeStore';

interface ChallengeCardProps {
  challenge: Challenge;
  onClick?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onClick,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
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

  const TypeIcon = getTypeIcon(challenge.type);

  return (
    <Card hoverable onClick={onClick} className="cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <TypeIcon className="h-5 w-5 text-primary-600" />
          <Badge variant="primary" size="sm">
            {challenge.type.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <Badge variant={getDifficultyColor(challenge.difficulty)} size="sm">
          {challenge.difficulty.toUpperCase()}
        </Badge>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {challenge.title}
      </h3>
      
      <p className="text-gray-600 mb-4 line-clamp-2">
        {challenge.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{challenge.duration_hours}h</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{challenge.participants.length} joined</span>
          </div>
          
          {challenge.prize_amount && (
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4" />
              <span>${challenge.prize_amount}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(challenge.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {challenge.languages_allowed.slice(0, 3).map((lang) => (
          <Badge key={lang} variant="gray" size="sm">
            {lang}
          </Badge>
        ))}
        {challenge.languages_allowed.length > 3 && (
          <Badge variant="gray" size="sm">
            +{challenge.languages_allowed.length - 3} more
          </Badge>
        )}
      </div>
    </Card>
  );
};