import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/predictive/forecast
router.get('/forecast', (req, res) => {
  const { service_id } = req.query;
  const targetId = service_id || 'network-gateway';
  const svc = store.services.find(s => s.id === targetId) || store.services[0];

  const currentRisk = svc.status === 'CRITICAL_OUTAGE' ? 0.95 : svc.status === 'DEGRADING' ? 0.65 : 0.15;

  res.json({
    service_id: svc.id,
    service_name: svc.name,
    cascade_risk_score: currentRisk,
    risk_percentage: `${Math.round(currentRisk * 100)}%`,
    time_to_collapse_seconds: svc.status === 'HEALTHY' ? 3600 : 75,
    critical_threshold_ms: 250,
    current_p99_ms: svc.latency_p99_ms,
    early_warnings: [
      {
        timestamp: '10:41:48 AM',
        severity: 'HIGH',
        message: 'Persistent latency drift gradient > 4.2 ms/sec detected on ingress node.'
      },
      {
        timestamp: '10:42:15 AM',
        severity: 'CRITICAL',
        message: 'Downstream queue depth on auth-service exceeded 85% capacity buffer.'
      },
      {
        timestamp: '10:46:11 AM',
        severity: 'WARNING',
        message: 'Downstream decoy change cfg-2001 detected. Suppressed from root-cause ranking.'
      }
    ],
    risk_projection: [
      { time_offset: 'T+00', risk_pct: 5 },
      { time_offset: 'T+42', risk_pct: 18 },
      { time_offset: 'T+48', risk_pct: 45 },
      { time_offset: 'T+75', risk_pct: 72 },
      { time_offset: 'T+95', risk_pct: 88 },
      { time_offset: 'T+180', risk_pct: 95 },
      { time_offset: 'T+330', risk_pct: 99 }
    ]
  });
});

export default router;
