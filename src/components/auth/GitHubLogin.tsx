import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { Button } from '../ui/Button';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';

export const GitHubLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await authService.signInWithGitHub();
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleGitHubLogin}
        loading={isLoading}
        disabled={isLoading}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
      >
        <Github className="h-5 w-5" />
        <span>Continue with GitHub</span>
      </Button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
};