import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ChallengeDetailPage } from './pages/ChallengeDetailPage';
import { CreateChallengePage } from './pages/CreateChallengePage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuthStore } from './store/useAuthStore';
import { authService } from './services/auth.service';

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state listener
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
          <Route path="/create" element={<CreateChallengePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;