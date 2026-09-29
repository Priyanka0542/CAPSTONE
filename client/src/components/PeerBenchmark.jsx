import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function PeerBenchmark({ goalTitle }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!goalTitle) return;

    const fetchBenchmark = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data: result } = await api.get('/paths/benchmark', {
          params: { goalTitle },
        });
        setData(result);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmark();
  }, [goalTitle]);

  if (loading) {
    return (
      <div className="peer-benchmark card animate-fadeIn">
        <div className="flex items-center gap-2">
          <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          <span className="text-xs text-dust-gray font-medium">Loading peer data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="peer-benchmark card animate-fadeIn">
        <p className="text-xs text-dust-gray font-medium">Unable to load peer benchmark data.</p>
      </div>
    );
  }

  if (!data || data.insufficient) {
    return (
      <div className="peer-benchmark card animate-fadeIn">
        <div className="peer-benchmark-header">
          <span className="peer-benchmark-icon">👥</span>
          <h3 className="peer-benchmark-title">Peer Benchmark</h3>
        </div>
        <p className="text-sm font-medium text-dust-gray mt-2">
          Not enough peer data yet
          {data?.userCount > 0 && ` (${data.userCount} user${data.userCount > 1 ? 's' : ''} so far)`}
        </p>
        <p className="peer-benchmark-note">Based on aggregated FutureEra user data.</p>
      </div>
    );
  }

  const paceColors = {
    'On Track': 'var(--success)',
    'Ahead of Schedule': 'var(--success)',
    'Slightly Behind': 'var(--warning)',
    'Behind Schedule': 'var(--danger)',
  };

  const paceColor = paceColors[data.paceLabel] || 'var(--text-secondary)';

  return (
    <div className="peer-benchmark card animate-fadeIn">
      <div className="peer-benchmark-header">
        <span className="peer-benchmark-icon">👥</span>
        <h3 className="peer-benchmark-title">Peer Benchmark</h3>
      </div>

      <div className="peer-benchmark-stats">
        <div className="peer-benchmark-stat">
          <span className="peer-benchmark-stat-number">{data.userCount.toLocaleString()}</span>
          <span className="peer-benchmark-stat-label">
            user{data.userCount !== 1 ? 's' : ''} also pursuing this path
          </span>
        </div>

        <div className="peer-benchmark-divider" />

        <div className="peer-benchmark-stat">
          <span
            className="peer-benchmark-stat-number"
            style={{ color: paceColor }}
          >
            {data.paceLabel}
          </span>
          <span className="peer-benchmark-stat-label">Average pace</span>
        </div>

        <div className="peer-benchmark-divider" />

        <div className="peer-benchmark-stat">
          <span className="peer-benchmark-stat-number">{data.averageProgress}%</span>
          <span className="peer-benchmark-stat-label">Average progress</span>
        </div>
      </div>

      <p className="peer-benchmark-note">Based on aggregated FutureEra user data.</p>
    </div>
  );
}
