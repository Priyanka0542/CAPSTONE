import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePaths } from '../hooks/usePaths';
import { useStreak, useActivity, useBadges } from '../hooks/useStreak';
import Starfield from '../components/common/Starfield';
import PathCard from '../components/dashboard/PathCard';
import StreakHeatmap from '../components/dashboard/StreakHeatmap';
import TodayTask from '../components/dashboard/TodayTask';
import GoalInputForm from '../components/onboarding/GoalInputForm';
import BadgeCard from '../components/common/BadgeCard';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

export default function Dashboard() {
  const { user, logout, fetchUser } = useAuth();
  const { paths, loading: pathsLoading, createPath, updatePath, deletePath } = usePaths();
  const { currentStreak, longestStreak, history, fetchStreaks } = useStreak();
  const { todayTask, activities, checkin, fetchToday } = useActivity();
  const { badges } = useBadges();

  const [showNewGoal, setShowNewGoal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const activePaths = paths.filter((p) => p.status === 'active');

  const handleCreatePath = async (goal, profile) => {
    setCreating(true);
    try {
      const data = await createPath(goal, profile);
      setShowNewGoal(false);
      setToast({ message: 'Career path created!', type: 'success' });
      if (data.newBadges?.length > 0) {
        setTimeout(() => {
          setToast({ message: `🏆 New badge: ${data.newBadges[0].badgeType}`, type: 'badge' });
        }, 1500);
      }
      fetchUser();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create path', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleSetFocus = async (pathId) => {
    try {
      await updatePath(pathId, { focusPath: true });
      fetchUser();
      fetchToday();
      setToast({ message: 'Focus path updated', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update focus', type: 'error' });
    }
  };

  const handleDelete = async (pathId) => {
    try {
      await deletePath(pathId);
      setDeleteConfirm(null);
      fetchUser();
      setToast({ message: 'Path deleted', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete path', type: 'error' });
    }
  };

  const handleCheckin = async (pathId, task) => {
    try {
      const data = await checkin(pathId, task);
      fetchStreaks();
      fetchUser();
      setToast({ message: `Streak: ${data.streak?.currentStreak} days! 🔥`, type: 'success' });
      if (data.newBadges?.length > 0) {
        setTimeout(() => {
          setToast({ message: `🏆 New badge: ${data.newBadges[0].badgeType}`, type: 'badge' });
        }, 1500);
      }
    } catch {
      setToast({ message: 'Check-in failed', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="text-xl font-bold text-starlight">
            <span className="text-comet-violet">Future</span>Era
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-dust-gray hidden sm:block">Hey, {user?.name}</span>
            <a href="/compare" className="btn-secondary text-xs py-1.5 px-3">Compare</a>
            <button onClick={logout} className="text-sm text-dust-gray hover:text-meteor-red transition-colors">
              Log out
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Empty state */}
          {!pathsLoading && activePaths.length === 0 && !showNewGoal && (
            <div className="text-center py-20 animate-fadeIn">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-starlight mb-2">Welcome to FutureEra</h2>
              <p className="text-dust-gray mb-8 max-w-md mx-auto">
                Start your journey by telling the AI what career you want to pursue.
                It'll generate a personalized roadmap just for you.
              </p>
              <button className="btn-primary text-base px-8 py-3" onClick={() => setShowNewGoal(true)}>
                Set your first goal
              </button>
            </div>
          )}

          {/* New goal modal */}
          <Modal isOpen={showNewGoal} onClose={() => !creating && setShowNewGoal(false)} title="New career goal">
            <GoalInputForm onSubmit={handleCreatePath} loading={creating} />
          </Modal>

          {/* Main layout */}
          {(activePaths.length > 0 || pathsLoading) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Paths */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-starlight">Your career paths</h2>
                  <button className="btn-primary text-xs py-1.5" onClick={() => setShowNewGoal(true)}>
                    + New goal
                  </button>
                </div>

                {pathsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="spinner" style={{ width: 32, height: 32 }} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePaths.map((path) => (
                      <PathCard
                        key={path._id}
                        path={path}
                        isFocus={user?.focusPathId === path._id}
                        onSetFocus={handleSetFocus}
                        onDelete={(id) => setDeleteConfirm(id)}
                      />
                    ))}
                  </div>
                )}

                {/* AI Disclaimer */}
                <div className="ai-disclaimer">
                  Estimates are AI-generated based on stated assumptions and general data — not guarantees. Use this as a planning aid, not a prediction.
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                <TodayTask todayTask={todayTask} activities={activities} onCheckin={handleCheckin} />
                <StreakHeatmap history={history} currentStreak={currentStreak} longestStreak={longestStreak} />

                {/* Badge shelf */}
                {badges.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-starlight mb-3">Badges earned</h3>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge) => (
                        <BadgeCard key={badge._id} badge={badge} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete career path?"
      >
        <p className="text-sm text-dust-gray mb-6">
          This will hide the path from your active view. Historical data is retained.
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </button>
          <button className="btn-danger flex-1" onClick={() => handleDelete(deleteConfirm)}>
            Delete path
          </button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
