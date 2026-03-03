import React, { useState, useCallback } from 'react';
import './styles/globals.css';
import './styles/components.css';

import Navbar from './components/Navbar';
import KpiGrid from './components/KpiGrid';
import PredictPanel from './components/PredictPanel';
import CongestionMeter from './components/CongestionMeter';
import TrendChart from './components/TrendChart';
import AIInsights from './components/AIInsights';
import PredictionHistory from './components/PredictionHistory';
import { useDashboard } from './hooks/useDashboard';

let predIdCounter = 1;

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [predHistory, setPredHistory] = useState([]);

  const { dashData, trendData, loading, lastRefresh } = useDashboard();

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handlePrediction = useCallback((pred) => {
    const enriched = { ...pred, id: predIdCounter++ };
    setLatestPrediction(enriched);
    setPredHistory(prev => [...prev, enriched]);
  }, []);

  const congestionScore = latestPrediction?.congestion_score ?? 0;
  const congestionLevel = latestPrediction?.congestion_level ?? 'LOW';
  const isRushHour = latestPrediction?.predicted_wait_time > 7 ||
    dashData?.peak_hour;

  return (
    <div className="app-shell" data-theme={theme}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="main-content">

        {/* Rush Hour Banner */}
        {isRushHour && (
          <div className="rush-banner">
            <span className="rush-banner-icon">⚡</span>
            <div>
              <div className="rush-banner-text">Rush Hour Approaching — Queue Activity Elevated</div>
              <div className="rush-banner-sub">
                AI recommendation: {latestPrediction?.predicted_wait_time > 12 ? 'Add 2 staff members' : 'Add 1 staff member'} — consider routing to secondary queue
              </div>
            </div>
            <span className="badge badge-red" style={{ marginLeft: 'auto' }}>ALERT</span>
          </div>
        )}

        {/* KPI Cards */}
        <KpiGrid dashData={dashData} loading={loading} />

        {/* Predict + Meter */}
        <div className="dashboard-row row-2-1">
          <PredictPanel onPrediction={handlePrediction} />
          <CongestionMeter score={congestionScore} level={congestionLevel} />
        </div>

        {/* Chart + Insights */}
        <div className="dashboard-row row-2-col">
          <TrendChart data={trendData} lastRefresh={lastRefresh} />
          <AIInsights
            prediction={latestPrediction}
            dashData={dashData}
            history={predHistory}
          />
        </div>

        {/* History Table */}
        <PredictionHistory history={predHistory} />

      </main>

      <footer className="footer">
        <div>⚡ SILENT QUEUE — AI Queue Intelligence Platform</div>
        <div className="footer-right">
          <span>Backend: localhost:8000</span>
          <span>Refresh: 5s</span>
          <span style={{ color: 'var(--accent-green)' }}>● Operational</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
