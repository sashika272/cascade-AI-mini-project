import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/config-changes
router.get('/', (req, res) => {
  const { service_id } = req.query;
  let changes = [...store.configChanges];

  if (service_id) {
    changes = changes.filter(c => c.service_id.toLowerCase() === service_id.toLowerCase());
  }

  res.json({
    total_changes: changes.length,
    candidate_root_cause: changes.find(c => c.change_id === 'cfg-1003'),
    downstream_decoy: changes.find(c => c.change_id === 'cfg-2001'),
    changes
  });
});

// GET /api/config-changes/sabotage
router.get('/sabotage', (req, res) => {
  res.json({
    total_sabotage_drops: store.sabotageDrops.length,
    unauthorized_drifts: store.sabotageDrops,
    summary: 'Detected 4 unauthorized shadow changes bypassing GitOps CI/CD approval pipelines.'
  });
});

// POST /api/config-changes/audit
router.post('/audit', (req, res) => {
  const { service_id, parameter, old_value, new_value, author, notes } = req.body;
  if (!service_id || !parameter || !new_value) {
    return res.status(400).json({ error: 'service_id, parameter, and new_value are required.' });
  }

  const newAudit = {
    change_id: `cfg-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    time_offset: 'T+NOW',
    service_id,
    parameter,
    old_value: old_value || 'N/A',
    new_value,
    author: author || 'Current SRE User',
    change_type: 'manual_remediation',
    approved: 'true',
    risk_score: '0.15',
    notes: notes || 'SRE configuration override applied from command center.'
  };

  store.configChanges.unshift(newAudit);
  res.status(201).json({ message: 'Configuration change logged to audit trail.', change: newAudit });
});

export default router;
