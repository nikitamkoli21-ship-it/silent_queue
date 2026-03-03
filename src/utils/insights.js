// ============================================
//  Silent Queue — AI Insight Generator
// ============================================

export const generateInsights = (prediction, dashboardData, history) => {
  const insights = [];
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (!prediction) return getDefaultInsights(now);

  const { predicted_wait_time, congestion_level, congestion_score } = prediction;

  // Critical congestion
  if (congestion_level === 'CRITICAL' || congestion_score > 85) {
    insights.push({
      id: 'critical',
      icon: '🚨',
      severity: 'critical',
      title: 'Peak Congestion Detected',
      desc: `Congestion at ${congestion_score}% — immediate intervention recommended`,
      time: now,
      bgColor: 'rgba(255,69,113,0.12)',
    });
  } else if (congestion_level === 'HIGH' || congestion_score > 60) {
    insights.push({
      id: 'high',
      icon: '⚠️',
      severity: 'warning',
      title: 'High Traffic Volume',
      desc: `Queue building rapidly — consider pre-emptive action`,
      time: now,
      bgColor: 'rgba(255,156,64,0.12)',
    });
  } else if (congestion_level === 'LOW' || congestion_score < 30) {
    insights.push({
      id: 'stable',
      icon: '✅',
      severity: 'success',
      title: 'Queue Stable',
      desc: `System operating efficiently at ${congestion_score}% capacity`,
      time: now,
      bgColor: 'rgba(0,255,136,0.12)',
    });
  }

  // Staff recommendations
  if (predicted_wait_time > 12) {
    insights.push({
      id: 'staff2',
      icon: '👥',
      severity: 'critical',
      title: 'Recommend: Add 2 Staff Members',
      desc: `Wait time ${predicted_wait_time}min exceeds 12-min SLA threshold`,
      time: now,
      bgColor: 'rgba(155,109,255,0.12)',
    });
  } else if (predicted_wait_time > 7) {
    insights.push({
      id: 'staff1',
      icon: '👤',
      severity: 'warning',
      title: 'Recommend: Add 1 Staff Member',
      desc: `Wait time approaching threshold — proactive staffing advised`,
      time: now,
      bgColor: 'rgba(255,156,64,0.08)',
    });
  }

  // History-based trend
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const trending = last3.every((h, i) => i === 0 || h.congestion_score >= last3[i - 1].congestion_score);
    if (trending) {
      insights.push({
        id: 'trend',
        icon: '📈',
        severity: 'warning',
        title: 'Upward Trend Detected',
        desc: `Congestion rising for ${last3.length} consecutive readings`,
        time: now,
        bgColor: 'rgba(0,229,255,0.08)',
      });
    }
  }

  // Rush hour prediction
  const hour = new Date().getHours();
  if ((hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 13) || (hour >= 17 && hour <= 19)) {
    insights.push({
      id: 'rush',
      icon: '🕐',
      severity: 'info',
      title: 'Rush Hour Window Active',
      desc: 'Typical peak period — elevated queue activity expected',
      time: now,
      bgColor: 'rgba(0,229,255,0.06)',
    });
  }

  return insights.length ? insights : getDefaultInsights(now);
};

const getDefaultInsights = (now) => [
  {
    id: 'ready',
    icon: '🤖',
    severity: 'info',
    title: 'AI Engine Ready',
    desc: 'Submit a prediction to generate real-time insights',
    time: now,
    bgColor: 'rgba(0,229,255,0.06)',
  },
  {
    id: 'monitoring',
    icon: '👁️',
    severity: 'success',
    title: 'Live Monitoring Active',
    desc: 'Dashboard refreshing every 5 seconds',
    time: now,
    bgColor: 'rgba(0,255,136,0.06)',
  },
];

export const getCongestionColor = (level, score) => {
  if (level === 'CRITICAL' || score > 85) return 'var(--accent-red)';
  if (level === 'HIGH' || score > 60) return 'var(--accent-orange)';
  if (level === 'MEDIUM' || score > 30) return '#facc15';
  return 'var(--accent-green)';
};

export const getCongestionBadge = (level) => {
  const map = {
    LOW: 'badge-green',
    MEDIUM: 'badge-orange',
    HIGH: 'badge-orange',
    CRITICAL: 'badge-red',
  };
  return map[level] || 'badge-cyan';
};
