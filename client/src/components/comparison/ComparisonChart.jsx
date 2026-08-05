import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { calculateProgress } from '../../utils/pathUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="card shadow-lg" style={{ padding: '0.75rem', fontSize: '0.75rem', border: '1px solid var(--border)' }}>
      <p className="font-bold text-starlight mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ComparisonChart({ paths }) {
  const barData = paths.map((p) => ({
    name: p.goalTitle.length > 20 ? p.goalTitle.slice(0, 20) + '...' : p.goalTitle,
    'Duration (months)': p.estimatedMonths,
    'Cost (₹L)': Math.round(p.estimatedCostINR / 100000),
    'Est. Annual Salary (₹L/yr)': Math.round(p.estimatedOutcomeSalaryINR / 100000),
    'Weekly Hours (hrs/wk)': p.estimatedWeeklyHours || 20,
  }));

  const normalize = (val, max) => max > 0 ? Math.round((val / max) * 100) : 0;
  const maxMonths = Math.max(...paths.map((p) => p.estimatedMonths));
  const maxCost = Math.max(...paths.map((p) => p.estimatedCostINR));
  const maxSalary = Math.max(...paths.map((p) => p.estimatedOutcomeSalaryINR));
  const maxWeeklyHours = Math.max(...paths.map((p) => p.estimatedWeeklyHours || 20));

  const radarData = [
    { metric: 'Duration', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, normalize(p.estimatedMonths, maxMonths)])) },
    { metric: 'Cost', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, normalize(p.estimatedCostINR, maxCost)])) },
    { metric: 'Annual Salary', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, normalize(p.estimatedOutcomeSalaryINR, maxSalary)])) },
    { metric: 'Workload', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, normalize(p.estimatedWeeklyHours || 20, maxWeeklyHours)])) },
    { metric: 'Risk', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, p.riskLevel === 'high' ? 90 : p.riskLevel === 'medium' ? 50 : 20])) },
    { metric: 'Progress', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, calculateProgress(p)])) },
  ];

  const pathColors = ['#8A5CFF', '#059669', '#DB2777'];

  return (
    <div className="space-y-8">
      {/* Bar Chart */}
      <div className="card">
        <h3 className="text-base font-extrabold text-starlight mb-4">Cost vs duration vs estimated annual salary</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }} />
            <Bar dataKey="Duration (months)" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cost (₹L)" fill="var(--warning)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Est. Annual Salary (₹L/yr)" fill="var(--success)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="card">
        <h3 className="text-base font-extrabold text-starlight mb-4">Multi-dimensional comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} domain={[0, 100]} />
            {paths.map((p, i) => (
              <Radar
                key={p._id}
                name={p.goalTitle}
                dataKey={`path${i}`}
                stroke={pathColors[i % pathColors.length]}
                fill={pathColors[i % pathColors.length]}
                fillOpacity={0.2}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
