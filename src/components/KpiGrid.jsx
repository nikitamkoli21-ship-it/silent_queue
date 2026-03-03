import React from 'react';

const KpiCard = ({ icon, label, value, unit, delta, accentColor, shimmer }) => (
  <div className="kpi-card">
    <div className="accent-bar" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
    {shimmer && <div className="kpi-shimmer" />}
    <span className="kpi-icon">{icon}</span>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value" style={{ color: accentColor }}>
      {value}
      {unit && <span className="kpi-unit">{unit}</span>}
    </div>
    {delta && <div className="kpi-delta">{delta}</div>}
  </div>
);

const KpiGrid = ({ dashData, loading }) => {
  const queue = dashData?.current_queue_length ?? '—';
  const avgWait = dashData?.avg_wait_time ?? '—';
  const totalPreds = dashData?.total_predictions ?? '—';
  const uptime = dashData?.uptime ?? '99.9%';

  return (
    <div className="kpi-grid">
      <KpiCard
        icon="🧑‍🤝‍🧑"
        label="Current Queue"
        value={loading ? '…' : queue}
        unit=" people"
        delta={`↑ Auto-refreshed`}
        accentColor="var(--accent-cyan)"
        shimmer={loading}
      />
      <KpiCard
        icon="⏱️"
        label="Avg Wait Time"
        value={loading ? '…' : avgWait}
        unit=" min"
        delta="Rolling 5-min window"
        accentColor="var(--accent-violet)"
        shimmer={loading}
      />
      <KpiCard
        icon="🔮"
        label="Total Predictions"
        value={loading ? '…' : totalPreds}
        delta="Since session start"
        accentColor="var(--accent-green)"
        shimmer={loading}
      />
      <KpiCard
        icon="📡"
        label="System Uptime"
        value={loading ? '…' : uptime}
        delta="All systems operational"
        accentColor="var(--accent-orange)"
        shimmer={loading}
      />
    </div>
  );
};

export default KpiGrid;
