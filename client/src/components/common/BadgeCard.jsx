const BADGE_INFO = {
  '7-day-streak': { emoji: '🔥', label: '7-day streak', description: 'Checked in 7 days in a row' },
  '30-day-streak': { emoji: '⚡', label: '30-day streak', description: 'Checked in 30 days in a row' },
  'first-milestone': { emoji: '🎯', label: 'First milestone', description: 'Completed your first milestone' },
  'path-completed': { emoji: '🚀', label: 'Path completed', description: 'Completed an entire career path' },
  '3-paths-created': { emoji: '🌟', label: 'Explorer', description: 'Created 3 career paths' },
};

export default function BadgeCard({ badge, isNew = false }) {
  const info = BADGE_INFO[badge.badgeType] || { emoji: '🏅', label: badge.badgeType, description: '' };

  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all ${
        isNew ? 'animate-badge-pop' : ''
      }`}
      style={{
        background: 'rgba(255, 111, 168, 0.06)',
        border: '1px solid rgba(255, 111, 168, 0.15)',
        minWidth: '100px',
      }}
    >
      <span className="text-2xl">{info.emoji}</span>
      <span className="text-xs font-medium text-pulsar-pink">{info.label}</span>
      {badge.earnedAt && (
        <span className="text-[10px] text-dust-gray">
          {new Date(badge.earnedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

export { BADGE_INFO };
