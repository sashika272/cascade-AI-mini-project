import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/anomalies
router.get('/', (req, res) => {
  const { service_id, severity } = req.query;

  // Filter anomalous rows from metrics stream
  let anomalies = store.metricsStream
    .filter(m => m.error_rate > 1.0 || m.response_time_ms > 120 || m.status !== 'HEALTHY')
    .map((m, idx) => {
      const sev = m.error_rate > 20 || m.response_time_ms > 1000 ? 'CRITICAL' : m.error_rate > 5 || m.response_time_ms > 300 ? 'HIGH' : 'MEDIUM';
      const score = Math.min(0.99, Math.round(((m.response_time_ms / 3000) * 0.5 + (m.error_rate / 100) * 0.5) * 100) / 100);
      return {
        id: `ANM-${1000 + idx}`,
        service_id: m.service_id,
        timestamp: m.timestamp,
        time_offset: m.time_offset,
        severity: sev,
        anomaly_score: Math.max(0.65, score),
        metrics: {
          response_time_ms: m.response_time_ms,
          latency_p99_ms: m.latency_p99_ms,
          error_rate: m.error_rate,
          cpu_usage: m.cpu_usage
        },
        evidence: `Sustained latency ${m.response_time_ms}ms (p99 ${m.latency_p99_ms}ms) and error rate ${m.error_rate}% violates SLO threshold.`,
        is_persistent: ['T+48', 'T+75', 'T+95', 'T+180', 'T+330'].includes(m.time_offset)
      };
    });

  if (service_id) {
    anomalies = anomalies.filter(a => a.service_id.toLowerCase() === service_id.toLowerCase());
  }

  if (severity) {
    anomalies = anomalies.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
  }

  res.json({
    total_anomalies: anomalies.length,
    first_persistent_onset: 'T+48 (10:41:48 AM)',
    anomalies
  });
});

export default router;
