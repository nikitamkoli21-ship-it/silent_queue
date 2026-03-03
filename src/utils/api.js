// ============================================
//  Silent Queue — API Service
// ============================================
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Mock data fallback when backend is unavailable
const mockPredict = (queueLength, avgServiceTime) => {
  const waitTime = (queueLength * avgServiceTime * (0.85 + Math.random() * 0.3)).toFixed(1);
  const congestion = Math.min(100, Math.round((queueLength / 20) * 100 * (0.8 + Math.random() * 0.4)));
  const levels = congestion < 35 ? 'LOW' : congestion < 65 ? 'MEDIUM' : congestion < 85 ? 'HIGH' : 'CRITICAL';
  return { predicted_wait_time: parseFloat(waitTime), congestion_level: levels, congestion_score: congestion };
};

const mockDashboard = () => ({
  total_predictions: Math.floor(Math.random() * 30) + 120,
  avg_wait_time: (Math.random() * 8 + 3).toFixed(1),
  current_queue_length: Math.floor(Math.random() * 15) + 2,
  peak_hour: Math.random() > 0.5,
  uptime: '99.8%',
});

export const predictQueue = async (queueLength, avgServiceTime) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/predict`, {
      queue_length: queueLength,
      avg_service_time: avgServiceTime,
    });
    return data;
  } catch {
    console.warn('Backend offline — using mock data');
    return mockPredict(queueLength, avgServiceTime);
  }
};

export const fetchDashboard = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/dashboard`);
    return data;
  } catch {
    console.warn('Backend offline — using mock data');
    return mockDashboard();
  }
};
