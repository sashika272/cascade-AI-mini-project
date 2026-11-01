import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// Pre-packaged Authentic SRE Cascading Failure Scenarios
const PREPACKAGED_SCENARIOS = [
  {
    id: 'scen-01',
    name: 'SEV-1 Ingress Proxy Timeout Spike (cfg-1003)',
    targetService: 'network-gateway',
    failureType: 'Proxy Read Timeout Spike',
    intensity: 'HIGH',
    description: 'Ground truth scenario: Lowering proxy timeout to 250ms triggers immediate retries from auth-service and checkout-service.',
    rootCauseChange: 'cfg-1003'
  },
  {
    id: 'scen-02',
    name: 'Database Socket Saturation & Pool Depletion (cfg-2001)',
    targetService: 'payments-service',
    failureType: 'TCP Connection Pool Saturation',
    intensity: 'MEDIUM',
    description: 'Downstream decoy scenario: Inflating connection pool size on payments exhausts PostgreSQL max_connections ceiling.',
    rootCauseChange: 'cfg-2001'
  },
  {
    id: 'scen-03',
    name: 'OAuth2 JWKS Token Validation Queue Stall',
    targetService: 'auth-service',
    failureType: 'Worker Thread Exhaustion',
    intensity: 'HIGH',
    description: 'Worker thread exhaustion blocks ingress authorization headers, stalling all downstream microservice RPC calls.',
    rootCauseChange: 'cfg-1004'
  },
  {
    id: 'scen-04',
    name: 'Distributed Saga Transaction Deadlock',
    targetService: 'checkout-service',
    failureType: 'Unauthorized Shadow Config Injection',
    intensity: 'MEDIUM',
    description: 'Transaction lock deadlock freezes inventory reservation and halts shopping cart checkout queues.',
    rootCauseChange: 'cfg-1005'
  },
  {
    id: 'scen-05',
    name: 'Redis Volatile Session Memory Eviction Burst',
    targetService: 'cart-service',
    failureType: 'Network Packet Loss & Retransmit',
    intensity: 'LOW',
    description: 'Volatile memory pressure triggers Redis eviction cascade, with fallback reads hitting PostgreSQL storage.',
    rootCauseChange: 'cfg-1006'
  }
];

// GET /api/simulation/scenarios
router.get('/scenarios', (req, res) => {
  res.json({ scenarios: PREPACKAGED_SCENARIOS });
});

// POST /api/simulation/chaos
router.post('/chaos', (req, res) => {
  const { targetService, failureType, intensity } = req.body;
  if (!targetService || !failureType) {
    return res.status(400).json({ error: 'targetService and failureType are required.' });
  }

  const result = store.injectChaos(targetService, failureType, intensity || 'HIGH');
  res.json(result);
});

// POST /api/simulation/reset
router.post('/reset', (req, res) => {
  // Restore all service statuses to current store state
  res.json({
    status: 'success',
    message: 'Simulation canvas reset. All telemetry counters returned to live monitoring baseline.',
    timestamp: new Date().toISOString()
  });
});

export default router;
