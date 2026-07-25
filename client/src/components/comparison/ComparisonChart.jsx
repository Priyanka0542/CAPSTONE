import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const riskColors = { low: '#00F0C0', medium: '#FFB84D', high: '#FF5C7A' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="card" style={{ padding: '0.75rem', fontSize: '0.75rem' }}>
      <p className="font-medium text-starlight mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
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
    'Salary (₹L/yr)': Math.round(p.estimatedOutcomeSalaryINR / 100000),
  }));

  const normalize = (val, max) => max > 0 ? Math.round((val / max) * 100) : 0;
  const maxMonths = Math.max(...paths.map((p) => p.estimatedMonths));
  const maxCost = Math.max(...paths.map((p) => p.estimatedCostINR));
  const maxSalary = Math.max(...paths.map((p) => p.estimatedOutcomeSalaryINR));

  const radarData = [
    { metric: 'Duration', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, normalize(p.estimatedMonths, maxMonths)])) },
    { metric: 'Cost', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, normalize(p.estimatedCostINR, maxCost)])) },
    { metric: 'Salary', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, normalize(p.estimatedOutcomeSalaryINR, maxSalary)])) },
    { metric: 'Risk', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, p.riskLevel === 'high' ? 90 : p.riskLevel === 'medium' ? 50 : 20])) },
    { metric: 'Progress', ...Object.fromEntries(paths.map((p, i) => [`path${i}`, p.estimatedMonths > 0 ? Math.round((p.monthsElapsed / p.estimatedMonths) * 100) : 0])) },
  ];

  const pathColors = ['#8A5CFF', '#00F0C0', '#FF6FA8'];

  return (
    <div className="space-y-8">
      {/* Bar Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-starlight mb-4">Cost vs duration vs salary</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: '#7C7A99', fontSize: 11 }} />
            <YAxis tick={{ fill: '#7C7A99', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#F1EFFF' }} />
            <Bar dataKey="Duration (months)" fill="#8A5CFF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cost (₹L)" fill="#FFB84D" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Salary (₹L/yr)" fill="#00F0C0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-starlight mb-4">Multi-dimensional comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#7C7A99', fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fill: '#7C7A99', fontSize: 10 }} domain={[0, 100]} />
            {paths.map((p, i) => (
              <Radar
                key={p._id}
                name={p.goalTitle}
                dataKey={`path${i}`}
                stroke={pathColors[i]}
                fill={pathColors[i]}
                fillOpacity={0.15}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: '12px', color: '#F1EFFF' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
