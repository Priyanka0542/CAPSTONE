import ProgressRing from '../common/ProgressRing';
import { useNavigate } from 'react-router-dom';
import { calculateProgress, calculateTimelineStats } from '../../utils/pathUtils';

const riskColors = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
};

export default function PathCard({ path, isFocus, onSetFocus, onDelete }) {
  const navigate = useNavigate();
  const progress = calculateProgress(path);
  const isCompleted = path.status === 'completed' || progress === 100;
  const timelineStats = calculateTimelineStats(path);

  const formatINR = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  return (
    <div
      className="card cursor-pointer group"
      style={{
        borderColor: isCompleted ? 'var(--primary)' : isFocus ? 'var(--primary)' : undefined,
      }}
      onClick={() => navigate(`/path/${path._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-base font-extrabold text-starlight truncate">{path.goalTitle}</h3>
            {isFocus && !isCompleted && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-comet-violet text-white whitespace-nowrap shadow-xs">
                Focus
              </span>
            )}
            {isCompleted && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-aurora-teal text-white whitespace-nowrap shadow-xs">
                ✓ Completed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                color: riskColors[path.riskLevel],
                background: `${riskColors[path.riskLevel]}18`,
              }}
            >
              {path.riskLevel} risk
            </span>
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border border-card-border" style={{ background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}>
              {timelineStats.timelineHealth}
            </span>
          </div>
        </div>
        <ProgressRing progress={progress} size={56} strokeWidth={4} />
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 p-3 rounded-lg border border-card-border" style={{ background: 'var(--surface-secondary)' }}>
        <div>
          <p className="text-[10px] font-semibold text-dust-gray mb-0.5 uppercase tracking-wider">Target Duration</p>
          <p className="text-xs font-bold text-starlight">{timelineStats.targetDurationText}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-dust-gray mb-0.5 uppercase tracking-wider">Est. Annual Salary</p>
          <p className="text-xs font-bold text-aurora-teal">{formatINR(path.estimatedOutcomeSalaryINR)}/yr</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-dust-gray mb-0.5 uppercase tracking-wider">Time Remaining</p>
          <p className="text-xs font-bold text-starlight">{timelineStats.timeRemainingText}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-dust-gray mb-0.5 uppercase tracking-wider">Weekly Workload</p>
          <p className="text-xs font-bold text-starlight">{timelineStats.estimatedWeeklyHours} hrs/wk</p>
        </div>
      </div>

      {/* Current milestone */}
      {path.roadmap && path.roadmap.length > 0 && (
        <div className="pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
          {isCompleted ? (
            <p className="text-xs text-aurora-teal font-bold flex items-center gap-1">
              ✓ All milestones completed
            </p>
          ) : (
            (() => {
              const current = path.roadmap.find((m) => !m.completed) || path.roadmap[path.roadmap.length - 1];
              return (
                <p className="text-xs text-dust-gray font-medium truncate">
                  <span className="text-comet-violet font-bold">Month {current.month}:</span>{' '}
                  {current.milestone}
                </p>
              );
            })()
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
        {!isFocus && !isCompleted && onSetFocus && (
          <button
            type="button"
            className="btn-secondary text-xs py-1 px-3"
            onClick={(e) => { e.stopPropagation(); onSetFocus(path._id); }}
          >
            Set focus
          </button>
        )}
        <button
          type="button"
          className="btn-danger text-xs py-1 px-3 ml-auto"
          onClick={(e) => { e.stopPropagation(); onDelete(path._id); }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
