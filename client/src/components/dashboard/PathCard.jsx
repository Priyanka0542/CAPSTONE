import ProgressRing from '../common/ProgressRing';
import { useNavigate } from 'react-router-dom';

const riskColors = {
  low: 'var(--aurora-teal)',
  medium: 'var(--solar-amber)',
  high: 'var(--meteor-red)',
};

export default function PathCard({ path, isFocus, onSetFocus, onDelete }) {
  const navigate = useNavigate();
  const progress = path.estimatedMonths > 0
    ? (path.monthsElapsed / path.estimatedMonths) * 100
    : 0;

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
        borderColor: isFocus ? 'rgba(138, 92, 255, 0.4)' : undefined,
      }}
      onClick={() => navigate(`/path/${path._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-starlight truncate">{path.goalTitle}</h3>
            {isFocus && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-comet-violet/20 text-comet-violet whitespace-nowrap">
                Focus
              </span>
            )}
          </div>
          <span
            className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{
              color: riskColors[path.riskLevel],
              background: `${riskColors[path.riskLevel]}15`,
            }}
          >
            {path.riskLevel} risk
          </span>
        </div>
        <ProgressRing progress={progress} size={56} strokeWidth={4} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-dust-gray mb-0.5">Duration</p>
          <p className="text-sm font-medium text-starlight">{path.estimatedMonths}mo</p>
        </div>
        <div>
          <p className="text-[10px] text-dust-gray mb-0.5">Cost</p>
          <p className="text-sm font-medium text-starlight">{formatINR(path.estimatedCostINR)}</p>
        </div>
        <div>
          <p className="text-[10px] text-dust-gray mb-0.5">Outcome</p>
          <p className="text-sm font-medium text-aurora-teal">{formatINR(path.estimatedOutcomeSalaryINR)}/yr</p>
        </div>
      </div>

      {/* Current milestone */}
      {path.roadmap && path.roadmap.length > 0 && (
        <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {(() => {
            const current = path.roadmap.find((m) => !m.completed) || path.roadmap[path.roadmap.length - 1];
            return (
              <p className="text-xs text-dust-gray">
                <span className="text-comet-violet font-medium">Month {current.month}:</span>{' '}
                {current.milestone}
              </p>
            );
          })()}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {!isFocus && (
          <button
            className="btn-secondary text-xs py-1.5 px-3"
            onClick={(e) => { e.stopPropagation(); onSetFocus(path._id); }}
          >
            Set focus
          </button>
        )}
        <button
          className="btn-danger text-xs py-1.5 px-3 ml-auto"
          onClick={(e) => { e.stopPropagation(); onDelete(path._id); }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
