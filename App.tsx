
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load from local storage if exists
  useEffect(() => {
    const savedProfile = localStorage.getItem('nutriflow_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
      setIsReady(true);
    }
  }, []);

  const handleCompleteOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('nutriflow_profile', JSON.stringify(profile));
    setIsReady(true);
  };

  const handleReset = () => {
    localStorage.removeItem('nutriflow_profile');
    setUserProfile(null);
    setIsReady(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!isReady ? (
        <Onboarding onComplete={handleCompleteOnboarding} />
      ) : (
        userProfile && (
          <Dashboard userProfile={userProfile} onReset={handleReset} />
        )
      )}
    </div>
  );
};

export default App;
