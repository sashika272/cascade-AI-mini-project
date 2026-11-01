import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/notifications - List all notifications
router.get('/', (req, res) => {
  const { severity } = req.query;
  let list = store.notifications;
  if (severity && severity !== 'ALL') {
    list = list.filter(n => n.severity.toUpperCase() === severity.toString().toUpperCase());
  }

  const unreadCount = store.notifications.filter(n => !n.read).length;

  res.json({
    notifications: list,
    unreadCount,
    total: store.notifications.length
  });
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', (req, res) => {
  const { id } = req.params;
  const notif = store.notifications.find(n => n.id === id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found.' });
  }

  notif.read = true;
  const unreadCount = store.notifications.filter(n => !n.read).length;
  res.json({ message: 'Notification marked as read', notification: notif, unreadCount });
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', (req, res) => {
  store.notifications.forEach(n => { n.read = true; });
  res.json({ message: 'All notifications marked as read', unreadCount: 0 });
});

// POST /api/notifications - Dispatch a new notification alert
router.post('/', (req, res) => {
  const { title, message, severity, serviceId, incidentId } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const newNotif = {
    id: `notif-${Date.now().toString().slice(-4)}`,
    title,
    message,
    severity: (severity || 'INFO').toUpperCase(),
    serviceId: serviceId || 'network-gateway',
    incidentId: incidentId || 'INC-8492',
    read: false,
    timestamp: new Date().toISOString()
  };

  store.notifications.unshift(newNotif);
  const unreadCount = store.notifications.filter(n => !n.read).length;

  res.status(201).json({
    message: 'Notification alert dispatched',
    notification: newNotif,
    unreadCount
  });
});

export default router;
