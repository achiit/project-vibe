import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChallengeCard } from '../components/challenges/ChallengeCard';
import { useChallenges } from '../hooks/useChallenges';
import { useAuthStore } from '../store/useAuthStore';

export const ChallengesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { 
    challenges, 
    loading, 
    error, 
    hasMore, 
    fetchChallenges, 
    loadMore 
  } = useChallenges({
    type: selectedType !== 'all' ? selectedType as any : undefined,
    difficulty: selectedDifficulty !== 'all' ? selectedDifficulty as any : undefined,
    status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
    limit: 12,
  });

  useEffect(() => {
    fetchChallenges();
  }, [selectedType, selectedDifficulty, selectedStatus]);

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleChallengeClick = (challengeId: string) => {
    navigate(`/challenges/${challengeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Challenges</h1>
            <p className="text-gray-600">Discover and join coding competitions worldwide</p>
          </div>
          
          {user && (
            <Link to="/create">
              <Button className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Create Challenge
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8" padding="md">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search challenges..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select
                className="input-field min-w-32"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="vibe_coding">Vibe Coding</option>
                <option value="hackathon">Hackathon</option>
                <option value="bounty">Bounty</option>
              </select>
              
              <select
                className="input-field min-w-32"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                className="input-field min-w-32"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="submission_phase">Submission Phase</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8" padding="md">
            <div className="text-center text-red-600">
              <p>Error loading challenges: {error}</p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => fetchChallenges()}
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && challenges.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        )}

        {/* Challenge Grid */}
        {!loading || challenges.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClick={() => handleChallengeClick(challenge.id)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="text-center mt-8">
                <Button 
                  variant="secondary" 
                  onClick={loadMore}
                  loading={loading}
                >
                  Load More Challenges
                </Button>
              </div>
            )}
          </>
        ) : null}

        {/* Empty State */}
        {!loading && filteredChallenges.length === 0 && !error && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedType !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search filters'
                : 'Be the first to create a challenge!'
              }
            </p>
            {user && (
              <Link to="/create">
                <Button>Create Your First Challenge</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};