import { useMemo } from 'react';

export default function StreakHeatmap({ history, currentStreak, longestStreak }) {
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeDates = new Set(
      history.map((h) => new Date(h.date).toISOString().split('T')[0])
    );

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: d,
        dateStr,
        active: activeDates.has(dateStr),
        isToday: i === 0,
      });
    }
    return result;
  }, [history]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-starlight">Streak</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xl font-extrabold text-aurora-teal">{currentStreak}</p>
            <p className="text-[10px] font-semibold text-dust-gray">Current</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-comet-violet">{longestStreak}</p>
            <p className="text-[10px] font-semibold text-dust-gray">Best</p>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex flex-wrap gap-1.5 justify-between">
        {days.map((day) => (
          <div
            key={day.dateStr}
            className="rounded-sm transition-all"
            style={{
              width: '18px',
              height: '18px',
              backgroundColor: day.active
                ? 'var(--aurora-teal)'
                : 'var(--secondary-surface)',
              opacity: day.active ? (day.isToday ? 1 : 0.85) : 1,
              border: day.isToday
                ? '2px solid var(--comet-violet)'
                : '1px solid var(--card-border)',
            }}
            title={`${day.dateStr}${day.active ? ' ✓' : ''}`}
          />
        ))}
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-medium text-dust-gray">30 days ago</span>
        <span className="text-[10px] font-medium text-dust-gray">Today</span>
      </div>
    </div>
  );
}
