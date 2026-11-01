import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { store } from './db/store.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import dependencyRoutes from './routes/dependencyRoutes.js';
import anomalyRoutes from './routes/anomalyRoutes.js';
import configRoutes from './routes/configRoutes.js';
import rcaRoutes from './routes/rcaRoutes.js';
import replayRoutes from './routes/replayRoutes.js';
import recoveryRoutes from './routes/recoveryRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import predictiveRoutes from './routes/predictiveRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/dependencies', dependencyRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/config-changes', configRoutes);
app.use('/api/rca', rcaRoutes);
app.use('/api/replay', replayRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/predictive', predictiveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'CASCADE // AI SRE Command Center Backend',
    version: '2.4.0',
    port: PORT,
    database: 'In-Memory Persistent Store + MongoDB Adapter',
    services_loaded: store.services.length,
    config_changes_loaded: store.configChanges.length,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend dist build if present
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/ai')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Initialize database and start server
async function start() {
  await store.initialize();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`🚀 CASCADE // AI Backend running on http://localhost:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Services: ${store.services.length} registered`);
    console.log(`================================================================`);
  });
}

start();
