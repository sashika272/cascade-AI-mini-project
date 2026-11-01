import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const hash = store.hashPassword(password);
  if (user.passwordHash !== hash) {
    return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
  }

  const token = store.createToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar
    }
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  // Password strength check
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const validRoles = ['Admin', 'SRE Engineer', 'Viewer'];
  const userRole = validRoles.includes(role) ? role : 'SRE Engineer';

  const newUser = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name,
    email,
    role: userRole,
    title: userRole === 'Admin' ? 'Incident Commander' : userRole === 'SRE Engineer' ? 'Reliability Engineer' : 'DevOps Observer',
    passwordHash: store.hashPassword(password),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  };

  store.users.push(newUser);
  const token = store.createToken(newUser);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      title: newUser.title,
      avatar: newUser.avatar
    }
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Return friendly message without exposing user existence
    return res.json({
      message: 'If the email exists in the registry, a secure reset token has been dispatched to the SRE security channel.'
    });
  }

  const resetToken = `RST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  res.json({
    message: 'Password reset token generated and sent to SRE notification queue.',
    resetToken,
    expiresInMinutes: 15
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.passwordHash = store.hashPassword(newPassword);
  res.json({ message: 'Password updated successfully. You can now login with your new credentials.' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthenticated.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = store.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  const user = store.users.find(u => u.id === payload.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      bio: user.bio || 'Enterprise SRE specialist focused on distributed systems reliability and cascading failure prevention.',
      phone: user.phone || '+1 (555) 234-5678',
      timezone: user.timezone || 'UTC (GMT+0)',
      pagerdutyKey: user.pagerdutyKey || 'pd-live-cascade-sre-8492',
      sshKey: user.sshKey || 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... cascade-sre-key'
    }
  });
});

// PUT /api/auth/profile (Update Profile)
router.put('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  let user = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = store.verifyToken(token);
    if (payload) {
      user = store.users.find(u => u.id === payload.id);
    }
  }

  // Fallback to first user or Alex Mercer for convenience
  if (!user) {
    user = store.users[1] || store.users[0];
  }

  const { name, title, bio, phone, timezone, pagerdutyKey, sshKey, avatar } = req.body;
  if (name) user.name = name;
  if (title) user.title = title;
  if (bio) user.bio = bio;
  if (phone) user.phone = phone;
  if (timezone) user.timezone = timezone;
  if (pagerdutyKey) user.pagerdutyKey = pagerdutyKey;
  if (sshKey) user.sshKey = sshKey;
  if (avatar) user.avatar = avatar;

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      timezone: user.timezone,
      pagerdutyKey: user.pagerdutyKey,
      sshKey: user.sshKey
    }
  });
});

// POST /api/auth/change-password
router.post('/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  let user = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = store.verifyToken(token);
    if (payload) {
      user = store.users.find(u => u.id === payload.id);
    }
  }

  if (!user) {
    user = store.users[1] || store.users[0];
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const currentHash = store.hashPassword(currentPassword);
  if (user.passwordHash !== currentHash) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  user.passwordHash = store.hashPassword(newPassword);
  res.json({ message: 'Password changed successfully.' });
});

export default router;
