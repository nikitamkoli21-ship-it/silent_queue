// components/InsightsPanel.jsx

import React from "react";
import "./InsightsPanel.css";

const InsightsPanel = ({ insights }) => {
  return (
    <div className="insights-panel glass-card">
      <h2 className="insights-title">AI Insights</h2>

      {insights && insights.length > 0 ? (
        <div className="insights-list">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={"insight-item insight-item--" + ins.severity}
              style={{ animationDelay: i * 0.08 + "s" }}
            >
              <span className="insight-icon">{ins.icon}</span>
              <span className="insight-text">{ins.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="insights-empty">
          Run a prediction to generate AI insights
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
