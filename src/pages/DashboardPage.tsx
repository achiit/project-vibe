import React from 'react';
import { AdvancedDashboard } from '../components/dashboard/AdvancedDashboard';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card padding="lg" className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your dashboard.</p>
            <Button onClick={() => navigate('/')}>
              Go to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdvancedDashboard />
      </div>
    </div>
  );
};