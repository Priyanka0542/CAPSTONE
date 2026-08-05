import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Starfield from '../components/common/Starfield';
import ComparisonChart from '../components/comparison/ComparisonChart';
import ProgressRing from '../components/common/ProgressRing';
import { calculateProgress } from '../utils/pathUtils';

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

  const riskColors = { low: '#00F0C0', medium: '#FFB84D', high: '#FF5C7A' };
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
        <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/dashboard" className="text-xl font-bold text-starlight">
            <span className="text-comet-violet">Future</span>Era
          </Link>
          <Link to="/dashboard" className="btn-secondary text-xs py-1.5 px-3">← Dashboard</Link>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-xl font-bold text-starlight mb-2">Compare career paths</h1>
          <p className="text-sm text-dust-gray mb-6">Select 2-3 paths to compare side by side.</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : paths.length < 2 ? (
            <div className="card text-center py-12">
              <p className="text-dust-gray mb-4">You need at least 2 active paths to compare.</p>
              <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
            </div>
          ) : (
            <>
              {/* Path selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {paths.map((p) => {
                  const isSelected = selected.includes(p._id);
                  return (
                    <button
                      key={p._id}
                      onClick={() => toggleSelect(p._id)}
                      className="card text-left transition-all"
                      style={{
                        borderColor: isSelected ? 'var(--comet-violet)' : undefined,
                        background: isSelected ? 'rgba(138, 92, 255, 0.06)' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: isSelected ? 'var(--comet-violet)' : 'rgba(255,255,255,0.15)',
                            background: isSelected ? 'var(--comet-violet)' : 'transparent',
                          }}
                        >
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-starlight truncate">{p.goalTitle}</p>
                          <p className="text-[10px] text-dust-gray">{p.estimatedMonths}mo · {formatINR(p.estimatedCostINR)}</p>
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
                  {/* Side-by-side cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {comparisonData.map((p) => {
                      const progress = calculateProgress(p);
                      return (
                        <div key={p._id} className="card">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-sm font-semibold text-starlight">{p.goalTitle}</h3>
                            <ProgressRing progress={progress} size={48} strokeWidth={3} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray">Duration</span>
                              <span className="text-starlight font-medium">{p.estimatedMonths} months</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray">Cost</span>
                              <span className="text-starlight font-medium">{formatINR(p.estimatedCostINR)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray">Salary</span>
                              <span className="text-aurora-teal font-medium">{formatINR(p.estimatedOutcomeSalaryINR)}/yr</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-dust-gray">Risk</span>
                              <span className="font-medium" style={{ color: riskColors[p.riskLevel] }}>
                                {p.riskLevel}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-[10px] text-dust-gray leading-relaxed">{p.assumptions}</p>
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
