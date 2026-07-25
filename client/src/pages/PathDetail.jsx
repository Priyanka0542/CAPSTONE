import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import Starfield from '../components/common/Starfield';
import ProgressRing from '../components/common/ProgressRing';
import Toast from '../components/common/Toast';

export default function PathDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const { data } = await api.get(`/paths/${id}`);
        setPath(data.path);
      } catch {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [id, navigate]);

  const handleCompleteMilestone = async (milestoneId) => {
    try {
      const { data } = await api.patch(`/paths/${id}/milestone/${milestoneId}`);
      setPath(data.path);
      setToast({ message: 'Milestone completed! 🎯', type: 'success' });
      if (data.newBadges?.length > 0) {
        setTimeout(() => {
          setToast({ message: `🏆 Badge earned: ${data.newBadges[0].badgeType}`, type: 'badge' });
        }, 1500);
      }
    } catch {
      setToast({ message: 'Failed to complete milestone', type: 'error' });
    }
  };

  const riskColors = { low: 'var(--aurora-teal)', medium: 'var(--solar-amber)', high: 'var(--meteor-red)' };

  const formatINR = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!path) return null;

  const progress = path.estimatedMonths > 0 ? (path.monthsElapsed / path.estimatedMonths) * 100 : 0;

  // Chart data for roadmap visualization
  const chartData = path.roadmap.map((step) => ({
    month: `M${step.month}`,
    progress: step.completed ? 100 : 0,
  }));

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/dashboard" className="text-xl font-bold text-starlight">
            <span className="text-comet-violet">Future</span>Era
          </Link>
          <Link to="/dashboard" className="btn-secondary text-xs py-1.5 px-3">← Dashboard</Link>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="card mb-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-starlight mb-2">{path.goalTitle}</h1>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      color: riskColors[path.riskLevel],
                      background: `${riskColors[path.riskLevel]}15`,
                    }}
                  >
                    {path.riskLevel} risk
                  </span>
                  <span className="text-xs text-dust-gray">
                    {path.status === 'completed' ? '✓ Completed' : `${path.monthsElapsed}/${path.estimatedMonths} months`}
                  </span>
                </div>
              </div>
              <ProgressRing progress={progress} size={80} strokeWidth={5} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-center">
                <p className="text-xs text-dust-gray mb-1">Estimated cost</p>
                <p className="text-lg font-semibold text-starlight">{formatINR(path.estimatedCostINR)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-dust-gray mb-1">Timeline</p>
                <p className="text-lg font-semibold text-starlight">{path.estimatedMonths} months</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-dust-gray mb-1">Projected salary</p>
                <p className="text-lg font-semibold text-aurora-teal">{formatINR(path.estimatedOutcomeSalaryINR)}/yr</p>
              </div>
            </div>
          </div>

          {/* Assumptions — always visible */}
          <div className="card mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-sm font-semibold text-solar-amber mb-2">⚠ Assumptions</h2>
            <p className="text-sm text-dust-gray leading-relaxed">{path.assumptions}</p>
          </div>

          <div className="ai-disclaimer mb-6">
            Estimates are AI-generated based on stated assumptions and general data — not guarantees. Use this as a planning aid, not a prediction.
          </div>

          {/* Progress chart */}
          <div className="card mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-sm font-semibold text-starlight mb-4">Progress overview</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#7C7A99', fontSize: 11 }} />
                <YAxis tick={{ fill: '#7C7A99', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: '#12102A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="progress" stroke="#00F0C0" strokeWidth={2} dot={{ fill: '#00F0C0', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Roadmap timeline */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-sm font-semibold text-starlight mb-4">Roadmap</h2>
            <div className="space-y-0 relative">
              {/* Timeline line */}
              <div
                className="absolute left-[15px] top-0 bottom-0 w-[2px]"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />

              {path.roadmap.map((step, i) => {
                const isCurrent = !step.completed && (i === 0 || path.roadmap[i - 1]?.completed);
                const dotColor = step.completed
                  ? 'var(--aurora-teal)'
                  : isCurrent
                  ? 'var(--comet-violet)'
                  : 'var(--dust-gray)';

                return (
                  <div key={step._id} className="relative pl-10 pb-6">
                    {/* Dot */}
                    <div
                      className="absolute left-[9px] top-1 w-[14px] h-[14px] rounded-full border-2"
                      style={{
                        borderColor: dotColor,
                        backgroundColor: step.completed ? dotColor : 'var(--void-black)',
                        boxShadow: isCurrent ? `0 0 12px ${dotColor}` : 'none',
                      }}
                    />

                    <div className={`card ${isCurrent ? 'animate-pulse-glow' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-medium text-dust-gray">Month {step.month}</span>
                          <h3 className="text-sm font-semibold text-starlight mt-0.5">{step.milestone}</h3>
                        </div>
                        {!step.completed && (
                          <button
                            className="btn-secondary text-[10px] py-1 px-2"
                            onClick={() => handleCompleteMilestone(step._id)}
                          >
                            Mark done
                          </button>
                        )}
                        {step.completed && (
                          <span className="text-xs text-aurora-teal">✓ Done</span>
                        )}
                      </div>
                      <ul className="mt-2 space-y-1">
                        {step.tasks.map((task, j) => (
                          <li key={j} className="text-xs text-dust-gray flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
