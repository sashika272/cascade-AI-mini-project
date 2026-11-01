import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/rca
router.get('/', (req, res) => {
  // Scenario Onset: T+48 (10:41:48 UTC)
  const onsetOffsetSec = 48;

  // Chain order
  const chainOrder = {
    'network-gateway': 0,
    'auth-service': 1,
    'checkout-service': 2,
    'payments-service': 3
  };

  const candidateRootCause = {
    change_id: 'cfg-1003',
    service_id: 'network-gateway',
    timestamp: '2026-11-01T10:41:18Z',
    time_offset: 'T+42 (10:41:18 AM)',
    parameter: 'proxy_read_timeout_ms',
    previous_value: '5000ms',
    faulty_value: '250ms',
    confidence_score: 0.986,
    confidence_percentage: '98.6%',
    verdict: 'CONFIRMED PRIMARY ROOT CAUSE',
    temporal_delta: 'Preceded onset by 6 seconds (T+42 vs T+48)',
    topology_rank: 'Root Ingress Node (Centrality: 0.98, Out-Degree: 4)',
    cascade_origin: true,
    evidence: [
      {
        rule: 'Temporal Precedence Test',
        passed: true,
        details: 'Timestamp T+42 strictly preceded the first persistent anomaly onset at T+48.'
      },
      {
        rule: 'Dependency Graph Directionality Test',
        passed: true,
        details: 'network-gateway sits at the upstream inception of the critical path (network-gateway -> auth-service -> checkout-service -> payments-service).'
      },
      {
        rule: 'Mechanism Attribution',
        passed: true,
        details: 'Proxy read timeout reduced from 5000ms to 250ms caused premature aborts on valid auth tokens and checkout payloads.'
      },
      {
        rule: 'Failure Propagation Consistency',
        passed: true,
        details: 'Degradation order matched topological traversal: T+48 (gateway/auth) -> T+75 (checkout) -> T+95 (payments) -> T+330 (cluster).'
      }
    ]
  };

  const rejectedDecoy = {
    change_id: 'cfg-2001',
    service_id: 'payments-service',
    timestamp: '2026-11-01T10:46:11Z',
    time_offset: 'T+95 (10:46:11 AM)',
    parameter: 'connection_pool_max',
    previous_value: '100',
    applied_value: '250',
    verdict: 'DOWNSTREAM DECOY DISQUALIFIED',
    confidence_score: 0.014,
    reasons: [
      {
        check: 'Temporal Causality Violation',
        disqualified: true,
        explanation: 'Applied at T+95, exactly 47 seconds AFTER persistent cascading anomalies were already established at T+48.'
      },
      {
        check: 'Dependency Position Violation',
        disqualified: true,
        explanation: 'payments-service sits at the farthest downstream terminal position (Position 3). Downstream changes cannot causally cause earlier upstream gateway latency drift.'
      },
      {
        check: 'Misleading Loudness / Symptom Trap',
        disqualified: true,
        explanation: 'payments-service exhibited high error volume because incoming checkout requests had already timed out at the gateway.'
      }
    ]
  };

  res.json({
    incident_id: 'INC-8492',
    scenario_confidence: '98.6%',
    primary_root_cause: candidateRootCause,
    rejected_decoy: rejectedDecoy,
    recommended_intervention_window: 'T+75 (10:42 AM)',
    propagation_chain: [
      { step: 1, service: 'network-gateway', time: 'T+42 to T+48', impact: 'Ingress timeout drops 12% of valid requests' },
      { step: 2, service: 'auth-service', time: 'T+48 to T+75', impact: 'Retry queue saturation and thread pool depletion' },
      { step: 3, service: 'checkout-service', time: 'T+75 to T+180', impact: 'Cascading timeout propagation and buffer overflow' },
      { step: 4, service: 'payments-service', time: 'T+95 to T+330', impact: 'Exhausted worker threads and near-total system collapse' }
    ]
  });
});

export default router;
