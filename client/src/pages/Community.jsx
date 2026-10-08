import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePaths } from '../hooks/usePaths';
import Starfield from '../components/common/Starfield';
import ThemeToggle from '../components/common/ThemeToggle';
import MemberList from '../components/community/MemberList';
import ChatWindow from '../components/community/ChatWindow';
import api from '../api/axios';

export default function Community() {
  const { user } = useAuth();
  const { paths } = usePaths();
  const [selectedGoalSlug, setSelectedGoalSlug] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Get unique goals from user's paths
  const userGoals = paths
    .filter(p => p.status === 'active' || p.status === 'paused')
    .map(p => ({
      _id: p._id,
      goalTitle: p.goalTitle,
      goalSlug: p.goalSlug,
    }))
    .filter((goal, index, self) => 
      index === self.findIndex(g => g.goalSlug === goal.goalSlug)
    );

  // Select first goal by default
  useEffect(() => {
    if (userGoals.length > 0 && !selectedGoalSlug) {
      setSelectedGoalSlug(userGoals[0].goalSlug);
      setSelectedGoalTitle(userGoals[0].goalTitle);
    }
  }, [userGoals, selectedGoalSlug]);

  // Fetch members when goal changes
  useEffect(() => {
    if (!selectedGoalSlug) return;

    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const { data } = await api.get(`/api/community/${selectedGoalSlug}/members`);
        setMembers(data.members);
      } catch (err) {
        console.error('Failed to fetch members:', err);
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [selectedGoalSlug]);

  if (userGoals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <Starfield />
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="card max-w-md text-center relative z-10">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-starlight mb-2">No active goals</h2>
          <p className="text-dust-gray mb-6">
            Create a career path first to join the community for that goal.
          </p>
          <Link to="/dashboard" className="btn-primary inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 shadow-sm" style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="FutureEra Logo" className="h-8 w-auto" />
            <span className="text-2xl font-extrabold text-starlight tracking-tight">
              <span className="text-comet-violet">Future</span>Era
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-sm font-semibold text-dust-gray hidden sm:block">Hey, {user?.name}</span>
            <ThemeToggle />
            <Link to="/dashboard" className="btn-secondary text-xs py-1.5 px-3">Dashboard</Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-extrabold text-starlight mb-6">Companions</h1>

          {/* Goal selector tabs */}
          {userGoals.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {userGoals.map((goal) => (
                <button
                  key={goal._id}
                  onClick={() => {
                    setSelectedGoalSlug(goal.goalSlug);
                    setSelectedGoalTitle(goal.goalTitle);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedGoalSlug === goal.goalSlug
                      ? 'bg-comet-violet text-white'
                      : 'text-dust-gray hover:text-starlight'
                  }`}
                  style={selectedGoalSlug !== goal.goalSlug ? { background: 'var(--card-bg)', border: '1px solid var(--card-border)' } : {}}
                >
                  {goal.goalTitle}
                </button>
              ))}
            </div>
          )}

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
            {/* Left: Member list */}
            <div className="lg:col-span-1">
              <div className="card h-full overflow-y-auto">
                <MemberList members={members} loading={membersLoading} />
              </div>
            </div>

            {/* Right: Chat window */}
            <div className="lg:col-span-2">
              <div className="card h-full flex flex-col">
                <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <h2 className="text-lg font-bold text-starlight">
                    {selectedGoalTitle} Community
                  </h2>
                  <p className="text-sm text-dust-gray">
                    Connect with others pursuing the same goal
                  </p>
                </div>
                <ChatWindow goalSlug={selectedGoalSlug} currentUserId={user?.userId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
