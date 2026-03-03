// hooks/useQueue.js — Silent Queue Core Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { predictQueue, fetchDashboard, mockPredict, mockDashboard } from '../utils/api';
import { generateInsights, getRushHourBadge, getStaffRecommendation } from '../utils/insights';

// ── Live Queue Simulation ────────────────────────────────────────────────────
const generateLivePoint = (index, prevLen) => {
  const hour = new Date().getHours();
  const isPeak = (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19);
  const base = isPeak ? 18 : 8;
  const noise = (Math.random() - 0.5) * 6;
  const drift = prevLen !== undefined ? (prevLen - base) * -0.15 : 0;
  return Math.max(0, Math.min(40, Math.round(base + noise + drift)));
};

export const useQueue = (darkMode) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [queueLength, setQueueLength]     = useState(10);
  const [avgServiceTime, setAvgServiceTime] = useState(3);
  const [prediction, setPrediction]       = useState(null);
  const [dashboard, setDashboard]         = useState(null);
  const [history, setHistory]             = useState([]);
  const [insights, setInsights]           = useState([]);
  const [trendData, setTrendData]         = useState([]);
  const [loading, setLoading]             = useState(false);
  const [dashLoading, setDashLoading]     = useState(true);
  const [error, setError]                 = useState(null);
  const [isRushHour, setIsRushHour]       = useState(false);
  const [liveQueueLen, setLiveQueueLen]   = useState(10);
  const [backendOnline, setBackendOnline] = useState(true);

  const trendRef = useRef([]);
  const liveRef  = useRef(10);

  // ── Seed trend data on mount ───────────────────────────────────────────────
  useEffect(() => {
    const seed = [];
    let prev = 10;
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const len = generateLivePoint(i, prev);
      seed.push({
        time: new Date(now - i * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        queueLength: len,
        waitTime: parseFloat((len * 3 * (0.8 + Math.random() * 0.4)).toFixed(1)),
      });
      prev = len;
    }
    trendRef.current = seed;
    setTrendData(seed);
    liveRef.current = seed[seed.length - 1].queueLength;
    setLiveQueueLen(liveRef.current);
  }, []);

  // ── Live simulation tick (every 3s) ────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const newLen = generateLivePoint(0, liveRef.current);
      liveRef.current = newLen;
      setLiveQueueLen(newLen);
      setIsRushHour(getRushHourBadge(newLen));

      const point = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        queueLength: newLen,
        waitTime: parseFloat((newLen * 3 * (0.8 + Math.random() * 0.4)).toFixed(1)),
      };
      trendRef.current = [...trendRef.current.slice(-49), point];
      setTrendData([...trendRef.current]);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // ── Dashboard auto-refresh (every 5s) ─────────────────────────────────────
  const refreshDashboard = useCallback(async () => {
    try {
      const data = await fetchDashboard();
      setDashboard(data);
      setBackendOnline(true);
    } catch {
      setDashboard(mockDashboard());
      setBackendOnline(false);
    } finally {
      setDashLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
    const id = setInterval(refreshDashboard, 5000);
    return () => clearInterval(id);
  }, [refreshDashboard]);

  // ── Predict handler ────────────────────────────────────────────────────────
  const handlePredict = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      try {
        result = await predictQueue({ queueLength, avgServiceTime });
        setBackendOnline(true);
      } catch {
        result = mockPredict({ queueLength, avgServiceTime });
        setBackendOnline(false);
      }

      // Enrich result
      result.recommended_staff = getStaffRecommendation(result.wait_time, queueLength);
      result.congestion_score  = result.congestion_score ??
        Math.min(100, Math.round((queueLength / 30) * 100));

      setPrediction(result);
      setInsights(generateInsights(result));
      setIsRushHour(getRushHourBadge(queueLength));

      const entry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        queueLength,
        avgServiceTime,
        waitTime: result.wait_time,
        congestion: result.congestion_level,
        staff: result.recommended_staff,
      };
      setHistory((h) => [entry, ...h].slice(0, 20));
    } catch (e) {
      setError('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [queueLength, avgServiceTime]);

  return {
    // Inputs
    queueLength, setQueueLength,
    avgServiceTime, setAvgServiceTime,
    // Outputs
    prediction,
    dashboard,
    history,
    insights,
    trendData,
    liveQueueLen,
    isRushHour,
    // State
    loading,
    dashLoading,
    error,
    backendOnline,
    // Actions
    handlePredict,
    refreshDashboard,
  };
};
