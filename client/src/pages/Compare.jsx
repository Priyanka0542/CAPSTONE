import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Starfield from '../components/common/Starfield';
import ComparisonChart from '../components/comparison/ComparisonChart';
import ProgressRing from '../components/common/ProgressRing';
import ThemeToggle from '../components/common/ThemeToggle';
import { calculateProgress, calculateTimelineStats } from '../utils/pathUtils';

export default function Compare() {
  const [paths, setPaths] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const { data } = await api.get('/paths');
        setPaths(data.paths.filter((p) => p.status !== 'deleted'));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
    setComparisonData(null);
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setComparing(true);
    try {
      const { data } = await api.get(`/paths/compare?ids=${selected.join(',')}`);
      setComparisonData(data.paths);
    } catch {
      // silent
    } finally {
      setComparing(false);
    }
  };

  const riskColors = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)' };
  const formatINR = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 shadow-sm" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="FutureEra Logo" className="h-8 w-auto" />
            <span className="text-2xl font-extrabold text-starlight tracking-tight">
              <span className="text-comet-violet">Future</span>Era
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/dashboard" className="btn-secondary text-xs py-1.5 px-3">← Dashboard</Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-extrabold text-starlight mb-2 tracking-tight">Compare career paths</h1>
          <p className="text-sm font-semibold text-dust-gray mb-6">Select 2-3 paths to compare side by side.</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : paths.length < 2 ? (
            <div className="card text-center py-12">
              <p className="text-dust-gray font-medium mb-4">You need at least 2 active or completed paths to compare.</p>
              <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
            </div>
          ) : (
            <>
              {/* Path selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {paths.map((p) => {
                  const isSelected = selected.includes(p._id);
                  const stats = calculateTimelineStats(p);
                  return (
                    <button
                      key={p._id}
                      onClick={() => toggleSelect(p._id)}
                      className="card text-left transition-all cursor-pointer"
                      style={{
                        borderColor: isSelected ? 'var(--primary)' : undefined,
                        background: isSelected ? 'var(--surface-secondary)' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: isSelected ? 'var(--primary)' : 'var(--input-border)',
                            background: isSelected ? 'var(--primary)' : 'transparent',
                          }}
                        >
                          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-starlight truncate">{p.goalTitle}</p>
                          <p className="text-xs font-medium text-dust-gray">
                            {stats.targetDurationText} · {formatINR(p.estimatedCostINR)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                className="btn-primary mb-8"
                onClick={handleCompare}
                disabled={selected.length < 2 || comparing}
              >
                {comparing ? 'Comparing...' : `Compare ${selected.length} paths`}
              </button>

              {/* Comparison results */}
              {comparisonData && (
                <div className="animate-fadeIn">
                  {/* Decision Summary */}
                  {comparisonData.length >= 2 && (() => {
                    const riskOrder = { high: 3, medium: 2, low: 1 };
                    const sorted = [...comparisonData];
                    
                    // Risk analysis
                    const byRisk = [...sorted].sort((a, b) => (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0));
                    const highestRisk = byRisk[0];
                    const lowestRisk = byRisk[byRisk.length - 1];
                    
                    // Difficulty: combine estimatedMonths + estimatedWeeklyHours + estimatedCostINR
                    const withDifficulty = sorted.map(p => {
                      const months = p.estimatedMonths || p.targetDuration || 6;
                      const hours = p.estimatedWeeklyHours || 20;
                      const cost = p.estimatedCostINR || 0;
                      // Normalize: longer duration, more hours, higher cost = harder
                      return { ...p, difficultyScore: months * hours + (cost / 10000) };
                    });
                    const byDifficulty = [...withDifficulty].sort((a, b) => b.difficultyScore - a.difficultyScore);
                    const hardest = byDifficulty[0];
                    const easiest = byDifficulty[byDifficulty.length - 1];

                    // Suitability: best combination of lower risk, higher salary, lower cost
                    const withSuitability = sorted.map(p => {
                      const riskScore = riskOrder[p.riskLevel] || 2;
                      const salary = p.estimatedOutcomeSalaryINR || 0;
                      const cost = p.estimatedCostINR || 0;
                      return { ...p, suitabilityScore: (salary / 100000) - (riskScore * 5) - (cost / 100000) };
                    });
                    const bestFit = [...withSuitability].sort((a, b) => b.suitabilityScore - a.suitabilityScore)[0];

                    return (
                      <div className="card mb-8 animate-fadeIn" style={{ borderColor: 'var(--primary)', borderWidth: '1px' }}>
                        <h3 className="text-base font-extrabold text-starlight mb-4 flex items-center gap-2">
                          <span>📊</span> Decision Summary
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                            <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">Higher Risk</p>
                            <p className="text-sm font-bold" style={{ color: riskColors[highestRisk.riskLevel] }}>
                              {highestRisk.goalTitle}
                              <span className="text-xs font-medium text-dust-gray ml-1">({highestRisk.riskLevel} risk)</span>
                            </p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                            <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">Lower Risk</p>
                            <p className="text-sm font-bold" style={{ color: riskColors[lowestRisk.riskLevel] }}>
                              {lowestRisk.goalTitle}
                              <span className="text-xs font-medium text-dust-gray ml-1">({lowestRisk.riskLevel} risk)</span>
                            </p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                            <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">Relatively Harder</p>
                            <p className="text-sm font-bold text-starlight">
                              {hardest.goalTitle}
                              <span className="text-xs font-medium text-dust-gray ml-1">(among selected paths)</span>
                            </p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                            <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">Relatively Easier</p>
                            <p className="text-sm font-bold text-starlight">
                              {easiest.goalTitle}
                              <span className="text-xs font-medium text-dust-gray ml-1">(among selected paths)</span>
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(138, 92, 255, 0.06)', border: '1px solid rgba(138, 92, 255, 0.15)' }}>
                          <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">Most Suitable (based on available data)</p>
                          <p className="text-sm font-bold text-comet-violet">
                            {bestFit.goalTitle}
                          </p>
                          <p className="text-xs text-dust-gray mt-1">
                            Based on the best combination of salary potential ({formatINR(bestFit.estimatedOutcomeSalaryINR)}/yr), risk level ({bestFit.riskLevel}), and estimated cost ({formatINR(bestFit.estimatedCostINR)}) among the selected paths. This is a relative comparison, not an absolute recommendation.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Side-by-side cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {comparisonData.map((p) => {
                      const progress = calculateProgress(p);
                      const stats = calculateTimelineStats(p);
                      return (
                        <div key={p._id} className="card">
                          <div className="flex items-start justify-between mb-4">
                            <div className="min-w-0 flex-1 pr-2">
                              <h3 className="text-base font-extrabold text-starlight truncate mb-1">{p.goalTitle}</h3>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-card-border" style={{ background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}>
                                {stats.timelineHealth}
                              </span>
                            </div>
                            <ProgressRing progress={progress} size={48} strokeWidth={3} />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray font-semibold uppercase tracking-wider">Target Duration</span>
                              <span className="text-starlight font-bold">{stats.targetDurationText}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray font-semibold uppercase tracking-wider">Deadline</span>
                              <span className="text-starlight font-bold">{stats.targetCompletionDateText}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray font-semibold uppercase tracking-wider">Time Remaining</span>
                              <span className="text-starlight font-bold">{stats.timeRemainingText}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray font-semibold uppercase tracking-wider">Weekly Workload</span>
                              <span className="text-comet-violet font-bold">{stats.estimatedWeeklyHours} hrs/wk</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray font-semibold uppercase tracking-wider">Current Pace</span>
                              <span className="text-starlight font-bold">{stats.currentPace}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray font-semibold uppercase tracking-wider">Estimated Cost</span>
                              <span className="text-starlight font-bold">{formatINR(p.estimatedCostINR)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray font-semibold uppercase tracking-wider">Est. Annual Salary</span>
                              <span className="text-aurora-teal font-bold">{formatINR(p.estimatedOutcomeSalaryINR)}/yr</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray font-semibold uppercase tracking-wider">Risk</span>
                              <span className="font-bold" style={{ color: riskColors[p.riskLevel] }}>
                                {p.riskLevel}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <p className="text-xs text-dust-gray font-medium leading-relaxed">{p.assumptions}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Charts */}
                  <ComparisonChart paths={comparisonData} />

                  <div className="ai-disclaimer mt-6">
                    Estimates are AI-generated based on stated assumptions and general data — not guarantees. Use this as a planning aid, not a prediction.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
