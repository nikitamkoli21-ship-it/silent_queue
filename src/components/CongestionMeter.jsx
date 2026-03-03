import React, { useEffect, useRef } from 'react';
import { getCongestionColor } from '../utils/insights';

const CongestionMeter = ({ score = 0, level = 'LOW' }) => {
  const needleRef = useRef(null);
  const color = getCongestionColor(level, score);

  // Map 0-100 to -135deg to 135deg (270 deg arc)
  const angle = -135 + (score / 100) * 270;

  const getStatusLabel = () => {
    if (score < 30) return 'OPTIMAL';
    if (score < 60) return 'MODERATE';
    if (score < 85) return 'HIGH LOAD';
    return 'CRITICAL';
  };

  // SVG arc parameters
  const cx = 110, cy = 110, r = 85;
  const toRad = d => (d * Math.PI) / 180;

  const describeArc = (startDeg, endDeg, r2) => {
    const s = { x: cx + r2 * Math.cos(toRad(startDeg - 90)), y: cy + r2 * Math.sin(toRad(startDeg - 90)) };
    const e = { x: cx + r2 * Math.cos(toRad(endDeg - 90)), y: cy + r2 * Math.sin(toRad(endDeg - 90)) };
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r2} ${r2} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const bgArcPath = describeArc(-45, 225, r);
  const fillEnd = -45 + (score / 100) * 270;
  const fillArcPath = score > 0 ? describeArc(-45, Math.min(fillEnd, 225), r) : null;

  const needleX = cx + (r - 20) * Math.cos(toRad(angle - 90));
  const needleY = cy + (r - 20) * Math.sin(toRad(angle - 90));

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card-header">
        <div className="card-title">
          <span className="card-icon">🎯</span>
          Live Congestion Meter
        </div>
        <span className="badge badge-cyan">REAL-TIME</span>
      </div>

      <div className="meter-container">
        <div className="meter-svg-wrapper">
          <svg width="220" height="150" viewBox="0 0 220 170">
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map(v => {
              const tickAngle = -45 + (v / 100) * 270;
              const innerR = r - 14;
              const outerR = r + 2;
              const x1 = cx + innerR * Math.cos(toRad(tickAngle - 90));
              const y1 = cy + innerR * Math.sin(toRad(tickAngle - 90));
              const x2 = cx + outerR * Math.cos(toRad(tickAngle - 90));
              const y2 = cy + outerR * Math.sin(toRad(tickAngle - 90));
              return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />;
            })}

            {/* Background arc */}
            <path d={bgArcPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />

            {/* Fill arc */}
            {fillArcPath && (
              <path
                d={fillArcPath}
                fill="none"
                stroke={color}
                strokeWidth="14"
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${color})`,
                  transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)'
                }}
              />
            )}

            {/* Needle */}
            <g ref={needleRef} style={{ transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)' }}>
              <line
                x1={cx} y1={cy}
                x2={needleX} y2={needleY}
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* Center circle */}
            <circle cx={cx} cy={cy} r="7" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
            <circle cx={cx} cy={cy} r="3" fill="var(--bg-primary)" />

            {/* Labels */}
            <text x="28" y="148" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="JetBrains Mono">0</text>
            <text x="192" y="148" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="JetBrains Mono">100</text>
          </svg>

          <div className="meter-center-display" style={{ bottom: 28, top: 'auto' }}>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: -20 }}>
          <div className="meter-percent" style={{ color }}>
            {score}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>%</span>
          </div>
          <div className="meter-label">Congestion Score</div>
        </div>

        <div className="meter-status-text" style={{
          color,
          borderColor: color,
          background: `${color}12`,
        }}>
          {getStatusLabel()}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%', marginTop: 4 }}>
          {[
            { label: 'LOW', range: '0–30', active: score < 30, c: 'var(--accent-green)' },
            { label: 'MEDIUM', range: '30–60', active: score >= 30 && score < 60, c: '#facc15' },
            { label: 'HIGH', range: '60+', active: score >= 60, c: 'var(--accent-red)' },
          ].map(zone => (
            <div key={zone.label} style={{
              padding: '8px 6px',
              borderRadius: 8,
              textAlign: 'center',
              background: zone.active ? `${zone.c}15` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${zone.active ? zone.c : 'transparent'}`,
              transition: 'all 0.4s ease',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: zone.active ? zone.c : 'var(--text-muted)', fontWeight: 600 }}>{zone.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{zone.range}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CongestionMeter;
