import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, User, Plus, Trophy, Home } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth.service';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isLoading, setUser } = useAuthStore();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/challenges', label: 'Challenges', icon: Trophy },
    { to: '/create', label: 'Create', icon: Plus },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">CodeArena</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={clsx(
                    'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                    isActive(to)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors duration-200"
                >
                  <img
                    src={user.github.avatar_url}
                    alt={user.github.username}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.github.username}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  loading={isLoading}
                  className="text-gray-600"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/">
                  <Button variant="secondary" size="sm">
                    Login with GitHub
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};