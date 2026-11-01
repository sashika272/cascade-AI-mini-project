import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/incidents
router.get('/', (req, res) => {
  res.json({
    total: store.incidents.length,
    active_sev1_count: store.incidents.filter(i => i.severity === 'SEV-1' && i.status !== 'RESOLVED').length,
    incidents: store.incidents
  });
});

// GET /api/incidents/:id
router.get('/:id', (req, res) => {
  const inc = store.incidents.find(i => i.id === req.params.id);
  if (!inc) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(inc);
});

// PATCH /api/incidents/:id/status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const inc = store.incidents.find(i => i.id === req.params.id);
  if (!inc) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  inc.status = status;
  inc.notes.push({
    author: req.body.author || 'SRE Engineer',
    timestamp: new Date().toISOString(),
    text: `Status changed to ${status}`
  });

  res.json({ message: 'Incident updated', incident: inc });
});

// POST /api/incidents/:id/notes
router.post('/:id/notes', (req, res) => {
  const { author, text } = req.body;
  const inc = store.incidents.find(i => i.id === req.params.id);
  if (!inc) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const note = {
    author: author || 'Incident Responder',
    timestamp: new Date().toLocaleTimeString(),
    text: text || ''
  };

  inc.notes.push(note);
  res.status(201).json({ message: 'Note added', note });
});

export default router;
