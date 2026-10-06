import { FiUser } from 'react-icons/fi';

export default function MemberList({ members, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8 text-dust-gray text-sm">
        No one else is on this path yet — you're the first!
      </div>
    );
  }

  const getPaceColor = (pace) => {
    if (!pace) return 'text-dust-gray';
    if (pace === 'Ahead of Schedule') return 'text-aurora-teal';
    if (pace === 'On Track') return 'text-aurora-teal';
    if (pace === 'Slightly Behind') return 'text-solar-yellow';
    if (pace === 'Behind Schedule') return 'text-meteor-red';
    return 'text-dust-gray';
  };

  const getPaceBadge = (timelineHealth) => {
    if (!timelineHealth) return 'text-dust-gray';
    if (timelineHealth.includes('On Track')) return 'bg-aurora-teal/20 text-aurora-teal';
    if (timelineHealth.includes('Needs Faster')) return 'bg-solar-yellow/20 text-solar-yellow';
    if (timelineHealth.includes('High Risk')) return 'bg-meteor-red/20 text-meteor-red';
    return 'bg-dust-gray/20 text-dust-gray';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-starlight mb-3">Companions ({members.length})</h3>
      {members.map((member, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-starlight"
            style={{ background: 'linear-gradient(135deg, var(--comet-violet), var(--aurora-teal))' }}>
            {member.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-starlight truncate">{member.displayName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs text-dust-gray">
                🔥 {member.currentStreak || 0} day streak
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPaceBadge(member.timelineHealth)}`}>
                {member.timelineHealth?.split(' ')[1] || 'On Track'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
