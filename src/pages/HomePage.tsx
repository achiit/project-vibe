import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Users, Trophy, Zap, Github as GitHub, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GitHubLogin } from '../components/auth/GitHubLogin';
import { useAuthStore } from '../store/useAuthStore';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  const features = [
    {
      icon: Zap,
      title: 'Vibe Coding',
      description: '1v1 competitive challenges for quick battles',
      color: 'text-yellow-600',
    },
    {
      icon: Users,
      title: 'Hackathons',
      description: 'Team-based events with collaboration tools',
      color: 'text-blue-600',
    },
    {
      icon: Trophy,
      title: 'Bounty Challenges',
      description: 'Open challenges with rewards for solutions',
      color: 'text-green-600',
    },
  ];

  const stats = [
    { label: 'Active Developers', value: '10,000+' },
    { label: 'Challenges Created', value: '2,500+' },
    { label: 'Total Prize Pool', value: '$50,000+' },
    { label: 'Success Rate', value: '94%' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Compete. Code.{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Conquer.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join the ultimate competitive coding platform where developers battle in real-time challenges, 
              collaborate in hackathons, and compete for bounties.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {user ? (
                <Link to="/challenges">
                  <Button size="lg\" className="bg-white text-primary-600 hover:bg-gray-100">
                    Browse Challenges
                  </Button>
                </Link>
              ) : (
                <div className="w-full sm:w-auto max-w-sm">
                  <GitHubLogin />
                </div>
              )}
              
              <Link to="/create">
                <Button variant="secondary" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                  Create Challenge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Three Ways to Challenge Yourself
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you prefer quick battles, team collaboration, or solving complex bounties, 
              we have the perfect challenge format for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                hoverable 
                padding="lg"
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How CodeArena Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start competing with developers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <GitHub className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Connect GitHub</h3>
              <p className="text-gray-600">Sign in with your GitHub account to showcase your coding skills</p>
            </div>
            
            <div className="text-center">
              <div className="bg-success-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Code2 className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Choose Challenge</h3>
              <p className="text-gray-600">Browse active challenges or create your own coding competition</p>
            </div>
            
            <div className="text-center">
              <div className="bg-warning-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Code & Submit</h3>
              <p className="text-gray-600">Solve problems in your preferred environment and submit solutions</p>
            </div>
            
            <div className="text-center">
              <div className="bg-error-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-error-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Win & Earn</h3>
              <p className="text-gray-600">Get ranked, earn prizes, and build your coding reputation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join thousands of developers who are already competing, learning, and earning on CodeArena.
          </p>
          
          {!user && (
            <div className="max-w-sm mx-auto">
              <GitHubLogin />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};