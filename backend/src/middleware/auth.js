import { store } from '../db/store.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  const user = store.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  req.user = user;
  next();
}

export function authorizeRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' lacks permission. Required: [${roles.join(', ')}]`
      });
    }
    next();
  };
}
