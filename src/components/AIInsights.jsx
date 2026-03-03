import React from 'react';
import { generateInsights } from '../utils/insights';

const InsightItem = ({ insight }) => (
  <div className={`insight-item insight-severity-${insight.severity}`}
    style={{ animationDelay: `${Math.random() * 0.2}s` }}>
    <div className="insight-icon-wrap" style={{ background: insight.bgColor }}>
      {insight.icon}
    </div>
    <div className="insight-text">
      <div className="insight-title">{insight.title}</div>
      <div className="insight-desc">{insight.desc}</div>
    </div>
    <div className="insight-time">{insight.time}</div>
  </div>
);

const AIInsights = ({ prediction, dashData, history }) => {
  const insights = generateInsights(prediction, dashData, history);

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">
          <span className="card-icon">🧠</span>
          AI Insights Engine
        </div>
        <span className="badge badge-violet">
          {insights.length} Active
        </span>
      </div>

      <div className="insights-list">
        {insights.map(insight => (
          <InsightItem key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
