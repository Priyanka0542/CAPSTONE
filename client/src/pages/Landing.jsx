import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Starfield from '../components/common/Starfield';
import LandingHero from '../components/landing/LandingHero';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNewGoal, setShowNewGoal] = useState(false);

  const handleCreateGoal = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10">
        <div className="absolute top-4 right-6">
          <ThemeToggle />
        </div>
        <LandingHero onCreateGoal={handleCreateGoal} />
      </div>
    </div>
  );
}
