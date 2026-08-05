import { useState } from 'react';

export default function TodayTask({ todayTask, activities, onCheckin }) {
  const [loading, setLoading] = useState(false);
  const hasCheckedIn = activities && activities.length > 0;

  const handleCheckin = async () => {
    if (!todayTask || hasCheckedIn) return;
    setLoading(true);
    try {
      await onCheckin(todayTask.pathId, todayTask.task);
    } catch {
      // Error handled upstream
    } finally {
      setLoading(false);
    }
  };

  if (!todayTask && !hasCheckedIn) {
    return (
      <div className="card">
        <h3 className="text-sm font-bold text-starlight mb-2">Today's task</h3>
        <p className="text-sm font-medium text-dust-gray">No active tasks. Create a career path to get started!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-starlight mb-3">Today's task</h3>

      {hasCheckedIn ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: 'var(--secondary-surface)', borderColor: 'var(--aurora-teal)' }}>
          <span className="text-aurora-teal text-xl font-bold">✓</span>
          <div>
            <p className="text-sm text-starlight font-bold">Checked in today!</p>
            <p className="text-xs font-medium text-dust-gray mt-0.5">{activities[0]?.taskDescription}</p>
          </div>
        </div>
      ) : todayTask ? (
        <div>
          <div className="mb-3 p-3 rounded-lg border" style={{ background: 'var(--secondary-surface)', borderColor: 'var(--card-border)' }}>
            <p className="text-[10px] font-bold text-comet-violet uppercase tracking-wider mb-1">
              {todayTask.pathTitle} — Month {todayTask.month}
            </p>
            <p className="text-sm font-bold text-starlight">{todayTask.task}</p>
            <p className="text-xs font-medium text-dust-gray mt-1">{todayTask.milestone}</p>
          </div>
          <button
            className="btn-primary w-full"
            onClick={handleCheckin}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Checking in...
              </span>
            ) : (
              'Complete today\'s task'
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
