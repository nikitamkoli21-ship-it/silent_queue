import React from 'react';
import { getCongestionBadge } from '../utils/insights';

const PredictionHistory = ({ history }) => {
  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-icon">📋</span>
          Prediction History
        </div>
        <span className="badge badge-cyan">{history.length} Records</span>
      </div>

      <div className="history-table-wrap">
        {history.length === 0 ? (
          <div className="empty-table">
            <span className="empty-table-icon">📭</span>
            <span>No predictions yet. Run your first analysis above.</span>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Queue</th>
                <th>Svc Time</th>
                <th>Wait Time</th>
                <th>Congestion</th>
                <th>Status</th>
                <th>Staff Rec.</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((row, idx) => (
                <tr key={row.id} className={idx === 0 ? 'new-row' : ''}>
                  <td style={{ color: 'var(--text-muted)' }}>{history.length - idx}</td>
                  <td>{row.timestamp}</td>
                  <td style={{ color: 'var(--accent-cyan)' }}>{row.queue_length}</td>
                  <td>{row.avg_service_time} min</td>
                  <td style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>
                    {row.predicted_wait_time} min
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 40, height: 4, borderRadius: 99,
                        background: 'rgba(255,255,255,0.06)',
                        position: 'relative', overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute', left: 0, top: 0, bottom: 0,
                          width: `${row.congestion_score}%`,
                          background: row.congestion_score > 75 ? 'var(--accent-red)' :
                            row.congestion_score > 50 ? 'var(--accent-orange)' : 'var(--accent-green)',
                          borderRadius: 99,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span>{row.congestion_score}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getCongestionBadge(row.congestion_level)}`}>
                      {row.congestion_level}
                    </span>
                  </td>
                  <td style={{ color: row.predicted_wait_time > 7 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                    {row.predicted_wait_time > 12 ? '+2 staff' :
                      row.predicted_wait_time > 7 ? '+1 staff' : 'Optimal'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PredictionHistory;
