// components/KPIDashboard.jsx

import React from 'react';
import './KPIDashboard.css';

const KPI_CONFIG = [
  { key: 'active_queues',    label: 'Active Queues',    icon: '⚡', suffix: '',    color: 'cyan' },
  { key: 'avg_wait_time',    label: 'Avg Wait Time',    icon: '⏱', suffix: ' min', color: 'violet' },
  { key: 'total_served_today', label: 'Served Today',  icon: '✓',  suffix: '',    color: 'emerald' },
  { key: 'throughput',       label: 'Throughput/hr',    icon: '↗',  suffix: '',    color: 'amber' },
  { key: 'efficiency_score', label: 'Efficiency Score', icon: '◈',  suffix: '%',   color: 'blue' },
];

const KPICard = ({ config, value, loading }) => (
  <div className={`kpi-card kpi-card--${config.color}`}>
    <div className="kpi-icon">{config.icon}</div>
    <div className="kpi-body">
      <div className="kpi-label">{config.label}</div>
      <div className="kpi-value">
        {loading ? (
          <span className="kpi-skeleton" />
        ) : (
          <>
            <span className="kpi-number">{value ?? '—'}</span>
            <span className="kpi-suffix">{config.suffix}</span>
          </>
        )}
      </div>
    </div>
    <div className="kpi-glow" />
  </div>
);

const KPIDashboard = ({ dashboard, loading }) => (
  <section className="kpi-section">
    <div className="section-header">
      <h2 className="section-title">Real-time KPIs</h2>
      <div className="live-badge">
        <span className="live-dot" />
        LIVE · 5s refresh
      </div>
    </div>
    <div className="kpi-grid">
      {KPI_CONFIG.map((cfg) => (
        <KPICard
          key={cfg.key}
          config={cfg}
          value={dashboard?.[cfg.key]}
          loading={loading}
        />
      ))}
    </div>
  </section>
);

export default KPIDashboard;
