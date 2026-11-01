import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/replay
router.get('/', (req, res) => {
  const ticks = ['T+00', 'T+42', 'T+48', 'T+75', 'T+95', 'T+180', 'T+330'];

  const timelineSteps = ticks.map(t => {
    const metricsForTick = store.metricsStream.filter(m => m.time_offset === t);
    const criticalCount = metricsForTick.filter(m => m.status === 'CRITICAL_OUTAGE').length;
    const degradingCount = metricsForTick.filter(m => m.status === 'DEGRADING').length;
    const healthyCount = metricsForTick.filter(m => m.status === 'HEALTHY').length;

    let title = 'Normal Operations';
    let description = 'All microservices operating within nominal SLO boundaries.';
    let activeChange = null;

    if (t === 'T+42') {
      title = 'Trigger: Config Change cfg-1003';
      description = 'Aggressive proxy_read_timeout_ms change (5000ms -> 250ms) applied to network-gateway.';
      activeChange = 'cfg-1003';
    } else if (t === 'T+48') {
      title = 'First Persistent Anomaly Onset';
      description = 'network-gateway and auth-service register sustained latency surge (> 180ms).';
    } else if (t === 'T+75') {
      title = 'Golden Intervention Window (10:42 AM)';
      description = 'Crucial opportunity for SRE intervention before cascading queues saturate downstream nodes.';
    } else if (t === 'T+95') {
      title = 'Decoy Change cfg-2001 (Payments)';
      description = 'Engineers modify connection pool on payments-service; identified and rejected as a downstream symptom.';
      activeChange = 'cfg-2001';
    } else if (t === 'T+180') {
      title = 'Critical Degradation Across Chain';
      description = 'Checkout and payments services experience synchronous timeout cascades and socket depletion.';
    } else if (t === 'T+330') {
      title = 'Near-Total System Collapse';
      description = '15 of 17 services in critical outage state; cascade propagation index hits 95%.';
    }

    return {
      tick: t,
      title,
      description,
      activeChange,
      summary: {
        healthy: healthyCount,
        degrading: degradingCount,
        critical: criticalCount,
        total: metricsForTick.length || 17
      },
      services: metricsForTick
    };
  });

  res.json({
    total_ticks: ticks.length,
    ticks: timelineSteps
  });
});

export default router;
