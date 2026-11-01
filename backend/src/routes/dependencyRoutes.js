import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/dependencies
router.get('/', (req, res) => {
  // Merge live status into nodes
  const nodesWithStatus = store.dependencies.nodes.map(node => {
    const live = store.services.find(s => s.id === node.id);
    return {
      ...node,
      status: live ? live.status : 'HEALTHY',
      response_time_ms: live ? live.response_time_ms : 40,
      error_rate: live ? live.error_rate : 0
    };
  });

  res.json({
    topology_version: store.dependencies.topology_version || '2.4.0',
    case_study_chain: store.dependencies.case_study_chain,
    nodes: nodesWithStatus,
    edges: store.dependencies.edges
  });
});

// GET /api/dependencies/chain
router.get('/chain', (req, res) => {
  const chainIds = store.dependencies.case_study_chain;
  const chainNodes = chainIds.map(id => {
    const svc = store.services.find(s => s.id === id);
    return svc || { id };
  });

  res.json({
    chain: chainIds,
    nodes: chainNodes,
    direction: 'network-gateway -> auth-service -> checkout-service -> payments-service',
    root_cause_service: 'network-gateway',
    decoy_service: 'payments-service'
  });
});

// GET /api/dependencies/blast-radius/:id
router.get('/blast-radius/:id', (req, res) => {
  const rootId = req.params.id;
  const visited = new Set();
  const queue = [rootId];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (!visited.has(curr)) {
      visited.add(curr);
      // Find outbound edges
      const outbound = store.dependencies.edges.filter(e => e.source === curr);
      outbound.forEach(e => {
        if (!visited.has(e.target)) queue.push(e.target);
      });
    }
  }

  res.json({
    root_service: rootId,
    blast_radius_count: visited.size,
    affected_services: Array.from(visited)
  });
});

export default router;
