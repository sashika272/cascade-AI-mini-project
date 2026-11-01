import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/services
router.get('/', (req, res) => {
  const { status, search } = req.query;
  let list = [...store.services];

  if (status && status !== 'ALL') {
    list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.tier.toLowerCase().includes(q));
  }

  const counts = {
    total: store.services.length,
    healthy: store.services.filter(s => s.status === 'HEALTHY').length,
    degrading: store.services.filter(s => s.status === 'DEGRADING').length,
    critical: store.services.filter(s => s.status === 'CRITICAL_OUTAGE').length
  };

  res.json({
    counts,
    services: list
  });
});

// GET /api/services/:id
router.get('/:id', (req, res) => {
  const service = store.services.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ error: `Service '${req.params.id}' not found` });
  }

  // Get recent metrics history
  const history = store.metricsStream.filter(m => m.service_id === req.params.id);
  // Get recent config changes
  const configs = store.configChanges.filter(c => c.service_id === req.params.id);

  res.json({
    service,
    history,
    configs
  });
});

export default router;
