import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'rgba(13,17,23,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '12px 16px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontSize: 10 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const TrendChart = ({ data, lastRefresh }) => {
  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-icon">📊</span>
          Queue Trend Monitor
        </div>
        <div className="refresh-info">
          <span className="refresh-spinner" />
          <span>Last: {lastRefresh ? lastRefresh.toLocaleTimeString() : '—'}</span>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="queueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b6dff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9b6dff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4571" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff4571" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10, paddingTop: 8 }}
              iconType="circle"
            />
            <Area type="monotone" dataKey="queue" name="Queue" stroke="#00e5ff" strokeWidth={2} fill="url(#queueGrad)" dot={false} />
            <Area type="monotone" dataKey="waitTime" name="Wait Time" stroke="#9b6dff" strokeWidth={2} fill="url(#waitGrad)" dot={false} />
            <Area type="monotone" dataKey="congestion" name="Congestion" stroke="#ff4571" strokeWidth={2} fill="url(#congGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
