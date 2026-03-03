// ============================================
//  Silent Queue — Dashboard Hook (auto-refresh)
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { fetchDashboard } from '../utils/api';

const generateTrendPoint = (index, base) => ({
  time: `T-${(10 - index) * 30}s`,
  queue: Math.max(1, Math.round(base + (Math.random() - 0.5) * 4)),
  waitTime: parseFloat((base * 0.7 + Math.random() * 3).toFixed(1)),
  congestion: Math.min(100, Math.round(base * 5 + Math.random() * 15)),
});

export const useDashboard = () => {
  const [dashData, setDashData] = useState(null);
  const [trendData, setTrendData] = useState(() =>
    Array.from({ length: 10 }, (_, i) => generateTrendPoint(i, 5))
  );
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(async () => {
    try {
      const data = await fetchDashboard();
      setDashData(data);
      setLastRefresh(new Date());

      // Append new trend point, keep last 12
      setTrendData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          queue: data.current_queue_length || Math.floor(Math.random() * 12) + 2,
          waitTime: parseFloat(data.avg_wait_time) || parseFloat((Math.random() * 8 + 2).toFixed(1)),
          congestion: Math.min(100, Math.round((data.current_queue_length || 5) * 5 + Math.random() * 15)),
        };
        return [...prev.slice(-11), newPoint];
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  return { dashData, trendData, loading, lastRefresh, refresh };
};
