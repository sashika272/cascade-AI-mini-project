import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');

// In-Memory store backed by JSON and CSV data
class DataStore {
  constructor() {
    this.users = [];
    this.services = [];
    this.dependencies = { nodes: [], edges: [] };
    this.configChanges = [];
    this.sabotageDrops = [];
    this.metricsStream = [];
    this.incidents = [];
    this.simulations = [];
    this.recoveryActions = [];
    this.notifications = [];
    this.auditLogs = [];
    this.systemLockdown = false;
    this.initialized = false;
  }

  // Cryptographic helper for password hashing
  hashPassword(password, salt = 'cascade_ai_salt_2026') {
    return crypto.scryptSync(password, salt, 32).toString('hex');
  }

  // Token helper
  createToken(user) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 3600)
    })).toString('base64url');
    const signature = crypto.createHmac('sha256', 'cascade_secret_jwt_key_922524118047')
      .update(`${header}.${payload}`)
      .digest('base64url');
    return `${header}.${payload}.${signature}`;
  }

  verifyToken(token) {
    try {
      const [header, payload, signature] = token.split('.');
      const expectedSig = crypto.createHmac('sha256', 'cascade_secret_jwt_key_922524118047')
        .update(`${header}.${payload}`)
        .digest('base64url');
      if (signature !== expectedSig) return null;
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
      return data;
    } catch {
      return null;
    }
  }

  async initialize() {
    if (this.initialized) return;

    // 1. Seed Pre-configured Enterprise SRE Users
    this.users = [
      {
        id: 'usr-admin',
        name: 'Sashika K N',
        email: 'sashika@sre.corp',
        role: 'Admin',
        title: 'Security Commander & Team Leader',
        passwordHash: this.hashPassword('Admin@2026!'),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr-sre',
        name: 'Alex Mercer',
        email: 'alex.mercer@sre.corp',
        role: 'SRE Engineer',
        title: 'Lead SRE Architect',
        passwordHash: this.hashPassword('SreLead@2026!'),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr-viewer',
        name: 'Vikashini S',
        email: 'vikashini@sre.corp',
        role: 'Viewer',
        title: 'DevOps Observer & Team Member',
        passwordHash: this.hashPassword('Viewer@2026!'),
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
      }
    ];

    // 2. Load dependency_map.json
    try {
      const depPath = path.join(DATA_DIR, 'dependency_map.json');
      if (fs.existsSync(depPath)) {
        const raw = fs.readFileSync(depPath, 'utf8');
        this.dependencies = JSON.parse(raw);
        this.services = this.dependencies.nodes.map(node => ({
          ...node,
          status: 'CRITICAL_OUTAGE',
          cpu_usage: 94.5,
          memory_usage: 92.1,
          response_time_ms: 1850.0,
          latency_p99_ms: 3200.0,
          request_count: 2400,
          error_rate: 34.2,
          uptime_percentage: 99.42,
          mttr_minutes: 24,
          mtta_minutes: 2.1
        }));

        // Keep 1 healthy, 1 degrading, 15 critical outage matching exact PPT/Report screenshot
        this.services = this.services.map(s => {
          if (s.id === 'logging-aggregator') {
            return { ...s, status: 'HEALTHY', response_time_ms: 22.0, latency_p99_ms: 38.0, error_rate: 0.0, cpu_usage: 28.0 };
          }
          if (s.id === 'cache-cluster') {
            return { ...s, status: 'DEGRADING', response_time_ms: 45.0, latency_p99_ms: 120.0, error_rate: 3.2, cpu_usage: 74.0 };
          }
          return { ...s, status: 'CRITICAL_OUTAGE' };
        });
      }
    } catch (err) {
      console.error('Error loading dependency_map.json:', err);
    }

    // 3. Load config_changes.csv
    try {
      const cfgPath = path.join(DATA_DIR, 'config_changes.csv');
      if (fs.existsSync(cfgPath)) {
        const lines = fs.readFileSync(cfgPath, 'utf8').trim().split('\n');
        const headers = lines[0].split(',');
        this.configChanges = lines.slice(1).map(line => {
          const vals = line.split(',');
          const obj = {};
          headers.forEach((h, i) => obj[h.trim()] = vals[i] ? vals[i].trim() : '');
          return obj;
        });
      }
    } catch (err) {
      console.error('Error loading config_changes.csv:', err);
    }

    // 4. Load sabotage_drops/config_change_addition.csv
    try {
      const sabPath = path.join(DATA_DIR, 'sabotage_drops', 'config_change_addition.csv');
      if (fs.existsSync(sabPath)) {
        const lines = fs.readFileSync(sabPath, 'utf8').trim().split('\n');
        const headers = lines[0].split(',');
        this.sabotageDrops = lines.slice(1).map(line => {
          const vals = line.split(',');
          const obj = {};
          headers.forEach((h, i) => obj[h.trim()] = vals[i] ? vals[i].trim() : '');
          return obj;
        });
      }
    } catch (err) {
      console.error('Error loading sabotage drops:', err);
    }

    // 5. Load metrics_stream.csv
    try {
      const mPath = path.join(DATA_DIR, 'metrics_stream.csv');
      if (fs.existsSync(mPath)) {
        const lines = fs.readFileSync(mPath, 'utf8').trim().split('\n');
        const headers = lines[0].split(',');
        this.metricsStream = lines.slice(1).map(line => {
          const vals = line.split(',');
          const obj = {};
          headers.forEach((h, i) => obj[h.trim()] = vals[i] ? vals[i].trim() : '');
          return {
            ...obj,
            cpu_usage: parseFloat(obj.cpu_usage || 0),
            memory_usage: parseFloat(obj.memory_usage || 0),
            response_time_ms: parseFloat(obj.response_time_ms || 0),
            latency_p99_ms: parseFloat(obj.latency_p99_ms || 0),
            request_count: parseInt(obj.request_count || 0),
            error_rate: parseFloat(obj.error_rate || 0)
          };
        });
      }
    } catch (err) {
      console.error('Error loading metrics_stream.csv:', err);
    }

    // 6. Seed Active Incident: INC-8492
    this.incidents = [
      {
        id: 'INC-8492',
        title: 'SEV-1 Cascading Outage Detected Across Ingress Chain',
        severity: 'SEV-1',
        status: 'INVESTIGATING',
        createdAt: '2026-11-01T10:41:48Z',
        rootCauseService: 'network-gateway',
        rootCauseChangeId: 'cfg-1003',
        decoyRejectedChangeId: 'cfg-2001',
        confidence: 0.986,
        confidencePct: '98.6%',
        cascadeRiskIndex: '95%',
        affectedServicesCount: 16,
        totalServices: 17,
        currentSummary: 'Subtle latency drift began at T+00:48 following configuration change cfg-1003. SRE intervention window recommended at T+01:15 (10:42 AM).',
        timeline: [
          { time: 'T+00', label: 'Baseline normal operation', status: 'HEALTHY' },
          { time: 'T+42', label: 'Config change cfg-1003 applied at network-gateway', status: 'TRIGGER' },
          { time: 'T+48', label: 'First persistent anomaly onset detected', status: 'DEGRADING' },
          { time: 'T+75', label: 'Intervention window (10:42 AM)', status: 'WARNING' },
          { time: 'T+95', label: 'Downstream decoy cfg-2001 applied at payments-service (REJECTED)', status: 'DECOY' },
          { time: 'T+180', label: 'Critical cascading degradation', status: 'CRITICAL' },
          { time: 'T+330', label: 'Near-total system collapse', status: 'COLLAPSE' }
        ],
        notes: [
          { author: 'AI Engine', timestamp: '10:42:00', text: 'Temporal filter disqualified cfg-2001 (T+95 > T+48). Candidate cfg-1003 identified.' }
        ]
      }
    ];

    // 7. Seed Notifications & Alerts (Module / MachineMind Feature 11)
    this.notifications = [
      {
        id: 'notif-001',
        title: 'SEV-1 Cascading Failure Triggered',
        message: 'Cascading latency surge detected originating from network-gateway. 16 of 17 microservices affected.',
        severity: 'CRITICAL',
        serviceId: 'network-gateway',
        incidentId: 'INC-8492',
        read: false,
        timestamp: '2026-11-01T10:41:48Z'
      },
      {
        id: 'notif-002',
        title: 'Dangerous Configuration Change Detected',
        message: 'Change cfg-1003 reduced proxy_read_timeout_ms from 5000 to 250 on network-gateway.',
        severity: 'CRITICAL',
        serviceId: 'network-gateway',
        incidentId: 'INC-8492',
        read: false,
        timestamp: '2026-11-01T10:41:52Z'
      },
      {
        id: 'notif-003',
        title: 'AI Decoy Filter Rejection',
        message: 'Downstream config change cfg-2001 (payments-service) disqualified as root cause with 98.6% confidence.',
        severity: 'INFO',
        serviceId: 'payments-service',
        incidentId: 'INC-8492',
        read: false,
        timestamp: '2026-11-01T10:42:05Z'
      },
      {
        id: 'notif-004',
        title: 'SLO Violation Warning',
        message: 'P99 Latency exceeded 2000ms threshold on checkout-service and auth-service.',
        severity: 'WARNING',
        serviceId: 'checkout-service',
        incidentId: 'INC-8492',
        read: true,
        timestamp: '2026-11-01T10:43:10Z'
      },
      {
        id: 'notif-005',
        title: 'Telemetry Heartbeat Ingest Operational',
        message: 'All 17 microservices streaming metrics to Prometheus/OpenTelemetry pipeline.',
        severity: 'INFO',
        serviceId: 'logging-aggregator',
        read: true,
        timestamp: '2026-11-01T10:30:00Z'
      }
    ];

    // 8. Seed Security Audit Logs (MachineMind Feature 5)
    this.auditLogs = [
      {
        id: 'aud-001',
        timestamp: '2026-11-01T10:41:48Z',
        actor: 'SYSTEM_MONITOR',
        action: 'INCIDENT_CREATED',
        details: 'Incident INC-8492 created due to P99 latency breach (>1500ms).',
        severity: 'HIGH'
      },
      {
        id: 'aud-002',
        timestamp: '2026-11-01T10:42:00Z',
        actor: 'AI_RCA_ENGINE',
        action: 'ROOT_CAUSE_ISOLATED',
        details: 'cfg-1003 isolated as true root cause with 98.6% confidence.',
        severity: 'MEDIUM'
      },
      {
        id: 'aud-003',
        timestamp: '2026-11-01T10:42:05Z',
        actor: 'AI_DECOY_FILTER',
        action: 'DECOY_DISQUALIFIED',
        details: 'cfg-2001 rejected via temporal and topological graph criteria.',
        severity: 'LOW'
      },
      {
        id: 'aud-004',
        timestamp: '2026-11-01T10:45:10Z',
        actor: 'Alex Mercer (SRE)',
        action: 'VIEW_RECOVERY_SIMULATION',
        details: 'Simulated Monte Carlo recovery for Quick Rollback.',
        severity: 'LOW'
      },
      {
        id: 'aud-005',
        timestamp: '2026-11-01T11:00:20Z',
        actor: 'Sashika K N (Admin)',
        action: 'ADMIN_LOGIN',
        details: 'Admin session initiated via token authentication.',
        severity: 'MEDIUM'
      }
    ];

    this.initialized = true;
    console.log(`[CASCADE DataStore] Initialized successfully with ${this.services.length} services and ${this.configChanges.length} config changes.`);
  }

  // Recovery execution
  applyRecovery(strategy) {
    if (this.incidents.length > 0) {
      this.incidents[0].status = 'RESOLVED';
      this.incidents[0].notes.push({
        author: 'Alex Mercer (Lead SRE)',
        timestamp: new Date().toISOString(),
        text: `Executed ${strategy.toUpperCase()} recovery action. Rollback cfg-1003 applied. All 17 microservices recovering.`
      });
    }

    // Update all services to healthy
    this.services = this.services.map(s => ({
      ...s,
      status: 'HEALTHY',
      response_time_ms: Math.round(25 + Math.random() * 20),
      latency_p99_ms: Math.round(45 + Math.random() * 25),
      error_rate: 0.01,
      cpu_usage: Math.round(28 + Math.random() * 15)
    }));

    return {
      status: 'success',
      recoveredServices: 17,
      incidentStatus: 'RESOLVED',
      timestamp: new Date().toISOString()
    };
  }

  // Rollback / Re-open recovery state for before-and-after testing
  rollbackRecovery() {
    if (this.incidents.length > 0) {
      this.incidents[0].status = 'INVESTIGATING';
      this.incidents[0].notes.push({
        author: 'Alex Mercer (Lead SRE)',
        timestamp: new Date().toISOString(),
        text: 'Reverted recovery testing state. Incident re-opened for before/after comparison.'
      });
    }

    this.services = this.dependencies.nodes.map(node => ({
      ...node,
      status: 'CRITICAL_OUTAGE',
      cpu_usage: 94.5,
      memory_usage: 92.1,
      response_time_ms: 1850.0,
      latency_p99_ms: 3200.0,
      request_count: 2400,
      error_rate: 34.2
    }));

    this.services = this.services.map(s => {
      if (s.id === 'logging-aggregator') {
        return { ...s, status: 'HEALTHY', response_time_ms: 22.0, latency_p99_ms: 38.0, error_rate: 0.0, cpu_usage: 28.0 };
      }
      if (s.id === 'cache-cluster') {
        return { ...s, status: 'DEGRADING', response_time_ms: 45.0, latency_p99_ms: 120.0, error_rate: 3.2, cpu_usage: 74.0 };
      }
      return { ...s, status: 'CRITICAL_OUTAGE' };
    });

    return {
      status: 'reopened',
      incidentStatus: 'INVESTIGATING',
      timestamp: new Date().toISOString()
    };
  }

  // Real Dependency-based What-If Chaos simulation via Directed Graph Traversal (BFS)
  injectChaos(targetService, failureType, intensity = 'HIGH') {
    const visited = new Set();
    const queue = [{ id: targetService, hop: 0 }];
    const propagationPath = [];
    const maxHops = intensity === 'LOW' ? 1 : intensity === 'MEDIUM' ? 2 : 10;

    visited.add(targetService);
    propagationPath.push({
      serviceId: targetService,
      hop: 0,
      role: 'Fault Origin',
      status: 'CRITICAL_OUTAGE'
    });

    while (queue.length > 0) {
      const { id, hop } = queue.shift();
      if (hop < maxHops) {
        // Traverse directed edges where edge.source === id
        const downstreamEdges = (this.dependencies.edges || []).filter(e => e.source === id);
        for (const edge of downstreamEdges) {
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            queue.push({ id: edge.target, hop: hop + 1 });
            propagationPath.push({
              serviceId: edge.target,
              hop: hop + 1,
              viaEdge: edge.type,
              edgeWeight: edge.weight,
              status: (hop + 1 === 1 && intensity !== 'LOW') ? 'CRITICAL_OUTAGE' : 'DEGRADING'
            });
          }
        }
      }
    }

    const affected = Array.from(visited);
    const collapseSec = intensity === 'HIGH' ? 45 : intensity === 'MEDIUM' ? 180 : 420;
    const sloProbability = intensity === 'HIGH' ? 0.994 : intensity === 'MEDIUM' ? 0.64 : 0.12;

    const targetNode = this.services.find(s => s.id === targetService);
    const targetName = targetNode ? targetNode.name : targetService;

    // Service-specific tailored mitigation recommendation
    const mitigation = targetService === 'network-gateway'
      ? `Rollback proxy_read_timeout_ms (cfg-1003) and apply token-bucket ingress rate limiting to shield downstream auth-service.`
      : targetService === 'auth-service'
      ? `Expand worker thread pool and trip circuit breaker on token validation queue to avoid upstream gateway queue stall.`
      : targetService === 'payments-service'
      ? `Revert connection pool saturation and enable asynchronous payment escrow queue to isolate database connection shock.`
      : targetService === 'checkout-service'
      ? `Release distributed Saga locks and buffer checkout payloads to Kafka DLQ until downstream payments recover.`
      : `Deploy circuit breaker on ${targetName} (${targetService}) and decouple inter-service RPC timeout thresholds.`;

    const impactMetrics = {
      p99LatencyMs: intensity === 'HIGH' ? 3850 : intensity === 'MEDIUM' ? 1650 : 340,
      errorRatePct: intensity === 'HIGH' ? 68.0 : intensity === 'MEDIUM' ? 24.5 : 4.2,
      rpsDropPct: intensity === 'HIGH' ? 82 : intensity === 'MEDIUM' ? 35 : 8,
      circuitBreakerTripped: intensity !== 'LOW',
      isolationHopsReached: Math.min(maxHops, 4)
    };

    return {
      simulationId: `SIM-${Date.now().toString().slice(-4)}`,
      targetService,
      targetServiceName: targetName,
      failureType,
      intensity,
      blastRadiusCount: affected.length,
      affectedServices: affected,
      propagationPath,
      projectedCollapseSeconds: collapseSec,
      predictedSLOViolationProbability: sloProbability,
      impactMetrics,
      mitigationAction: mitigation,
      timestamp: new Date().toISOString()
    };
  }
}

export const store = new DataStore();
