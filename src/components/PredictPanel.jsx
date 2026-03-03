import React, { useState } from 'react';
import { predictQueue } from '../utils/api';
import { getCongestionColor, getCongestionBadge } from '../utils/insights';

const PredictPanel = ({ onPrediction }) => {
  const [queueLength, setQueueLength] = useState('');
  const [avgServiceTime, setAvgServiceTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    const q = parseFloat(queueLength);
    const s = parseFloat(avgServiceTime);
    if (!q || !s || q < 1 || s < 0.5) {
      setError('Enter valid queue length (≥1) and service time (≥0.5 min)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await predictQueue(q, s);
      const enriched = {
        ...data,
        congestion_score: data.congestion_score ?? Math.min(100, Math.round((q / 20) * 100)),
        timestamp: new Date().toLocaleTimeString(),
        queue_length: q,
        avg_service_time: s,
      };
      setResult(enriched);
      onPrediction(enriched);
    } catch {
      setError('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const congestionColor = result ? getCongestionColor(result.congestion_level, result.congestion_score) : 'var(--accent-cyan)';
  const badgeClass = result ? getCongestionBadge(result.congestion_level) : 'badge-cyan';

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-icon">🔮</span>
          Smart Predict Engine
        </div>
        <span className="badge badge-cyan">AI-Powered</span>
      </div>

      <div className="predict-grid">
        {/* Input Form */}
        <div className="predict-form">
          <div className="input-group">
            <label className="input-label">
              <span className="input-label-icon">🧑‍🤝‍🧑</span>
              Queue Length
            </label>
            <input
              className="styled-input"
              type="number"
              min="1"
              placeholder="e.g. 12"
              value={queueLength}
              onChange={e => setQueueLength(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePredict()}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <span className="input-label-icon">⏱️</span>
              Avg. Service Time (min)
            </label>
            <input
              className="styled-input"
              type="number"
              min="0.5"
              step="0.5"
              placeholder="e.g. 4.5"
              value={avgServiceTime}
              onChange={e => setAvgServiceTime(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePredict()}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '8px 12px', background: 'rgba(255,69,113,0.08)', borderRadius: '6px', border: '1px solid rgba(255,69,113,0.2)' }}>
              ⚠ {error}
            </div>
          )}

          <button className="predict-btn" onClick={handlePredict} disabled={loading}>
            <span className="predict-btn-inner">
              {loading ? <><span className="btn-spinner" /> Analyzing Queue...</> : <><span>⚡</span> Run Prediction</>}
            </span>
          </button>
        </div>

        {/* Result Panel */}
        <div className="result-panel">
          {!result ? (
            <div className="result-empty">
              <span className="result-empty-icon">🤖</span>
              <span>Awaiting prediction input</span>
              <span style={{ opacity: 0.5 }}>Fill in queue data to get AI insights</span>
            </div>
          ) : (
            <>
              <div className="result-metric">
                <div>
                  <div className="result-metric-label">Predicted Wait Time</div>
                </div>
                <div>
                  <span className="result-metric-value" style={{ color: 'var(--accent-cyan)' }}>
                    {result.predicted_wait_time}
                  </span>
                  <span className="result-metric-unit">min</span>
                </div>
              </div>

              <div className="result-metric">
                <div>
                  <div className="result-metric-label">Congestion Level</div>
                </div>
                <span className={`badge ${badgeClass}`}>
                  {result.congestion_level}
                </span>
              </div>

              <div className="result-metric">
                <div>
                  <div className="result-metric-label">Congestion Score</div>
                </div>
                <div>
                  <span className="result-metric-value" style={{ color: congestionColor }}>
                    {result.congestion_score}
                  </span>
                  <span className="result-metric-unit">/ 100</span>
                </div>
              </div>

              <div className="result-metric">
                <div><div className="result-metric-label">Predicted at</div></div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {result.timestamp}
                </span>
              </div>

              {result.predicted_wait_time > 7 && (
                <div className="rush-banner">
                  <span className="rush-banner-icon">🚨</span>
                  <div>
                    <div className="rush-banner-text">Rush Hour Approaching</div>
                    <div className="rush-banner-sub">
                      {result.predicted_wait_time > 12 ? 'Add 2 staff members immediately' : 'Consider adding 1 staff member'}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictPanel;
